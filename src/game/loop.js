import { Game as GameSettings } from './settings';

let { FPS60 } = GameSettings;
FPS60 *= 1000;

class Loop {
  constructor(callback, object = null) {
    this.id = 0;
    this.callback = callback.bind(object);
    this.loop = this.loop.bind(this);
  }

  loop() {
    this.callback();
    this.id = setTimeout(() => {
      this.loop();
    }, FPS60);
  }

  isActive() {
    return this.id !== 0;
  }

  start() {
    if (this.id === 0) {
      this.loop();
    }
  }

  stop() {
    if (this.id !== 0) {
      clearTimeout(this.id);
      this.id = 0;
    }
  }
}

export default Loop;
