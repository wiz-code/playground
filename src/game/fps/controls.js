import { Spherical, Vector3 /*  */, Euler } from 'three';

import Common from '../../common.json';
import Publisher from '../publisher';
import { Game } from '../settings';
import { Controls, Screen, GameColor, InitialDir } from './settings';
import { InputKeys, MashKeys, Pointers, Actions } from './constants';

const { floor, abs, sin, cos, sign, max, min, PI } = Math;
const degToRadCoef = PI / 180;
const { EPS, RAD1, HalfPI } = Game;
const { KeyPressMaxCount } = Common;

const {
  SightColor: sightColor,
  IndicatorColor: indicatorColor,
  SightLinesColor: sightLinesColor,
} = GameColor;

const mashKeys = new Set(MashKeys.map((key) => InputKeys[key]));

const nonRepeatableKeyList = ['Space'];
const nonRepeatablePointerList = ['left'];

class FirstPersonControls extends Publisher {
  #vectorA = new Vector3();

  #vectorB = new Vector3();

  #keys = new Set();

  #pointers = new Set();

  #actions = new Map();

  #lookRotation = new Spherical().setFromVector3(InitialDir);

  #bodyRotation = new Spherical().setFromVector3(InitialDir);

  #rot = new Euler(0, 0, 0, 'YXZ');

  #wheel = 0;

  #x0 = 0;

  #y0 = 0;

  #x1 = 0;

  #y1 = 0;

  #px = 0;

  #py = 0;

  #count = 0;

  #lastKey = -1;

  #keyDownTime = 0;

  #keyUpTime = 0;

  #mashed = false;

  #mashedKey = -1;

  #resetPointer = false;

  #resetWheel = false;

  #povLock = false;

  #enabled = false;

  constructor(indicators, camera) {
    super();

    this.camera = camera;

    this.povSight = indicators.povSight;
    this.povSightLines = indicators.povSightLines;
    this.povIndicator = {
      horizontal: indicators.povIndicator.horizontal,
      vertical: indicators.povIndicator.vertical,
    };
    this.centerMark = indicators.centerMark;

    this.verticalAngle = {
      min: (-Controls.verticalAngleLimit / 360) * PI * 2,
      max: (Controls.verticalAngleLimit / 360) * PI * 2,
    };
    this.horizontalAngle = {
      min: (-Controls.horizontalAngleLimit / 360) * PI * 2,
      max: (Controls.horizontalAngleLimit / 360) * PI * 2,
    };

    this.viewHalfX = 0;
    this.viewHalfY = 0;

    this.yawIndicatorRadius = 0;
    this.gaugeHalfY = 0;
    this.multiplier = 1;

    this.setBodyRotation = this.setBodyRotation.bind(this);
    this.onRotate = this.onRotate.bind(this);
    this.onUnsetControls = this.onUnsetControls.bind(this);

    this.enable();
  }

  isEnabled() {
    return this.#enabled;
  }

  enable(bool = true) {
    this.#enabled = bool;
  }

  setBodyRotation(quat) {
    this.#rot.setFromQuaternion(quat);
    this.#bodyRotation.theta = this.#rot.y;
    this.#bodyRotation.phi = this.#rot.x;
  }

  onRotate(quat, deltaRot) {
    if (this.#povLock) {
      this.#lookRotation.theta -= deltaRot;
    }

    this.#rot.setFromQuaternion(quat);
    this.#bodyRotation.theta = this.#rot.y;
  }

  onUnsetControls() {
    this.clear('input');
    this.clear('setLookRot');
  }

  handleResize(width, height) {
    this.viewHalfX = width / 2;
    this.viewHalfY = height / 2;
    this.gaugeHalfY = Screen.gaugeHeight / 2;
    this.multiplier = this.gaugeHalfY / this.viewHalfX;

    this.yawIndicatorRadius = Screen.horizontalIndicatorSize;
    this.povIndicator.horizontal.position.setY(this.yawIndicatorRadius);
    this.centerMark.position.setY(this.yawIndicatorRadius);

    this.povSightLines.position.setX(0);
    this.povSightLines.position.setY(0);
  }

  dispatchAction(type, button) {
    switch (type) {
      case 'pointerdown': {
        if (button === 0) {
          //
        }

        if (button === 1) {
          //
        }

        if (button === 2) {
          this.#povLock = true;
        }

        break;
      }

      case 'pointerup': {
        if (button === 1) {
          this.#resetWheel = true;
        } else if (button === 2) {
          this.#povLock = false;
          this.#resetPointer = true;
        }

        break;
      }

      default: {
        //
      }
    }
  }

  handleEvents(pointerEvents, keyEvents) {
    if (!this.#enabled) {
      return;
    }

    const [
      pointerDown,
      pdButton,
      pointerUp,
      puButton,
      movementX,
      movementY,
      mvButton,
      wheel,
    ] = pointerEvents;
    const keyDownEvents = keyEvents.slice(0, 4);
    const keyUpEvents = keyEvents.slice(4);

    if (pointerDown !== 0) {
      this.#pointers.add(pdButton);
      this.dispatchAction('pointerdown', pdButton);
    }

    if (pointerUp !== 0) {
      this.#pointers.delete(puButton);
      this.dispatchAction('pointerup', puButton);
    }

    if (movementX !== 0 || movementY !== 0) {
      if (this.#pointers.has(Pointers.right)) {
        if (mvButton === Pointers.left) {
          if (this.#count % 2 === 0) {
            this.dispatchAction('pointerdown', mvButton);
          }

          this.#count += 1;
        }
      }

      this.#x0 = this.#px + movementX;
      this.#y0 = this.#py + movementY;

      this.#px = this.#x0;
      this.#py = this.#y0;
    }

    if (wheel !== 0) {
      const delta = sign(wheel) * Controls.wheelSpeed * RAD1;
      this.#wheel += delta;
    }

    for (let i = 0; i < KeyPressMaxCount; i += 1) {
      const key = keyDownEvents[i];
      this.#keys.add(key);
    }

    for (let i = 0; i < KeyPressMaxCount; i += 1) {
      const key = keyUpEvents[i];
      this.#keys.delete(key);
    }
  }

  dispose() {
    //
  }

  input() {
    this.#actions.clear();

    if (this.#keys.has(InputKeys.Space)) {
      this.#actions.set(Actions.jump, 1);
    }

    if (this.#keys.has(InputKeys.KeyW) || this.#keys.has(InputKeys.ArrowUp)) {
      if (this.#keys.has(InputKeys.Shift)) {
        this.#actions.set(Actions.sprint, 1);
      } else if (this.#keys.has(InputKeys.KeyC)) {
        this.#actions.set(Actions.quickMoveForward, 1);
        this.#keys.delete(InputKeys.KeyC);

        if (this.#keys.has(InputKeys.KeyW)) {
          this.#keys.delete(InputKeys.KeyW);
        }

        if (this.#keys.has(InputKeys.ArrowUp)) {
          this.#keys.delete(InputKeys.ArrowUp);
        }
      } else {
        this.#actions.set(Actions.moveForward, 1);
      }
    } else if (
      this.#keys.has(InputKeys.KeyS) ||
      this.#keys.has(InputKeys.ArrowDown)
    ) {
      if (this.#keys.has(InputKeys.KeyC)) {
        this.#actions.set(Actions.quickMoveBackward, -1);
        this.#keys.delete(InputKeys.KeyC);

        if (this.#keys.has(InputKeys.KeyS)) {
          this.#keys.delete(InputKeys.KeyS);
        }

        if (this.#keys.has(InputKeys.ArrowDown)) {
          this.#keys.delete(InputKeys.ArrowDown);
        }
      } else {
        this.#actions.set(Actions.moveBackward, -1);
      }
    }

    if (this.#keys.has(InputKeys.KeyA) || this.#keys.has(InputKeys.ArrowLeft)) {
      if (this.#keys.has(InputKeys.KeyC)) {
        this.#actions.set(Actions.quickTurnLeft, 1);
        this.#keys.delete(InputKeys.KeyC);

        if (this.#keys.has(InputKeys.KeyA)) {
          this.#keys.delete(InputKeys.KeyA);
        }

        if (this.#keys.has(InputKeys.ArrowLeft)) {
          this.#keys.delete(InputKeys.ArrowLeft);
        }
      } else {
        this.#actions.set(Actions.rotateLeft, 1);
      }
    } else if (
      this.#keys.has(InputKeys.KeyD) ||
      this.#keys.has(InputKeys.ArrowRight)
    ) {
      if (this.#keys.has(InputKeys.KeyC)) {
        this.#actions.set(Actions.quickTurnRight, -1);
        this.#keys.delete(InputKeys.KeyC);

        if (this.#keys.has(InputKeys.KeyD)) {
          this.#keys.delete(InputKeys.KeyD);
        }

        if (this.#keys.has(InputKeys.ArrowRight)) {
          this.#keys.delete(InputKeys.ArrowRight);
        }
      } else {
        this.#actions.set(Actions.rotateRight, -1);
      }
    }

    if (this.#keys.has(InputKeys.KeyQ)) {
      if (this.#keys.has(InputKeys.KeyC)) {
        this.#actions.set(Actions.quickMoveLeft, -1);
        this.#keys.delete(InputKeys.KeyC);

        if (this.#keys.has(InputKeys.KeyQ)) {
          this.#keys.delete(InputKeys.KeyQ);
        }
      } else {
        this.#actions.set(Actions.moveLeft, -1);
      }
    } else if (this.#keys.has(InputKeys.KeyE)) {
      if (this.#keys.has(InputKeys.KeyC)) {
        this.#actions.set(Actions.quickMoveRight, 1);
        this.#keys.delete(InputKeys.KeyC);

        if (this.#keys.has(InputKeys.KeyE)) {
          this.#keys.delete(InputKeys.KeyE);
        }
      } else {
        this.#actions.set(Actions.moveRight, 1);
      }
    }

    if (this.#pointers.has(Pointers.left)) {
      this.#actions.set(Actions.trigger, 1);
    }

    this.publish('input', this.#actions);

    nonRepeatableKeyList.forEach((key) => this.#keys.delete(InputKeys[key]));
    nonRepeatablePointerList.forEach((pointer) =>
      this.#pointers.delete(Pointers[pointer]),
    );
  }

  update(deltaTime) {
    if (!this.#enabled) {
      return;
    }

    const { lookSpeed, momentum, restoreMinAngle, restoreSpeed } = Controls;
    const lookRotation = this.#lookRotation;

    // 自機の視点制御
    let dx = this.#x0 - this.#x1;
    let dy = this.#y0 - this.#y1;

    if ((dx > 0 && dx < EPS) || (dx < 0 && dx > -EPS)) {
      dx = 0;
    }

    if ((dy > 0 && dy < EPS) || (dy < 0 && dy > -EPS)) {
      dy = 0;
    }

    dx /= momentum;
    dy /= momentum;

    this.#x1 += dx;
    this.#y1 += dy;

    const { vertical: pitchIndicator, horizontal: yawIndicator } =
      this.povIndicator;

    if (!this.#resetPointer) {
      if (this.povSight.material.color !== sightColor.pov) {
        this.povSight.material.color = sightColor.pov;
      }

      if (!yawIndicator.visible) {
        yawIndicator.visible = true;
      }

      if (!pitchIndicator.visible) {
        pitchIndicator.visible = true;
      }

      const degX = (dy * lookSpeed) / this.gaugeHalfY;
      const radX = degX * degToRadCoef * this.multiplier;
      lookRotation.phi -= radX;

      const degY = (dx * lookSpeed) / this.viewHalfX;
      const radY = degY * degToRadCoef;
      lookRotation.theta -= radY;

      const vmin = this.verticalAngle.min + HalfPI;
      const vmax = this.verticalAngle.max + HalfPI;

      lookRotation.phi = max(vmin, min(vmax, lookRotation.phi));
      lookRotation.theta = max(
        this.horizontalAngle.min,
        min(this.horizontalAngle.max, lookRotation.theta),
      );

      let posY =
        this.gaugeHalfY *
        ((lookRotation.phi - HalfPI) / this.verticalAngle.max);

      if (
        lookRotation.theta === this.horizontalAngle.min ||
        lookRotation.theta === this.horizontalAngle.max
      ) {
        yawIndicator.material.color = indicatorColor.beyondFov;
      } else if (yawIndicator.material.color !== indicatorColor.normal) {
        yawIndicator.material.color = indicatorColor.normal;
      }

      if (lookRotation.phi <= vmin) {
        posY = -this.gaugeHalfY;
        pitchIndicator.material.color = indicatorColor.beyondFov;
      } else if (lookRotation.phi >= vmax) {
        posY = this.gaugeHalfY;
        pitchIndicator.material.color = indicatorColor.beyondFov;
      } else if (pitchIndicator.material.color !== indicatorColor.normal) {
        pitchIndicator.material.color = indicatorColor.normal;
      }

      yawIndicator.material.rotation = lookRotation.theta;
      yawIndicator.position.x =
        this.yawIndicatorRadius * cos(lookRotation.theta + HalfPI);
      yawIndicator.position.y =
        this.yawIndicatorRadius * sin(lookRotation.theta + HalfPI);
      pitchIndicator.position.y = posY;
    } else {
      /* if (lookRotation.phi !== 0) {
        if (abs(lookRotation.phi) < restoreMinAngle) {
          lookRotation.phi = 0;
        } else {
          const rx =
            -lookRotation.phi * deltaTime * restoreSpeed +
            sign(-lookRotation.phi) * restoreMinAngle;
          lookRotation.phi += rx;
        }

        if (pitchIndicator.material.color !== indicatorColor.normal) {
          pitchIndicator.material.color = indicatorColor.normal;
        }

        const posY = (this.gaugeHalfY * lookRotation.phi) / HalfPI;
        pitchIndicator.position.y = posY;
      } */
      if (lookRotation.phi !== HalfPI) {
        const diff = lookRotation.phi - HalfPI;

        if (abs(diff) < restoreMinAngle) {
          lookRotation.phi = HalfPI;
        } else {
          const rx =
            -diff * deltaTime * restoreSpeed + sign(-diff) * restoreMinAngle;
          lookRotation.phi += rx;
        }

        if (pitchIndicator.material.color !== indicatorColor.normal) {
          pitchIndicator.material.color = indicatorColor.normal;
        }

        // const posY = (this.gaugeHalfY * lookRotation.phi) / HalfPI;
        const posY =
          this.gaugeHalfY *
          ((lookRotation.phi - HalfPI) / this.verticalAngle.max);
        pitchIndicator.position.y = posY;
      }

      if (lookRotation.theta !== 0) {
        if (abs(lookRotation.theta) < restoreMinAngle) {
          lookRotation.theta = 0;
        } else {
          const dr =
            lookRotation.theta * deltaTime * restoreSpeed +
            sign(lookRotation.theta) * restoreMinAngle;
          lookRotation.theta -= dr;
        }

        if (yawIndicator.material.color !== indicatorColor.normal) {
          yawIndicator.material.color = indicatorColor.normal;
        }

        yawIndicator.material.rotation = lookRotation.theta;
        yawIndicator.position.x =
          this.yawIndicatorRadius * cos(lookRotation.theta + HalfPI);
        yawIndicator.position.y =
          this.yawIndicatorRadius * sin(lookRotation.theta + HalfPI);
      }
    }

    // if (lookRotation.phi === 0 && lookRotation.theta === 0) {
    if (lookRotation.phi === HalfPI && lookRotation.theta === 0) {
      if (this.#resetPointer) {
        this.#resetPointer = false;

        this.#px = 0;
        this.#py = 0;
        this.#x0 = 0;
        this.#y0 = 0;
        this.#x1 = 0;
        this.#y1 = 0;
      }

      if (this.povSight.material.color !== sightColor.front) {
        this.povSight.material.color = sightColor.front;
      }

      if (yawIndicator.visible) {
        yawIndicator.visible = false;
      }

      if (pitchIndicator.visible) {
        pitchIndicator.visible = false;
      }
    }

    if (this.#wheel === 0) {
      if (this.povSightLines.material.color !== sightLinesColor.normal) {
        this.povSightLines.material.color = sightLinesColor.normal;
      }
    } else if (this.povSightLines.material.color !== sightLinesColor.wheel) {
      this.povSightLines.material.color = sightLinesColor.wheel;
    }

    if (this.#resetWheel) {
      if (this.#wheel >= 0) {
        this.#wheel -= deltaTime;

        if (this.#wheel <= 0) {
          this.#wheel = 0;
          this.#resetWheel = false;
        }
      } else {
        this.#wheel += deltaTime;

        if (this.#wheel >= 0) {
          this.#wheel = 0;
          this.#resetWheel = false;
        }
      }
    }

    if (this.verticalAngle.max <= this.#wheel) {
      this.#wheel = this.verticalAngle.max;
    } else if (this.verticalAngle.min >= this.#wheel) {
      this.#wheel = this.verticalAngle.min;
    }

    this.publish('setLookRot', lookRotation, this.#wheel);

    const posY = (-this.#wheel / HalfPI) * this.viewHalfY * 2.4;
    this.povSightLines.position.setY(posY);

    // this.camera.rotation.x = lookRotation.phi + this.#wheel;
    this.camera.rotation.x = lookRotation.phi - HalfPI + this.#wheel;
    this.camera.rotation.y = lookRotation.theta + this.#bodyRotation.theta + PI;
  }
}

export default FirstPersonControls;
