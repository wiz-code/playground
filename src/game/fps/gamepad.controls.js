import { Spherical, Vector3, Euler } from 'three';

import Publisher from '../publisher';
import { Game } from '../settings';
import { Controls, Screen, GameColor, InitialDir } from './settings';
import { Actions } from './constants';

const {
  SightColor: sightColor,
  IndicatorColor: indicatorColor,
  SightLinesColor: sightLinesColor,
} = GameColor;

const { floor, abs, sin, cos, sign, max, min, PI } = Math;
const degToRadCoef = PI / 180;
const Rad1 = (1 / 360) * PI * 2;
const { EPS, HalfPI } = Game;
const StickEPS = 1e-4;

const buttonList = [
  'a',
  'b',
  'x',
  'y',
  'lb',
  'rb',
  'lt',
  'rt',
  'back',
  'start',
  'lsb',
  'rsb',
  'up',
  'down',
  'left',
  'right',
  'guide',
];
const axisList = ['lsx', 'lsy', 'rsx', 'rsy', 'lt2', 'rt2'];

const buttonMap = new Map(buttonList.map((button, index) => [button, index]));
const axisMap = new Map(axisList.map((axis, index) => [axis, index]));

const nonRepeatableButtonList = ['a', 'b', 'x', 'y', 'lt', 'rt', 'lsb', 'rsb'];
const nonRepeatableAxisList = ['lt2', 'rt2'];

class GamepadControls extends Publisher {
  #vectorA = new Vector3();

  #vectorB = new Vector3();

  #actions = new Map();

  #lookRotation = new Spherical().setFromVector3(InitialDir);

  #bodyRotation = new Spherical().setFromVector3(InitialDir);

  #rot = new Euler(0, 0, 0, 'YXZ');

  #pendings = new Set();

  #pitch = 0;

  #x0 = 0;

  #y0 = 0;

  #x1 = 0;

  #y1 = 0;

  #px = 0;

  #py = 0;

  #mashed = false;

  #resetPointer = false;

  #resetWheel = false;

  #povLock = false;

  #enabled = false;

  constructor(gamepadIndex, indicators, camera) {
    super();

    this.gamepadIndex = gamepadIndex;
    this.buttons = new Map(buttonList.map((value) => [value, 0]));
    this.axes = new Map(
      axisList.map((value, index) => {
        if (index > 3) {
          return [value, -1];
        }

        return [value, 0];
      }),
    );

    this.cache = {};
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

  dispose() {
    // TODO
  }

  input(buttons, axes) {
    for (let i = 0, l = buttons.length; i < l; i += 1) {
      const button = buttonList[i];
      const value = buttons[i];

      this.buttons.set(button, value);

      if (nonRepeatableButtonList.includes(button)) {
        if (this.#pendings.has(button) && value === 0) {
          this.#pendings.delete(button);

          if (button === 'rsb') {
            this.#povLock = false;
            this.#resetPointer = true;
          } else if (button === 'y') {
            this.#resetWheel = true;
          }
        }
      }
    }

    for (let i = 0, l = axes.length; i < l; i += 1) {
      const axis = axisList[i];
      const value = axes[i];
      this.axes.set(axis, value);

      if (nonRepeatableAxisList.includes(axis)) {
        if (value < -1 + StickEPS) {
          this.#pendings.delete(axis);
        }
      }
    }

    this.#actions.clear();
    const mashed = this.buttons.get('x');

    if (!this.#pendings.has('x')) {
      if (mashed === 1) {
        this.#pendings.add('x');
        this.#mashed = 1;
      }
    }

    let value = this.axes.get('lsy');

    if (value < -StickEPS) {
      if (this.#mashed === 1) {this.#mashed = 0;
        this.#actions.set(Actions.quickMoveForward, 1);
      } else if (
        this.buttons.get('lsb') === 1 ||
        this.buttons.get('lt') === 1 ||
        this.axes.get('lt2') > 0
      ) {
        this.#actions.set(Actions.sprint, -value);
      } else {
        this.#actions.set(Actions.moveForward, -value);
      }
    } else if (value > StickEPS) {
      if (this.#mashed === 1) {this.#mashed = 0;
        this.#actions.set(Actions.quickMoveBackward, -1);
      } else {
        this.#actions.set(Actions.moveBackward, -value);
      }
    }

    value = this.axes.get('lsx');

    if (value > StickEPS) {
      if (this.#mashed === 1) {this.#mashed = 0;
        this.#actions.set(Actions.quickTurnRight, -1);
      } else {
        this.#actions.set(Actions.rotateRight, -value);
      }
    } else if (value < -StickEPS) {
      if (this.#mashed === 1) {this.#mashed = 0;
        this.#actions.set(Actions.quickTurnLeft, 1);
      } else {
        this.#actions.set(Actions.rotateLeft, -value);
      }
    }

    value = this.axes.get('rsy');

    if (value > StickEPS) {
      this.#y0 = this.#py + value;
      this.#py = this.#y0;
    } else if (value < -StickEPS) {
      this.#y0 = this.#py + value;
      this.#py = this.#y0;
    }

    value = this.axes.get('rsx');

    if (value > StickEPS) {
      this.#x0 = this.#px + value;
      this.#px = this.#x0;
    } else if (value < -StickEPS) {
      this.#x0 = this.#px + value;
      this.#px = this.#x0;
    }

    value = this.axes.get('rt2');

    if (value > 0) {
      if (!this.#pendings.has(axis)) {
        this.#pendings.add(axis);
        this.#actions.set(Actions.trigger, value);
      }
    }

    value = this.axes.get('lt2');
    
    if (value > 0) {
      if (!this.#pendings.has(axis)) {
        this.#pendings.add(axis);
      }
    }

    this.buttons.forEach((value, button) => {
      if (button === 'a' && value === 1) {
        if (!this.#pendings.has(button)) {
          this.#pendings.add(button);
          this.#actions.set(Actions.jump, value);
        }
      } else if (button === 'lb' && value === 1) {
        if (this.#mashed === 1) {this.#mashed = 0;
          this.#actions.set(Actions.quickMoveLeft, -1);
        } else {
          this.#actions.set(Actions.moveLeft, -1);
        }
      } else if (button === 'rb' && value === 1) {
        if (this.#mashed === 1) {this.#mashed = 0;
          this.#actions.set(Actions.quickMoveRight, 1);
        } else {
          this.#actions.set(Actions.moveRight, 1);
        }
      } else if ((button === 'rt' || button === 'b') && value === 1) {
        if (!this.#pendings.has(button)) {
          this.#pendings.add(button);
          this.#actions.set(Actions.trigger, value);
        }
      } else if (button === 'up' && value === 1) {
        const delta = Rad1;
        this.#pitch += delta;
      } else if (button === 'down' && value === 1) {
        const delta = Rad1;
        this.#pitch -= delta;
      } else if (button === 'x' && value === 1) {
        //
      } else if (button === 'y' && value === 1) {
        if (!this.#pendings.has(button)) {
          this.#pendings.add(button);
        }
      } else if (button === 'rsb' && value === 1) {
        if (!this.#pendings.has(button)) {
          this.#pendings.add(button);
          this.#povLock = true;
        }
      }
    });

    this.publish('input', this.#actions);
  }

  update(deltaTime) {
    if (!this.#enabled) {
      return;
    }

    // 自機の視点制御
    const {
      stickSpeed,
      stickMomentum: momentum,
      restoreMinAngle,
      restoreSpeed,
    } = Controls;
    const lookRotation = this.#lookRotation;
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

      const degX = (dy * stickSpeed) / this.gaugeHalfY;
      const radX = degX * degToRadCoef * this.multiplier;
      lookRotation.phi -= radX;

      const degY = (dx * stickSpeed) / this.viewHalfX;
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

    if (this.#pitch === 0) {
      if (this.povSightLines.material.color !== sightLinesColor.normal) {
        this.povSightLines.material.color = sightLinesColor.normal;
      }
    } else if (this.povSightLines.material.color !== sightLinesColor.wheel) {
      this.povSightLines.material.color = sightLinesColor.wheel;
    }

    if (this.#resetWheel) {
      if (this.#pitch >= 0) {
        this.#pitch -= deltaTime;

        if (this.#pitch <= 0) {
          this.#pitch = 0;
          this.#resetWheel = false;
        }
      } else {
        this.#pitch += deltaTime;

        if (this.#pitch >= 0) {
          this.#pitch = 0;
          this.#resetWheel = false;
        }
      }
    }

    if (this.verticalAngle.max <= this.#pitch) {
      this.#pitch = this.verticalAngle.max;
    } else if (this.verticalAngle.min >= this.#pitch) {
      this.#pitch = this.verticalAngle.min;
    }

    this.publish('setLookRot', lookRotation, this.#pitch);

    const posY = (-this.#pitch / HalfPI) * this.viewHalfY * 2.4;
    this.povSightLines.position.setY(posY);

    this.camera.rotation.x = lookRotation.phi - HalfPI + this.#pitch;
    this.camera.rotation.y = lookRotation.theta + this.#bodyRotation.theta + PI;
  }
}

export default GamepadControls;
