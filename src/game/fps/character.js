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

  #quat = new Quaternion();

  #rot = new Euler();

  #v1 = new Vector3();

  #v2 = new Vector3();

  constructor(game, name, subtype) {
    super(game, name, 'character', subtype, Characters);

    this.deltaTheta = 0;

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
    super.update(deltaTime, elapsedTime, damping);

    if (!this.#isGrounded) {
      const falling = World.gravity * deltaTime;
      this.velocity.y -= falling;
    }

    // 減衰処理
    const deltaDamping = this.#isGrounded ? damping.ground : damping.air;

    // 回転の減衰
    if (this.angularVel !== 0) {
      this.angularVel += this.angularVel * damping.spin;

      if (
        (this.angularVel > 0 && this.angularVel < EPS) ||
        (this.angularVel < 0 && this.angularVel > -EPS)
      ) {
        this.angularVel = 0;
      }

      this.deltaTheta = this.angularVel * deltaTime;
    }

    if (this.deltaTheta !== 0) {
      this.#quat.setFromAxisAngle(Axis.y, this.deltaTheta); /// //
      this.collidable.updateDeltaRotation(this.#quat); /// //

      if (this.hasControls) {
        this.publish('onRotate', this.collidable.quaternion, this.deltaTheta);
      }
    }

    this.deltaTheta = 0;

    // 移動の減衰
    this.velocity.addScaledVector(this.velocity, deltaDamping);
    const lengthSq = this.velocity.lengthSq();

    if (lengthSq < EPS ** 2) {
      this.velocity.set(0, 0, 0);
    }

    if (this.velocity.y < 0) {
      this.#fallingDistance += this.#move.y;
    } else {
      this.#fallingDistance = 0;
    }

    this.#v1.copy(this.velocity);

    if (this.platform != null) {
      this.#v2.copy(this.platform.velocity);
      this.#v1.add(this.#v2);
    } else if (this.#v2.x !== 0 || this.#v2.y !== 0 || this.#v2.z !== 0) {
      this.#v1.add(this.#v2);
      this.#v2.set(0, 0, 0);
    }

    this.#move.copy(this.#v1).multiplyScalar(deltaTime);
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
        col.collider.getCenter(this.#pos, col.role === 'arm');
        col.mesh.position.copy(this.#pos);
        q2.multiplyQuaternions(col.quaternion, q1);
        col.mesh.quaternion.copy(q2);
      });
    }
    /// ///////////////
    collider.getCenter(this.#pos);
    body.position.copy(this.#pos);
    body.quaternion.copy(this.collidable.quaternion);

    if (this.isAlive()) {
      this.collidable.traverse(({ body, collider }) => {
        const points = body.getObjectByName('points');
        // points.rotation.y -= deltaTime * this.data.stats.satelliteSpeed;
      });
    }
  }
}

export default Character;
