import { Vector3, Sphere, Box3, Euler, Quaternion, Spherical } from 'three';

import Capsule from './capsule';
import { Axis } from './settings';
import { States } from './constants';

const { PI } = Math;
const safeProps = ['radius', 'height', 'normal', 'center', 'start', 'end'];

const roleMap = new Map([
  ['arm', { axis: Axis.z, rotationCenter: 'start' }],
  ['joint', { axis: Axis.z, rotationCenter: 'center' }],
  ['object', { axis: Axis.y, rotationCenter: 'center' }],
]);

class Collider {
  #enabled = true;

  #center = new Vector3();

  #v1 = new Vector3();

  #v2 = new Vector3();

  #bounds = null;

  constructor(object, bounds, size = {}, stats = {}, role = 'object') {
    this.object = object;
    this.#bounds = bounds;
    this.size = size;
    this.stats = stats;

    const { rotationCenter, axis } = roleMap.get(role);
    this.rotationCenter = rotationCenter;
    this.axis = axis;

    if (bounds instanceof Capsule) {
      this.shape = 'capsule';
    } else if (bounds instanceof Sphere) {
      this.shape = 'sphere';
    } else if (bounds instanceof Box3) {
      this.shape = 'aabb';
    }

    const euler = new Euler(PI * 0.5, 0, 0);
    const quat = new Quaternion().setFromEuler(euler);

    if (this.shape === 'capsule' && this.axis === Axis.z) {
      this.#v1.set(0, this.#bounds.height * 0.5, 0);
      this.#bounds.translate(this.#v1);

      this.#bounds.setRotation(quat, Axis.y, 'start');
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

  getCenter(target, rotationCenter = 'center') {
    if (this.shape === 'sphere') {
      return target.copy(this.#bounds.center);
    }

    if (this.shape === 'capsule' || this.shape === 'aabb') {
      if (rotationCenter === 'start') {
        return target.copy(this.#bounds.start);
      }

      return this.#bounds.getCenter(target);
    }

    return undefined;
  }

  getBoundingBox(box) {
    if (this.shape === 'capsule' || this.shape === 'sphere') {
      this.#bounds.getBoundingBox(box);
    } else if (this.shape === 'aabb') {
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
    if (this.shape === 'capsule' || this.shape === 'aabb') {
      this.getCenter(this.#v1, this.rotationCenter);

      this.#v2.subVectors(vec, this.#v1);
      this.#bounds.translate(this.#v2);
    } else if (this.shape === 'sphere') {
      this.#v1.subVectors(vec, this.#bounds.center);
      this.#bounds.translate(this.#v1);
    }
  }

  moveBy(vec) {
    if (this.shape === 'capsule') {
      this.#bounds.translate(vec);
    } else if (this.shape === 'sphere') {
      this.#bounds.center.add(vec);
    } else if (this.shape === 'aabb') {
      this.#bounds.translate(vec);
    }
  }

  setCapsuleRotation(quaternion) {
    this.#bounds.setRotation(quaternion, this.axis, this.rotationCenter);
  }
}

export default Collider;
