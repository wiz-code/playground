import { Game } from './settings';

const delay = Game.FPS60 * 1000;

class Loop {
  #running = false;

  constructor(callback, async = false, method = 'raf') {
    this.callback = callback;
    this.async = async;
    this.method = method.toLowerCase();

    if (!this.async) {
      this.loop = this.loop.bind(this);
    } else {
      this.loop = this.asyncLoop.bind(this);
    }
  }

  loop(time) {
    this.callback(time);

    if (this.#running) {
      if (this.method === 'raf') {
        requestAnimationFrame(this.loop);
      } else {
        setTimeout(this.loop, delay);
      }
    }
  }

  async asyncLoop(time) {
    await this.callback(time);

    if (this.#running) {
      if (this.method === 'raf') {
        requestAnimationFrame(this.loop);
      } else {
        setTimeout(this.loop, delay);
      }
    }
  }

  isActive() {
    return this.#running;
  }

  start() {
    if (!this.#running) {
      this.#running = true;

      if (this.method === 'raf') {
        requestAnimationFrame(this.loop);
      } else {
        setTimeout(this.loop, delay);
      }
    }
  }

  stop() {
    if (this.#running) {
      this.#running = false;
    }
  }
}

export default Loop;
