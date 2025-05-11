import { Box3, Vector3 } from 'three';

import Publisher from '../publisher';
import { genId, getVerticesPos } from './utils';
import Updater from './updater';

function chainUpdater() {
  this.start();
}

class Movable extends Publisher {
  #currentPos = new Vector3();

  #prevPos = new Vector3();

  constructor(name) {
    super();

    this.id = genId('movable');
    this.name = name;

    this.deltaPos = new Vector3();
    this.velocity = new Vector3(); /// ////////

    this.geometry = null;
    this.offset = 0;
    this.count = 0;
    this.object = null;

    this.updaters = [];
  }

  setGeometry(geometry, offset, count, object) {
    this.geometry = geometry;
    this.offset = offset;
    this.count = count;
    this.object = object;
  }

  visible(bool = true) {
    //
  }

  clearObject() {
    this.geometry = null;
    this.offset = 0;
    this.count = 0;
    this.object = null;
  }

  dispose() {
    this.params = null;
    this.deltaPos.set(0, 0, 0);

    this.clearObject();
    this.clear('chain-updater');
  }

  setUpdaters(updaters) {
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

  update(deltaTime) {
    for (let i = 0, l = this.updaters.length; i < l; i += 1) {
      const updater = this.updaters[i];
      updater.update(deltaTime);
    }

    const positions = this.geometry.getAttribute('position').array;
    const index = this.offset * 3;
    const [x, y, z] = positions.subarray(index, index + 3);
    this.#currentPos.set(x, y, z);

    this.deltaPos.subVectors(this.#currentPos, this.#prevPos); /// ///////
    this.velocity.copy(this.deltaPos).divideScalar(deltaTime); /// //////////
    this.#prevPos.copy(this.#currentPos);
  }
}

export default Movable;
