import { Vector3, Spherical, Group } from 'three';

import EventDispatcher from './event-dispatcher';
import { genId, disposeObject, getRandomDistance } from './utils';
import { States } from './constants';
import { Game } from '../settings';
import { InitialDir, Axis, World } from './settings';
import Updater from './updater';

class Entity extends EventDispatcher {
  #states = new Set();

  #vec = new Vector3();

  #pos = new Vector3();

  #randVec = new Vector3();

  #lapTimer = false;

  #lapTime = 0;

  #stunningElapsedTime = 0;

  #stunningDuration = 0;

  #center = new Vector3();

  #prevCenter = new Vector3();

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
    this.collidable = null;
    this.updaters = [];
  }

  setCoords(coords) {
    const { position, rotation } = coords;

    if (this.collidable == null) {
      return;
    }

    const { collider } = this.collidable;

    if (rotation != null) {
      this.collidable.updateRotation(rotation);
    }

    if (position != null) {
      const x = position.x != null ? position.x * World.spacing : 0;
      const y = position.y != null ? position.y * World.spacing : 0;
      const z = position.z != null ? position.z * World.spacing : 0;

      this.#vec.set(x, y, z);
      this.collidable.updatePosition(this.#vec);
    }
  }

  show(coords) {
    if (coords == null && this.collidable != null) {
      this.collidable.updatePosition(this.#pos);
    } else {
      this.setCoords(coords);
    }
  }

  hide() {
    if (this.collidable != null) {
      this.collidable.collider.getCenter(this.#pos);
      getRandomDistance(Game.longDistance, this.#randVec);
      this.collidable.updatePosition(this.#randVec);
    }
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

  startAnimation(command) {
    if (this.collidable != null) {
      this.collidable.traverse(({ skeletal }) => {
        if (skeletal != null) {
          skeletal.dispatchCommand(command);
        }
      });
    }
  }

  dispose() {
    // リスナーを全削除
    this.clear();
    this.clear('chain-updater');
  }

  steer() {}

  preUpdate(deltaTime) {
    if (this.collidable != null) {
      this.collidable.traverse(({ name, parent, velocity, skeletal, collider, prevPos }) => {
        if (skeletal != null) {
          skeletal.update(deltaTime);
        }

        if (parent != null) {
          collider.getCenter(this.#center);
          velocity.subVectors(this.#center, prevPos).divideScalar(deltaTime);
          prevPos.copy(this.#center);
          //this.name === '敵キャラ１' && console.log(name, velocity, velocity.length())
      } 
      });
    }
  }

  postUpdate(deltaTime) {
    //
  }

  update(deltaTime, elapsedTime, damping) {
    super.update(deltaTime, elapsedTime);

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

    this.steer(deltaTime, elapsedTime, damping);

    for (let i = 0, l = this.updaters.length; i < l; i += 1) {
      const updater = this.updaters[i];
      updater.update(deltaTime);
    }
  }
}

export default Entity;
