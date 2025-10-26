class Loop {
  #id = 0;

  #running = false;

  constructor(callback) {
    this.callback = callback;
    this.loop = this.loop.bind(this);
  }

  async loop(time) {
    await this.callback(time);

    if (this.#running) {
      requestAnimationFrame(this.loop);
    }
  }

  isActive() {
    return this.#running;
  }

  start() {
    if (!this.#running) {
      this.#running = true;
      requestAnimationFrame(this.loop);
    }
  }

  stop() {
    if (this.#running) {
      this.#running = false;
    }
  }
}

export default Loop;
