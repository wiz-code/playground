import { Vector3, Euler, Quaternion, Group } from 'three';

import EventDispatcher from './event-dispatcher';
import { genId, disposeObject, getRandomDistance } from './utils';
import { States } from './constants';
import { Game } from '../settings';
import { InitialDir, Axis, World } from './settings';
import Updater from './updater';

class Entity extends EventDispatcher {
  #states = new Set();

  #vec = new Vector3();

  #euler = new Euler();

  #quat = new Quaternion();

  #pos = new Vector3();

  #randVec = new Vector3();

  #lapTimer = false;

  #lapTime = 0;

  #stunningElapsedTime = 0;

  #stunningDuration = 0;

  #center = new Vector3();

  constructor(game, name, type, subtype, source) {
    super();

    this.id = genId(type);
    this.game = game;
    this.name = name;
    this.type = type;
    this.subtype = subtype;

    const dataMap = new Map(source);
    this.data = dataMap.get(subtype);

    this.params = {};

    this.platform = null;

    this.hasControls = false;
    this.position = new Vector3();
    this.rotation = new Quaternion();
    this.velocity = new Vector3();/////////
    this.collidable = null;
    this.updaters = [];
  }

  setCoords(coords = {}) {
    const { position, rotation } = coords;

    if (this.collidable == null) {
      return;
    }

    if (rotation != null) {
      this.setRotation(rotation);
    }

    if (position != null) {
      this.setPosition(position);
    }
  }

  setRotation(rotation = {}) {
    const x = rotation.x ?? 0;
    const y = rotation.y ?? 0;
    const z = rotation.z ?? 0;

    this.#euler.set(x, y, z);
    this.#quat.setFromEuler(this.#euler);
    this.rotation.copy(this.#quat);

    this.collidable.applyRotation();
  }

  setPosition(position = {}) {
    const x = (position.x ?? 0) * World.spacing;
    const y = (position.y ?? 0) * World.spacing;
    const z = (position.z ?? 0) * World.spacing;

    this.#vec.set(x, y, z);
    this.#vec.sub(this.position);
    this.position.set(x, y, z);

    this.collidable.traverse(({ collider }) => {
      collider.moveBy(this.#vec);
    });
  }

  rotateBy(delta = new Quaternion()) {
    this.rotation.multiply(delta);
  }

  show(coords) {
    if (coords == null) {
      this.setCoords({ position: this.#pos })
    } else {
      this.setCoords(coords);
    }
  }

  hide() {
    this.#pos.copy(this.position);
    getRandomDistance(Game.longDistance, this.#randVec);
    this.setCoords({ position: this.#randVec });
  }

  getLapTime() {
    return this.#lapTime;
  }

  resetLapTime() {
    this.#lapTime = 0;
  }

  lapStart(reset = false) {
    if (reset) {
      this.resetLapTime();
    }

    this.#lapTimer = true;
  }

  lapStop() {
    this.#lapTimer = false;
  }

  getStates() {
    return this.#states;
  }

  hasState(state) {
    return this.#states.has(state);
  }

  addState(state) {
    this.#states.add(state);
  }

  deleteState(state) {
    this.#states.delete(state);
  }

  isAlive() {
    return this.#states.has(States.alive);
  }

  setAlive(bool = true) {
    if (bool) {
      if (!this.#states.has(States.alive)) {
        this.#states.add(States.alive);
        this.publish('add-collider', this);
      }
    } else if (this.#states.has(States.alive)) {
      this.#states.delete(States.alive);
      this.publish('remove-collider', this);
    }
  }

  vanish() {
    this.hide();
    this.setAlive(false);
  }

  isStunning() {
    return this.#states.has(States.stunning);
  }

  setStunning(duration) {
    if (!this.#states.has(States.stunning)) {
      this.#states.add(States.stunning);
      this.#stunningElapsedTime = 0;
      this.#stunningDuration = duration;
    }
  }

  // 関数が渡された場合、実行結果を返す
  setParams(params) {
    if (typeof params === 'function') {
      this.params = params(this);
      return;
    }

    this.params = { ...params };
  }

  setUpdaters(updaters) {
    // Movableクラスと同じメソッド
    for (let i = 0, l = updaters.length; i < l; i += 1) {
      const { name, updater: updaterName, params, options } = updaters[i];
      const updater = new Updater(this, name, updaterName, params, options);
      this.updaters.push(updater);
    }

    for (let i = 0, l = this.updaters.length; i < l; i += 1) {
      const updater = this.updaters[i];

      for (let j = 0, m = updater.chain.length; j < m; j += 1) {
        const chain = updater.chain[j];
        const next = this.updaters.find((value) => value.name === chain);

        if (next != null) {
          if (!next.autoStart) {
            next.enable(false);
          }

          next.repeat = false;
          updater.subscribe('chain-updater', chainUpdater.bind(next));
        }
      }
    }
  }

  startAnimation(clipName) {
    if (this.collidable != null) {
      this.collidable.traverse(({ name, skeletal }) => {
        if (skeletal != null) {
          skeletal.dispatchClip(clipName);
        }
      });
    }
  }

  dispose() {
    // リスナーを全削除
    this.clear();
    this.clear('chain-updater');
  }

  preUpdate(deltaTime) {
    if (this.#lapTimer) {
      this.#lapTime += deltaTime;
    }

    if (this.#states.has(States.stunning)) {
      this.#stunningElapsedTime += deltaTime;

      if (this.#stunningDuration <= this.#stunningElapsedTime) {
        this.#states.delete(States.stunning);
        this.#stunningElapsedTime = 0;
      }
    }
  }

  postUpdate(deltaTime) {
    //
  }

  update(deltaTime, elapsedTime) {
    super.update(deltaTime, elapsedTime);

    if (this.collidable != null) {
      this.collidable.traverse((col) => {
        const { skeletal, velocity, collider, data: { prevCenter } } = col;
        if (skeletal != null) {
          skeletal.update(deltaTime);
          col.applyRotation();////////
        }

        //col.applyRotation();

        collider.getCenter(this.#center);
        velocity.subVectors(this.#center, prevCenter).divideScalar(deltaTime);
        prevCenter.copy(this.#center);
      });
    }

    for (let i = 0, l = this.updaters.length; i < l; i += 1) {
      const updater = this.updaters[i];
      updater.update(deltaTime);
    }
  }
}

export default Entity;
