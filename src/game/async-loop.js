class Loop {
  #id = 0;

  #running = false;

  constructor(callback, waitAsync = false, sab = null) {
    this.callback = callback;
    this.waitAsync = waitAsync;
    this.sab = sab;

    this.loop = this.loop.bind(this);
  }

  async loop(time) {
    if (!this.waitAsync) {
      await this.callback(time);
    } else {
      const wait = Atomics.waitAsync(this.sab, 0, 0);
      this.callback(time);
      await wait.value;
    }

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
