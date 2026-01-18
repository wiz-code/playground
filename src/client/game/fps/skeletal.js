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
  States,
  Events,
  Keyframes,
  Posings,

  Clips,//////////
  AnimationClips,////////////
  KeyPoses,///////////
} from './data/skeletals';
import { Axis } from './settings';

const { PI } = Math;
const rotationCoef = 1;

class Skeletal {
  #quat = new Quaternion();

  constructor(name, clips, object, collidable) {
    this.name = name;
    this.object = object;
    this.collidable = collidable;
    this.options = new Map();

    this.transform = {
      quaternion: new Quaternion(),
      position: new Vector3(),
    };
    this.prevTransform = {
      quaternion: new Quaternion(),
      position: new Vector3(),
    };

    this.mixer = new AnimationMixer(this.transform);
    this.clips = [];

    for (let i = 0, l = clips.length; i < l; i += 1) {
      const clipName = clips[i];

      if (AnimationClips.has(clipName)) {
        const { parts, relative = false, keyframes } = AnimationClips.get(clipName);

        if (parts.includes(name)) {
          const kfMap = new Map();

          for (let j = 0, m = keyframes.length; j < m; j += 1) {
            const { state, time } = keyframes[j];

            if (KeyPoses.has(name)) {
              const tfMap = KeyPoses.get(name);

              if (tfMap.has(state)) {
                const transforms = tfMap.get(state);

                for (let k = 0, n = transforms.length; k < n; k += 1) {
                  const { key, value } = transforms[k];

                  if (!kfMap.has(key)) {
                    kfMap.set(key, { times: [], values: [] });
                  }

                  if (key.includes('.quaternion')) {
                    const { times, values } = kfMap.get(key);
                    times.push(time);

                    const rx = value.x ?? 0;
                    const ry = value.y ?? 0;
                    const rz = value.z ?? 0;
                    const euler = new Euler(rx, ry, rz);
                    const quat = new Quaternion().setFromEuler(euler);
                    values.push(quat);
                  } else if (key.includes('.position')) {
                    // TODO
                  }
                }
              }
            }
          }

          const tracks = [];

          kfMap.forEach(({ times, values }, key) => {
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
          });

          const animeName = `clip:${clipName}:${name}`;
          const animeClip = new AnimationClip(animeName, -1, tracks);

          this.options.set(animeClip, { relative });
          this.clips.push(animeClip);
        }
      }
    } 
  }

  dispatchClip(name, loop = false) {
    if (Events.has(name)) {
      const { relative } = AnimationClips.get(name)
      const clipName = `clip:${name}:${this.name}`;
      const clip = AnimationClip.findByName(this.clips, clipName);

      if (clip != null) {
        const action = this.mixer.clipAction(clip);
        action.loop = loop === true ? LoopRepeat : LoopOnce;
        action.timeScale = 0.1;///////////////
        action.play();
      }
    }
  }

  update(deltaTime) {
    if (this.object.isAlive()) {
      this.mixer.update(deltaTime);
      let finished = true;

      for (let i = 0, l = this.clips.length; i < l; i += 1) {
        const clip = this.clips[i];
        const action = this.mixer.existingAction(clip);

        if (action != null && action.isRunning()) {
          finished = false;
          const { quaternion, position } = this.transform;
          const { quaternion: prevQuat, position: prevPos } = this.prevTransform;
          const { relative } = this.options.get(clip);

          if (!quaternion.equals(prevQuat)) {
            if (relative) {
              this.#quat.copy(prevQuat).conjugate();
              this.#quat.multiply(quaternion).normalize();

              this.collidable.rotateBy(this.#quat);
            } else {
              this.collidable.setRotation(quaternion);
            }

            prevQuat.copy(quaternion);
          }

          if (!position.equals(prevPos)) {
            // TODO
          }
        }
      }

      if (finished) {
        this.mixer.stopAllAction();
      }
    }
  }
}

export default Skeletal;
