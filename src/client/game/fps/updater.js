import { Vector3, Spherical, Group } from 'three';

import Publisher from '../publisher';
import { genId } from './utils';
import Updaters from './data/updaters';

const updaterMap = new Map(Updaters);

class Updater extends Publisher {
  #enabled = false;

  constructor(object, name, updater, params = {}, options = {}) {
    super();

    this.id = genId('updater');
    this.name = name;
    this.object = object;
    this.updater = updaterMap.get(updater);

    this.params = { ...params };

    this.currentTime = 0;
    this.progress = 0;
    this.direction = 1;
    this.count = 0;
    this.deltaProgress = 0;

    if (typeof options.chain === 'string') {
      this.chain = [options.chain];
    } else if (Array.isArray(options.chain)) {
      this.chain = options.chain;
    } else {
      this.chain = [];
    }

    this.duration = options.duration ?? 0;
    this.autoStart = options.autoStart ?? false;
    this.repeat = options.repeat ?? false;
    this.alternate = options.alternate ?? false;
    this.reverse = options.reverse ?? false;
    this.onStart =
      typeof options.onStart === 'function' ? options.onStart.bind(this) : null;
    this.onEnd =
      typeof options.onEnd === 'function' ? options.onEnd.bind(this) : null;

    this.enable(this.autoStart);
  }

  isEnabled() {
    return this.#enabled;
  }

  enable(bool = true) {
    this.#enabled = bool;
  }

  dispose() {
    // リスナーを全削除
    this.clear();
  }

  reset() {
    this.currentTime = 0;
    this.count = 0;
  }

  start() {
    this.reset();
    this.#enabled = true;
  }

  pause() {
    this.#enabled = false;
  }

  resume() {
    this.#enabled = true;
  }

  stop() {
    this.reset();
    this.#enabled = false;
  }

  update(deltaTime) {
    if (!this.#enabled) {
      return;
    }

    if (deltaTime === 0 || this.duration === 0) {
      return;
    }

    if (this.currentTime === 0 && this.count === 0) {
      this.count = !this.alternate ? 1 : 2;
      this.direction = !this.reverse ? 1 : -1;

      if (this.onStart != null) {
        this.onStart(
          this.object,
          this.params,
          this.direction,
          this.progress,
          this.deltaProgress,
        );
      }
    }

    this.currentTime += deltaTime;
    this.deltaProgress = deltaTime / this.duration;

    const progress = this.currentTime / this.duration;
    this.progress = this.direction === 1 ? progress : 1 - progress;

    if (this.progress < 0) {
      this.progress = 0;
    } else if (this.progress > 1) {
      this.progress = 1;
    }

    this.updater(
      this.object,
      this.params,
      this.direction,
      this.progress,
      this.deltaProgress,
    );

    if (this.progress === 0 || this.progress === 1) {
      this.count -= 1;

      if (this.count === 0) {
        this.currentTime = 0;

        if (this.repeat) {
          if (this.alternate) {
            this.direction *= -1;
          }
        } else {
          this.#enabled = false;
        }

        if (this.onEnd != null) {
          this.onEnd(
            this.object,
            this.params,
            this.direction,
            this.progress,
            this.deltaProgress,
          );
        }

        if (this.getSubscriberCount('chain-updater') > 0) {
          this.#enabled = false;
          this.publish('chain-updater');
        }
      } else {
        this.currentTime = 0;

        if (this.alternate) {
          this.direction *= -1;
        }
      }
    }
  }
}

export default Updater;
