import {
  Vector3,
  Spherical,
  Euler,
  CapsuleGeometry,
  ConeGeometry,
  EdgesGeometry,
  SphereGeometry,
  CylinderGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
  LineBasicMaterial,
  PointsMaterial,
  NormalBlending,
  Mesh,
  LineSegments,
  Points,
  Group,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

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

class Character extends Entity {
  #forward = new Vector3();

  #sideA = new Vector3();

  #sideB = new Vector3();

  #sideC = new Vector3();

  #isGrounded = false;

  #actions = new Map();

  #stunningElapsedTime = 0;

  #stunningDuration = 0;

  #urgencyElapsedTime = 0;

  #urgencyDuration = 0;

  #deltaPos = new Vector3(0, 0, 0);

  #deltaRot = 0;

  #fallingDistance = 0;

  #arrowDir = new Vector3();

  #prevY = 0;

  #rotVelocity = 0;

  #pos = new Vector3();

  constructor(game, name, subtype) {
    super(game, name, 'character', subtype, Characters);

    this.lookRotation = new Spherical();

    this.camera = null;
    this.arrow = null;

    this.input = this.input.bind(this);
    this.setLookRot = this.setLookRot.bind(this);

    this.collidable = new Collidable(this, null, this.data.collidable);
  }

  isStunning() {
    return this.hasState(States.stunning);
  }

  setStunning(duration) {
    if (!this.hasState(States.stunning)) {
      this.addState(States.stunning);
      this.#stunningDuration = duration;
    }
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

  vanish() {
    this.setAlive(false);
  }

  setControls(camera, controls) {
    this.hasControls = true;
    this.camera = camera;

    if (this.arrow == null) {
      this.arrow = createArrow();
    }

    controls.subscribe('input', this.input);
    controls.subscribe('setLookRot', this.setLookRot);

    this.subscribe('onRotate', controls.onRotate);
    this.subscribe('setBodyRotation', controls.setBodyRotation);
    this.subscribe('onUnsetControls', controls.onUnsetControls);
  }

  unsetControls() {
    this.hasControls = false;
    this.camera = null;

    this.arrow = null;

    this.publish('onUnsetControls');
    this.clear('onRotate');
    this.clear('setBodyRotation');
    this.clear('onUnsetControls');
  }

  setCoords(coords) {
    super.setCoords(coords);
    this.publish('setBodyRotation', this.rotation);
  }

  setLookRot(rot, offset) {
    this.lookRotation.phi = rot.phi;
    this.lookRotation.theta = rot.theta + offset;
  }

  dispose() {
    super.dispose();

    this.unsetControls();
    this.arrow = null;
    this.collidable = null;
  }

  isGrounded() {
    return this.#isGrounded;
  }

  setGrounded(bool) {
    this.#isGrounded = bool;
  }

  resetCoords() {
    this.rotation.phi = 0;
    this.rotation.theta = 0;
    this.velocity.set(0, 0, 0);
    this.direction.copy(InitialDir);
    this.#fallingDistance = 0;
  }

  getFallingDistance() {
    return this.#fallingDistance;
  }

  jump(value = 1) {
    if (this.hasControls) {
      const method = this.game.methods.get('play-sound');
      method?.('jump');
    }

    this.velocity.y = this.data.stats.jumpPower * value;
  }

  moveForward(deltaTime, value, action = -1) {
    let accel;
    const { sprint, moveAccel, airMoveAccel, urgencyMoveAccel } =
      this.data.stats;

    if (this.#isGrounded) {
      if (
        action === Actions.quickMoveForward ||
        action === Actions.quickMoveBackward
      ) {
        accel = moveAccel * urgencyMoveAccel;
      } else if (action === Actions.sprint) {
        accel = sprint * moveAccel;
      } else {
        accel = moveAccel;
      }
    } else {
      accel = airMoveAccel;
    }

    this.#forward.copy(this.direction);
    const side = this.#sideA.crossVectors(this.direction, Axis.y);
    this.#forward.applyAxisAngle(side, sign(-value) * Game.RAD30);

    this.velocity.add(this.#forward.multiplyScalar(accel * value * deltaTime));
  }

  rotate(deltaTime, direction, action = -1) {
    const { urgencyTurn } = World;
    const { turnSpeed, rotAccel } = this.data.stats;

    if (action === Actions.quickTurnLeft || action === Actions.quickTurnRight) {
      this.#rotVelocity = 0;

      const t0 = (this.#urgencyElapsedTime - deltaTime) / this.#urgencyDuration;
      const t1 = this.#urgencyElapsedTime / this.#urgencyDuration;
      const r0 = direction * urgencyTurn * easeOutQuad(t0);
      const r1 = direction * urgencyTurn * easeOutQuad(t1);

      this.#deltaRot = r1 - r0;
    } else {
      this.#rotVelocity += rotAccel * deltaTime * direction;
      this.#rotVelocity = min(max(this.#rotVelocity, -turnSpeed), turnSpeed);
    }
  }

  moveSide(deltaTime, value, action = -1) {
    let accel;
    const { moveSideCoef, moveAccel, urgencyMoveAccel, airMoveAccel } =
      this.data.stats;

    if (this.#isGrounded) {
      if (
        action === Actions.quickMoveLeft ||
        action === Actions.quickMoveRight
      ) {
        accel = moveAccel * urgencyMoveAccel;
      } else {
        accel = moveAccel;
      }
    } else {
      accel = airMoveAccel;
    }

    const direction = this.#sideB.crossVectors(this.direction, Axis.y);
    direction.applyAxisAngle(this.direction, sign(value) * Game.RAD30);
    direction.normalize();
    this.velocity.add(
      direction.multiplyScalar(accel * value * moveSideCoef * deltaTime),
    );
  }

  input(actions, urgency) {
    // スタン中は入力を受け付けない
    if (this.hasState(States.stunning)) {
      this.#actions.clear();
      return;
    }

    // 緊急行動中も初回以降は入力を受け付けない
    if (!this.hasState(States.urgency)) {
      // 前回のアクションを消去
      this.#actions.clear();
      actions.forEach((action, value) => this.#actions.set(value, action));

      if (urgency) {
        this.addState(States.urgency);

        if (
          actions.has(Actions.quickTurnLeft) ||
          actions.has(Actions.quickTurnRight)
        ) {
          this.#urgencyDuration = World.urgencyTurnDuration;
        } else {
          this.#urgencyDuration = World.urgencyDuration;
        }

        if (this.hasControls) {
          const method = this.game.methods.get('play-sound');
          method?.('dash');
        }
      }
    }
  }

  update(deltaTime, elapsedTime, damping) {
    super.update(deltaTime);

    // 自機の動き制御
    if (this.hasState(States.stunning)) {
      this.#stunningElapsedTime += deltaTime;

      if (this.#stunningDuration <= this.#stunningElapsedTime) {
        this.deleteState(States.stunning);
        this.#stunningElapsedTime = 0;
      }
    }

    if (this.#actions.has(Actions.jump) && this.#isGrounded) {
      const value = this.#actions.get(Actions.jump);
      this.jump(value);
      this.#actions.delete(Actions.jump);
    }

    if (this.#actions.has(Actions.trigger)) {
      const value = this.#actions.get(Actions.trigger);
      // this.fire(value);
      this.#actions.delete(Actions.trigger);
    }

    if (this.hasState(States.urgency)) {
      // 緊急時アクション
      this.#urgencyElapsedTime += deltaTime;

      if (this.#urgencyDuration > this.#urgencyElapsedTime) {
        if (this.#actions.has(Actions.quickMoveForward)) {
          const value = this.#actions.get(Actions.quickMoveForward);
          this.moveForward(deltaTime, value, Actions.quickMoveForward);
        } else if (this.#actions.has(Actions.quickMoveBackward)) {
          const value = this.#actions.get(Actions.quickMoveBackward);
          this.moveForward(deltaTime, value, Actions.quickMoveBackward);
        } else if (this.#actions.has(Actions.quickTurnLeft)) {
          const value = this.#actions.get(Actions.quickTurnLeft);
          this.rotate(deltaTime, value, Actions.quickTurnLeft);
        } else if (this.#actions.has(Actions.quickTurnRight)) {
          const value = this.#actions.get(Actions.quickTurnRight);
          this.rotate(deltaTime, value, Actions.quickTurnRight);
        } else if (this.#actions.has(Actions.quickMoveLeft)) {
          const value = this.#actions.get(Actions.quickMoveLeft);
          this.moveSide(deltaTime, value, Actions.quickMoveLeft);
        } else if (this.#actions.has(Actions.quickMoveRight)) {
          const value = this.#actions.get(Actions.quickMoveRight);
          this.moveSide(deltaTime, value, Actions.quickMoveRight);
        }
      } else {
        this.deleteState(States.urgency);
        this.#urgencyElapsedTime = 0;

        this.addState(States.stunning);
        this.#stunningElapsedTime = 0;

        if (
          this.#actions.has(Actions.quickTurnLeft) ||
          this.#actions.has(Actions.quickTurnRight)
        ) {
          this.#stunningDuration = World.stunningTurnDuration;
        } else {
          this.#stunningDuration = World.stunningDuration;
        }
      }
    } else {
      // 通常時アクション

      if (this.#actions.has(Actions.rotateLeft)) {
        const value = this.#actions.get(Actions.rotateLeft);
        this.rotate(deltaTime, value);
      } else if (this.#actions.has(Actions.rotateRight)) {
        const value = this.#actions.get(Actions.rotateRight);
        this.rotate(deltaTime, value);
      }

      if (this.#actions.has(Actions.sprint)) {
        const value = this.#actions.get(Actions.sprint);
        this.moveForward(deltaTime, value, Actions.sprint);
      } else if (this.#actions.has(Actions.moveForward)) {
        const value = this.#actions.get(Actions.moveForward);
        this.moveForward(deltaTime, value);
      } else if (this.#actions.has(Actions.moveBackward)) {
        const value = this.#actions.get(Actions.moveBackward);
        this.moveForward(deltaTime, value);
      }

      if (this.#actions.has(Actions.moveLeft)) {
        const value = this.#actions.get(Actions.moveLeft);
        this.moveSide(deltaTime, value);
      } else if (this.#actions.has(Actions.moveRight)) {
        const value = this.#actions.get(Actions.moveRight);
        this.moveSide(deltaTime, value);
      }
    }

    if (this.#rotVelocity !== 0) {
      this.#deltaRot = this.#rotVelocity * deltaTime;

      if (
        !this.hasState(States.urgency) &&
        !this.#actions.has(Actions.rotateLeft) &&
        !this.#actions.has(Actions.rotateRight)
      ) {
        this.#rotVelocity += this.#rotVelocity * damping.spin;
      }

      if (
        (this.#rotVelocity > 0 && this.#rotVelocity < EPS) ||
        (this.#rotVelocity < 0 && this.#rotVelocity > -EPS)
      ) {
        this.#rotVelocity = 0;
      }
    }

    if (this.#deltaRot !== 0) {
      this.direction.applyAxisAngle(Axis.y, this.#deltaRot);
      this.rotation.phi += this.#deltaRot;

      if (this.hasControls) {
        this.publish('onRotate', this.rotation.phi, this.#deltaRot);
      }
    }

    this.#deltaRot = 0;

    if (!this.#isGrounded) {
      const falling = World.gravity * deltaTime;
      this.velocity.y -= falling;
    }

    // 移動の減衰処理
    const deltaDamping = this.#isGrounded ? damping.ground : damping.air;

    this.velocity.addScaledVector(this.velocity, deltaDamping);
    const lengthSq = this.velocity.lengthSq();

    if (lengthSq < EPS ** 2) {
      this.velocity.set(0, 0, 0);
    }

    this.#deltaPos.copy(this.velocity).multiplyScalar(deltaTime);

    this.position.add(this.#deltaPos);

    const posY = this.position.y;

    if (this.velocity.y < 0) {
      const fallDelta = this.#prevY - posY;
      this.#fallingDistance += fallDelta;
    } else {
      this.#fallingDistance = 0;
    }

    this.#prevY = posY;
  }

  updateBody(deltaTime) {
    const {
      collidable: { body },
      position,
    } = this;

    this.#pos.copy(position);
    this.#pos.y += this.data.centerHeight;
    body.position.copy(this.#pos);
    body.rotation.y = this.rotation.phi;

    if (this.isAlive()) {
      this.collidable.traverse(({ body, collider }) => {
        const points = body.getObjectByName('points');
        points.rotation.y -= deltaTime * this.data.stats.satelliteSpeed;
      });
    }

    if (this.hasControls) {
      this.#pos.copy(position);
      this.#pos.y += this.data.cameraHeight;
      this.camera.position.copy(this.#pos);

      if (this.lookRotation.phi === 0 && this.lookRotation.theta === 0) {
        if (this.arrow.visible) {
          this.arrow.visible = false;
        }
      } else {
        if (!this.arrow.visible) {
          this.arrow.visible = true;
        }

        this.arrow.position.copy(this.#pos);

        this.#arrowDir
          .copy(this.direction)
          .applyAxisAngle(Axis.y, this.lookRotation.phi);

        const side = this.#sideC.crossVectors(this.#arrowDir, Axis.y);
        this.#arrowDir.applyAxisAngle(
          side,
          this.lookRotation.theta + this.data.stats.arrowPitch,
        );

        this.arrow.position.addScaledVector(
          this.#arrowDir,
          this.data.centerHeight + 1,
        );
        this.arrow.rotation.y = this.rotation.phi;
      }
    }
  }
}

export default Character;
