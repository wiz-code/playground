import { Vector3, Euler, Spherical, BufferGeometry, Mesh } from 'three';

import { createArrow } from './create-object';
import { Actions, States, InputKeys, MashKeys, Pointers } from './constants';
import { Characters } from './data/entities';
import Character from './character';
import Collidable from './collidable';
import { Game } from '../settings';
import { World, Axis, Controls, InitialDir } from './settings';
import { getGridPos, getVectorPos } from './utils';

const { floor, sign, random, min, max, PI } = Math;
const { EPS, RAD30, HalfPI } = Game;

const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);
const easeInQuad = (x) => x * x;

class Player extends Character {
  #forwardA = new Vector3();

  #forwardB = new Vector3();

  #sideA = new Vector3();

  #sideB = new Vector3();

  #sideC = new Vector3();

  #rot = new Euler();

  #actions = new Map();

  #urgencyElapsedTime = 0;

  #urgencyDuration = 0;

  #pos = new Vector3();

  #arrowDir = new Vector3();

  constructor(game, name, subtype) {
    super(game, name, subtype);

    this.lookRotation = new Spherical().setFromVector3(InitialDir);

    this.camera = null;
    this.arrow = null;

    this.input = this.input.bind(this);
    this.setLookRot = this.setLookRot.bind(this);
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

    this.publish('setBodyRotation', this.collidable.quaternion);
  }

  setLookRot(rot, offset) {
    this.lookRotation.theta = rot.theta;
    this.lookRotation.phi = rot.phi + offset;
  }

  dispose() {
    super.dispose();

    this.unsetControls();
    this.arrow = null;
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

    if (this.isGrounded()) {
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

    // this.#forwardA.copy(InitialDir).applyEuler(this.collidable.rotation);
    this.#forwardA.copy(InitialDir).applyQuaternion(this.collidable.rotation);
    this.#sideA.crossVectors(this.#forwardA, Axis.y);
    this.#forwardA.applyAxisAngle(this.#sideA, sign(-value) * Game.RAD30);

    this.velocity.add(this.#forwardA.multiplyScalar(accel * value * deltaTime));
  }

  rotate(deltaTime, direction, action = -1) {
    const { urgencyTurn } = World;
    const { turnSpeed, rotAccel } = this.data.stats;

    if (action === Actions.quickTurnLeft || action === Actions.quickTurnRight) {
      this.angularVel = 0;

      const t0 = (this.#urgencyElapsedTime - deltaTime) / this.#urgencyDuration;
      const t1 = this.#urgencyElapsedTime / this.#urgencyDuration;
      const r0 = direction * urgencyTurn * easeOutQuad(t0);
      const r1 = direction * urgencyTurn * easeOutQuad(t1);

      this.deltaTheta = r1 - r0;
    } else {
      this.angularVel += rotAccel * deltaTime * direction;
      this.angularVel = min(max(this.angularVel, -turnSpeed), turnSpeed);
    }
  }

  moveSide(deltaTime, value, action = -1) {
    let accel;
    const { moveSideCoef, moveAccel, urgencyMoveAccel, airMoveAccel } =
      this.data.stats;

    if (this.isGrounded()) {
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

    // this.#forwardB.copy(InitialDir).applyEuler(this.collidable.rotation);
    this.#forwardB.copy(InitialDir).applyQuaternion(this.collidable.rotation);
    this.#sideB.crossVectors(this.#forwardB, Axis.y).normalize();
    this.#sideB.applyAxisAngle(this.#forwardB, sign(value) * Game.RAD30);
    this.velocity.add(
      this.#sideB.multiplyScalar(accel * value * moveSideCoef * deltaTime),
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

  steer(deltaTime, elapsedTime, damping) {
    if (this.#actions.has(Actions.jump) && this.isGrounded()) {
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

        if (
          this.#actions.has(Actions.quickTurnLeft) ||
          this.#actions.has(Actions.quickTurnRight)
        ) {
          this.setStunning(World.stunningTurnDuration);
        } else {
          this.setStunning(World.stunningDuration);
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
  }

  postUpdate(deltaTime) {
    super.postUpdate(deltaTime);

    if (this.hasControls) {
      const { stats } = this.data;
      const { position: cpos } = this.camera;
      this.collidable.collider.getCenter(this.#pos);
      // this.#pos.y += this.data.cameraOffsetY;
      cpos.copy(this.#pos);
      cpos.y += stats.cameraOffsetY; /// /////プレイヤーの傾きを考慮していない//////

      if (this.lookRotation.theta === 0 && this.lookRotation.phi === HalfPI) {
        if (this.arrow.visible) {
          this.arrow.visible = false;
        }
      } else {
        const { position: apos } = this.arrow;

        if (!this.arrow.visible) {
          this.arrow.visible = true;
        }

        apos.copy(this.#pos);
        apos.y += stats.arrowOffsetY; /// /////プレイヤーの傾きを考慮していない//////

        this.#arrowDir
          .copy(InitialDir)
          .applyQuaternion(this.collidable.rotation)
          .applyAxisAngle(Axis.y, this.lookRotation.theta);

        const side = this.#sideC.crossVectors(this.#arrowDir, Axis.y);
        this.#arrowDir.applyAxisAngle(
          side,
          this.lookRotation.phi - HalfPI, // + this.data.stats.arrowPitch,
        );

        apos.addScaledVector(
          this.#arrowDir,
          stats.arrowOffsetZ, // 5,
        );
        this.arrow.quaternion.copy(this.collidable.quaternion);
      }
    }
  }
}

export default Player;
