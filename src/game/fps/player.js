import {
  Vector3,
  Euler,
  Spherical,
  Quaternion,
  BufferGeometry,
  Mesh,
} from 'three';

import { createArrow } from './create-object';
import {
  Actions,
  States,
  InputKeys,
  MashKeys,
  Pointers,
  UrgentActions,
} from './constants';
import { Characters } from './data/entities';
import { Commands } from './data/skeletals';
import Character from './character';
import Collidable from './collidable';
import { Game } from '../settings';
import { World, Axis, Controls, InitialDir } from './settings';
import { getGridPos, getVectorPos } from './utils';

const { floor, sign, random, min, max, PI } = Math;
const { EPS, RAD30, HalfPI } = Game;

const urgentActions = new Set(UrgentActions);

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

  #quat = new Quaternion();

  #normal = new Vector3();

  #angularVel = 0;

  #deltaTheta = 0;

  #precededActions = new Map();

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

  setUrgency() {
    if (this.hasState(States.urgency)) {
      return;
    }

    this.addState(States.urgency);

    if (
      this.#actions.has(Actions.quickTurnLeft) ||
      this.#actions.has(Actions.quickTurnRight)
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

  jump(value = 1) {
    if (this.hasControls) {
      const method = this.game.methods.get('play-sound');
      method?.('jump');
    }

    this.collidable.velocity.y = this.data.stats.jumpPower * value;
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

    this.#forwardA.copy(InitialDir).applyQuaternion(this.collidable.rotation);
    this.#sideA.crossVectors(this.#forwardA, Axis.y);
    this.#forwardA.applyAxisAngle(this.#sideA, sign(-value) * Game.RAD30);

    this.collidable.velocity.add(
      this.#forwardA.multiplyScalar(accel * value * deltaTime),
    );
  }

  rotate(deltaTime, direction, action = -1) {
    const { urgencyTurn } = World;
    const { turnSpeed, rotAccel } = this.data.stats;

    if (action === Actions.quickTurnLeft || action === Actions.quickTurnRight) {
      this.#angularVel = 0;

      const t0 = (this.#urgencyElapsedTime - deltaTime) / this.#urgencyDuration;
      const t1 = this.#urgencyElapsedTime / this.#urgencyDuration;
      const r0 = direction * urgencyTurn * easeOutQuad(t0);
      const r1 = direction * urgencyTurn * easeOutQuad(t1);

      this.#deltaTheta = r1 - r0;
    } else {
      this.#angularVel += rotAccel * deltaTime * direction;
      this.#angularVel = min(max(this.#angularVel, -turnSpeed), turnSpeed);
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
    this.collidable.velocity.add(
      this.#sideB.multiplyScalar(accel * value * moveSideCoef * deltaTime),
    );
  }

  trigger(value) {
    this.startAnimation(Commands.JabPunch);
  }

  input(actions) {
    // 緊急行動中は入力を受け付けない
    if (this.hasState(States.urgency)) {
      return;
    }

    // 前回のアクションを消去
    this.#actions.clear();

    // スタン中の緊急回避の先行入力は記録しておく
    if (this.isStunning()) {
      actions.forEach((value, key) => {
        if (urgentActions.has(key)) {
          this.#precededActions.set(key, value);
        }
      });
      return;
    }

    // コントロールから渡されたアクションデータをコピー
    actions.forEach((value, key) => {
      this.#actions.set(key, value);

      if (urgentActions.has(key)) {
        this.setUrgency();
      }
    });
  }

  steer(deltaTime) {
    if (this.#precededActions.size > 0 && !this.isStunning()) {
      this.#precededActions.forEach((value, key) =>
        this.#actions.set(key, value),
      );
      this.setUrgency();
      this.#precededActions.clear();
    }

    if (this.#actions.has(Actions.jump) && this.isGrounded()) {
      const value = this.#actions.get(Actions.jump);
      this.jump(value);
      this.#actions.delete(Actions.jump);
    }

    if (this.#actions.has(Actions.trigger)) {
      const value = this.#actions.get(Actions.trigger);
      this.trigger(value);
      // 連射可能かどうかで以下分岐
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

  preUpdate(deltaTime) {
    super.preUpdate(deltaTime);

    this.steer(deltaTime);
  }

  update(deltaTime, elapsedTime, damping) {
    super.update(deltaTime, elapsedTime, damping);

    if (this.#angularVel !== 0) {
      this.#angularVel += this.#angularVel * damping.spin;

      if (
        (this.#angularVel > 0 && this.#angularVel < EPS) ||
        (this.#angularVel < 0 && this.#angularVel > -EPS)
      ) {
        this.#angularVel = 0;
      }

      this.#deltaTheta = this.#angularVel * deltaTime;
    }

    if (this.#deltaTheta !== 0) {
      this.#quat.setFromAxisAngle(Axis.y, this.#deltaTheta);
      this.collidable.updateDeltaRotation(this.#quat);

      if (this.hasControls) {
        this.publish('onRotate', this.collidable.quaternion, this.#deltaTheta);
      }
    }

    this.#deltaTheta = 0;
  }

  postUpdate(deltaTime) {
    super.postUpdate(deltaTime);

    if (this.hasControls) {
      const { stats } = this.data;
      const { position: cpos } = this.camera;
      const { collider } = this.collidable;
      collider.getCenter(this.#pos);

      if (collider.type === 'capsule') {
        this.#normal.copy(collider.getProp('normal'));
      } else {
        this.#normal.set(0, 0, 0);
      }

      cpos.copy(this.#pos);
      cpos.addScaledVector(this.#normal, stats.cameraOffsetY);

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
        apos.addScaledVector(this.#normal, stats.arrowOffsetY);

        this.#arrowDir
          .copy(InitialDir)
          .applyQuaternion(this.collidable.rotation)
          .applyAxisAngle(Axis.y, this.lookRotation.theta);

        const side = this.#sideC.crossVectors(this.#arrowDir, Axis.y);
        this.#arrowDir.applyAxisAngle(side, this.lookRotation.phi - HalfPI);

        apos.addScaledVector(this.#arrowDir, stats.arrowOffsetZ);
        this.arrow.quaternion.copy(this.collidable.quaternion);
      }
    }
  }
}

export default Player;
