import Publisher from './publisher';
import { InputKeys } from './constants';

const onContextmenu = (event) => {
  event.preventDefault();
};

class DomEvents extends Publisher {
  #moveX = 0;

  #moveY = 0;

  constructor(domElement, worker) {
    super();

    this.domElement = domElement;
    this.worker = worker;
    this.gamepadEnabled = false;

    this.onWheel = this.onWheel.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  setEventHandlers(gamepadEnabled = false) {
    this.gamepadEnabled = gamepadEnabled;

    if (!this.gamepadEnabled) {
      document.addEventListener('contextmenu', onContextmenu);
      this.domElement.addEventListener('wheel', this.onWheel, {
        passive: false,
      });
      this.domElement.addEventListener('pointerdown', this.onPointerDown);
      this.domElement.addEventListener('pointermove', this.onPointerMove);
      this.domElement.addEventListener('pointerup', this.onPointerUp);

      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
    }
  }

  removeEventHandlers() {
    if (!this.gamepadEnabled) {
      document.removeEventListener('contextmenu', onContextmenu);
      this.domElement.removeEventListener('wheel', this.onWheel);

      this.domElement.removeEventListener('pointerdown', this.onPointerDown);
      this.domElement.removeEventListener('pointermove', this.onPointerMove);
      this.domElement.removeEventListener('pointerup', this.onPointerUp);

      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
    }
  }

  async lock() {
    if (this.domElement.ownerDocument.pointerLockElement == null) {
      await this.domElement.requestPointerLock();
    }
  }

  unlock() {
    this.domElement.ownerDocument.exitPointerLock();
  }

  onWheel(event) {
    event.preventDefault();

    this.publish('dom-event', 'wheel', event.deltaY);
  }

  onPointerMove(event) {
    this.publish(
      'dom-event',
      'pointer-move',
      event.button,
      event.movementX,
      event.movementY,
    );
  }

  onPointerDown(event) {
    this.lock(); // 開発中はコメントアウト
    this.publish('dom-event', 'pointer-down', event.button);
  }

  onPointerUp(event) {
    this.publish('dom-event', 'pointer-up', event.button);
  }

  onKeyDown(event) {
    event.preventDefault();

    const key = InputKeys[event.code];

    if (event.repeat) {
      return;
    }

    this.publish('dom-event', 'key-down', key);
  }

  onKeyUp(event) {
    event.preventDefault();

    const key = InputKeys[event.code];
    this.publish('dom-event', 'key-up', key);
  }

  dispose() {
    this.clear();
    this.removeEventHandlers();
  }
}

export default DomEvents;
