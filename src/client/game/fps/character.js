import {
  Vector3,
  Quaternion,
  Euler,
  /* */ Spherical,
  /* */ BufferGeometry,
  Mesh,
  Points,
} from 'three';

import { createArrow } from './create-object';
import { Actions, States, InputKeys, MashKeys, Pointers } from './constants';
import { Characters } from './data/entities';
import Entity from './entity';
import Collidable from './collidable';
import { Game } from '../settings';
import { World, Axis, Controls, InitialDir } from './settings';
import { getGridPos, getVectorPos } from './utils';

const { floor, sign, random, min, max, PI } = Math;
const { EPS, RAD30 } = Game;

const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);
const easeInQuad = (x) => x * x;

const q1 = new Quaternion().setFromEuler(new Euler(PI * 0.5, 0, 0)); /// //////////////
const q2 = new Quaternion(); /// //////////////

class Character extends Entity {
  #isGrounded = false;

  #fallingDistance = 0;

  #move = new Vector3();

  #pos = new Vector3();

  #rot = new Euler();

  #v1 = new Vector3();

  #v2 = new Vector3();

  constructor(game, name, subtype) {
    super(game, name, 'character', subtype, Characters);

    this.collidable = new Collidable(this, null, this.data.collidable);
    Collidable.init(this.collidable);
    this.hide();
  }

  setAlive(bool = true) {
    super.setAlive(bool);

    if (this.hasControls) {
      return;
    }

    if (bool) {
      this.show();
    } else {
      this.hide();
    }
  }

  dispose() {
    super.dispose();

    this.collidable = null;
  }

  isGrounded() {
    return this.#isGrounded;
  }

  setGrounded(bool) {
    this.#isGrounded = bool;
  }

  resetCoords() {
    Collidable.init(this.collidable);
    this.velocity.set(0, 0, 0);
    this.#fallingDistance = 0;
  }

  getFallingDistance() {
    return this.#fallingDistance;
  }

  update(deltaTime, elapsedTime, damping) {
    super.update(deltaTime, elapsedTime);

    const { velocity } = this;

    if (!this.#isGrounded) {
      const falling = World.gravity * deltaTime;
      velocity.y -= falling;

      if (velocity.y < 0) {
        this.#fallingDistance -= velocity.y * deltaTime;
      }
    } else {
      this.#fallingDistance = 0;
    }

    // 減衰処理
    const deltaDamping = this.#isGrounded ? damping.ground : damping.air;

    // 移動の減衰
    velocity.addScaledVector(velocity, deltaDamping);
    const lengthSq = velocity.lengthSq();

    if (lengthSq < EPS ** 2) {
      velocity.set(0, 0, 0);
    }

    if (this.platform != null) {
      this.#v1.copy(velocity);
      this.#v1.add(this.platform.velocity);
      this.#move.copy(this.#v1).multiplyScalar(deltaTime);
    } else {
      this.#move.copy(velocity).multiplyScalar(deltaTime);
    }

    this.position.add(this.#move);
    this.collidable.traverse(({ collider }) => {
      collider.moveBy(this.#move);
    });
  }

  postUpdate(deltaTime) {
    super.postUpdate(deltaTime);

    const { body, collider } = this.collidable;
    /// //////////
    if (!this.hasControls) {
      this.collidable.traverse((col) => {
        col.collider.getCenter(this.#pos, col.type === 'arm');
        col.mesh.position.copy(this.#pos);
        q2.multiplyQuaternions(col.quaternion, q1);
        col.mesh.quaternion.copy(q2);
      });
    }
    /// ///////////////
    this.collidable.body.position.copy(this.position);
    this.collidable.updateRotation();

    if (this.isAlive()) {
      const rot = deltaTime * this.data.stats.satelliteSpeed;
      this.collidable.traverse(({ type, satellite }, depth) => {
        if (satellite != null) {
          const coef = depth % 2 === 0 ? -1 : 1;

          if (type === 'joint' || type === 'arm') {
            satellite.rotation.z += rot * coef;
          } else {
            satellite.rotation.y += rot * coef;
          }
        }
      });
    }
  }
}

export default Character;
