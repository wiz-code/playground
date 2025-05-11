import {
  Vector3,
  Spherical,
  Euler,
  Quaternion,
  QuaternionKeyframeTrack,
  VectorKeyframeTrack,
  AnimationMixer,
  AnimationClip,
  LoopOnce,
  LoopRepeat,
  InterpolateSmooth,
} from 'three';

import {
  Commands,
  States,
  Events,
  Keyframes,
  ProcessingOrder,
  Posings,
  ActionTimes,
} from './data/skeletals';
import { Axis } from './settings';

const { PI } = Math;
const rotationCoef = 1;

class Skeletal {
  #deltaQuat = new Quaternion();

  #prevQuat = new Quaternion();

  constructor(name, object, collidable, options = {}) {
    this.name = name;
    this.object = object;
    this.collidable = collidable;
    this.options = options;

    this.keys = new Set();
    this.transform = {
      quaternion: new Quaternion(),
    };

    this.mixer = new AnimationMixer(this.transform);
    this.clips = [];

    this.states = new Set(); /// ///////

    if (Posings.has(this.name)) {
      const posingMap = Posings.get(this.name);

      for (const [command, data] of Keyframes) {
        const { times, states } = data;
        const results = new Map();

        for (let i = 0, l = times.length; i < l; i += 1) {
          const state = states[i];
          const posings = posingMap.get(state);

          for (let j = 0, m = posings.length; j < m; j += 1) {
            const posing = posings[j];
            const {
              key,
              transform: { rotation },
            } = posing;
            this.keys.add(key);

            if (key.includes('.quaternion')) {
              if (!results.has(key)) {
                results.set(key, []);
              }

              if (rotation != null) {
                const rx = rotation.x ?? 0;
                const ry = rotation.y ?? 0;
                const rz = rotation.z ?? 0;
                const euler = new Euler(rx, ry, rz);
                const quat = new Quaternion().setFromEuler(euler);

                const values = results.get(key);
                values.push(quat);
              }
            } else if (key.includes('.position')) {
              if (!results.has(key)) {
                results.set(key, []);
              }
            }
          }
        }

        const tracks = [];

        for (const [key, values] of results) {
          let track;

          if (key.includes('.quaternion')) {
            track = new QuaternionKeyframeTrack(
              key,
              times,
              values.map((quat) => quat.toArray()).flat(),
            );
          } else if (key.includes('.position')) {
            track = new VectorKeyframeTrack(
              key,
              times,
              values.map((vec) => vec.toArray()).flat(),
            );
          }

          tracks.push(track);
        }

        const clipName = `command-${command}:${name}`;
        const clip = new AnimationClip(clipName, -1, tracks);

        this.clips.push(clip);
      }
    }
  }

  dispatchCommand(command) {
    if (Events.has(command)) {
      const clipName = `command-${command}:${this.name}`;
      const clip = AnimationClip.findByName(this.clips, clipName);

      if (clip != null) {
        const action = this.mixer.clipAction(clip);
        const loop = this.options.loop === true ? LoopRepeat : LoopOnce;
        action.loop = loop;
        action.play();
      }
    }
  }

  update(deltaTime) {
    if (this.object.isAlive()) {
      this.mixer.update(deltaTime);
      let finished = false;

      for (let i = 0, l = this.clips.length; i < l; i += 1) {
        const clip = this.clips[i];
        const action = this.mixer.existingAction(clip);

        if (action != null && action.isRunning()) {
          const { body } = this.collidable;
          const { quaternion } = this.transform;

          for (const key of this.keys) {
            if (key.includes('.quaternion')) {
              // body.quaternion.copy(quaternion);

              if (!quaternion.equals(this.#prevQuat)) {
                this.#deltaQuat.copy(quaternion);
                this.#deltaQuat.multiply(this.#prevQuat.conjugate());

                this.collidable.updateDeltaRotation(this.#deltaQuat);
                this.#prevQuat.copy(quaternion);

                body.quaternion.multiply(this.#deltaQuat);
              }
            } else if (key.includes('.position')) {
              // TODO
            }
          }
        } else {
          finished = true;
        }
      }

      if (finished) {
        this.mixer.stopAllAction();
      }
    }
  }
}

export default Skeletal;
