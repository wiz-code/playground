import { Vector3, Sphere, Box3, Euler, Quaternion, Spherical } from 'three';

import Capsule from './capsule';
import { States } from './constants';

const { PI } = Math;
const safeProps = ['radius', 'height', 'normal', 'center', 'start', 'end'];

class Collider {
  #enabled = true;

  #center = new Vector3();

  #v1 = new Vector3();

  #v2 = new Vector3();

  #v3 = new Vector3();

  #size = new Vector3();

  #bounds = null;

  constructor(object, bounds, stats = {}, role = 'object') {
    this.object = object;
    this.#bounds = bounds;
    this.stats = stats;

    this.role = role;

    if (bounds instanceof Capsule) {
      this.type = 'capsule';
    } else if (bounds instanceof Sphere) {
      this.type = 'sphere';
    } else if (bounds instanceof Box3) {
      this.type = 'aabb';
    }

    if (role === 'arm') {
      this.#v1.set(0, this.#bounds.height * 0.5, 0);
      this.#bounds.translate(this.#v1);
    }
  }

  isEnabled() {
    return this.#enabled;
  }

  enable(bool = true) {
    this.#enabled = bool;
  }

  getBounds() {
    return this.#bounds;
  }

  copyTo(target) {
    target.copy(this.#bounds);
  }

  getProp(name) {
    if (safeProps.includes(name)) {
      return this.#bounds[name];
    }

    return undefined;
  }

  getCenter(target, ofRotation = false) {
    if (this.type === 'sphere') {
      return target.copy(this.#bounds.center);
    }

    if (this.type === 'capsule' || this.type === 'aabb') {
      if (ofRotation) {
        return target.copy(this.#bounds.start);
      }

      return this.#bounds.getCenter(target);
    }

    return undefined;
  }

  getBoundingBox(box) {
    if (this.type === 'capsule' || this.type === 'sphere') {
      this.#bounds.getBoundingBox(box);
    } else if (this.type === 'aabb') {
      box.copy(this.#bounds);
    }
  }

  getPropX(param) {
    return this.#bounds[param].x;
  }

  getPropY(param) {
    return this.#bounds[param].y;
  }

  getPropZ(param) {
    return this.#bounds[param].z;
  }

  moveTo(vec) {
    if (this.type === 'capsule' || this.type === 'aabb') {
      this.getCenter(this.#v1, this.role === 'arm');

      this.#v2.subVectors(vec, this.#v1);
      this.#bounds.translate(this.#v2);
    } else if (this.type === 'sphere') {
      this.#v1.subVectors(vec, this.#bounds.center);
      this.#bounds.translate(this.#v1);
    }
  }

  moveBy(vec) {
    if (this.type === 'capsule') {
      this.#bounds.translate(vec);
    } else if (this.type === 'sphere') {
      this.#bounds.center.add(vec);
    } else if (this.type === 'aabb') {
      this.#bounds.translate(vec);
    }
  }

  rotateCapsule(quaternion) {
    this.#bounds.rotate(quaternion, this.role);
  }
}

export default Collider;
