import { debounce } from 'throttle-debounce';
import Stats from 'three/addons/libs/stats.module.js';

import { Game as GameSettings } from './settings';
import Common from '../common.json';
import Publisher from './publisher';

import DomEvents from './dom-events';
import AudioManager from './audio-manager';
import TextureManager from './texture-manager';
import Loop from './loop';
//import Loop from './async-loop';

const { floor } = Math;
const {
  KeyPressMaxCount,
  PointerEventSize,
  ButtonSize,
  AxisSize,
  HighFramerateCoef,
} = Common;

const KeyEventSize = KeyPressMaxCount * 2;
const eventValueIndex = new Map([
  ['pointer-down', 0], // isPointerDown, button
  ['pointer-up', 2], // isPointerUp, button
  ['pointer-move', 4], // movementX, movementY, button
  ['wheel', 7], // scrollValue

  // キー同時押しを4つまでとする
  ['key-down', 0], // key1, key2, key3, key4
  ['key-up', KeyPressMaxCount], // key1, key2, key3, key4
]);

class Game extends Publisher {
  #gamepadIndex = -1;

  #frameCount = 0;

  #statsEnabled = true;

  #workerUpdated = null;

  #sab = null;

  constructor(container, callbacks, params) {
    super();

    this.callbacks = callbacks;
    this.params = { ...params };

    this.worker = null;
    this.data = {
      //
    };

    this.callbacks.setLoading(true);

    this.container = container;
    const { width, height } = window.visualViewport;
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);

    this.pointerValues = new Float32Array(PointerEventSize);
    this.keyValues = new Float32Array(KeyEventSize);

    const { crossOriginIsolated, canUseWaitAsync } = this.params;

    if (crossOriginIsolated) {
      const sabPointerValues = new SharedArrayBuffer(PointerEventSize * 4);
      const sabKeyValues = new SharedArrayBuffer(KeyEventSize * 4);
      const sabButtons = new SharedArrayBuffer(ButtonSize * 4);
      const sabAxes = new SharedArrayBuffer(AxisSize * 4);
      const sabTime = new SharedArrayBuffer(4);

      this.#sab = {
        pointerValues: new Float32Array(sabPointerValues),
        keyValues: new Float32Array(sabKeyValues),
        buttons: new Float32Array(sabButtons),
        axes: new Float32Array(sabAxes),
        time: new Float32Array(sabTime),

        waitMain: null,
        waitWorker: null,
      };

      if (canUseWaitAsync) {
        const sabWaitMain = new SharedArrayBuffer(4);
        this.#sab.waitMain = new Int32Array(sabWaitMain);

        const sabWaitWorker = new SharedArrayBuffer(4);
        this.#sab.waitWorker = new Int32Array(sabWaitWorker);
      }
    }

    const audioContext = new AudioContext();
    this.audioManager = new AudioManager(audioContext, {
      volume: this.params.volume,
      mute: this.params.mute,
    });
    this.textureManager = new TextureManager();

    this.subscribe('set-volume', this.audioManager.setVolume);
    this.subscribe('set-mute', this.audioManager.setMute);

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = 'auto';
    this.stats.domElement.style.bottom = 0;

    this.statsEnabled = true;
    this.container.appendChild(this.stats.domElement);

    const offScreen = this.canvas.transferControlToOffscreen();
    const data = {
      canvas: offScreen,
      width,
      height,
      sab: this.#sab,
    };

    this.update = this.update.bind(this);
    this.loop = new Loop(this.update, this);
    /*this.loop = new Loop(
      this.update,
      crossOriginIsolated && canUseWaitAsync,
      this.#sab != null ? this.#sab.waitMain : null,
    );*/

    this.init(data);
  }

  async init(data) {
    let imageBitmap = await this.textureManager.toImageBitmap();

    this.worker = new Worker(new URL('./init-worker.js', import.meta.url));
    this.worker.postMessage(
      {
        type: 'init',
        data: { ...data, imageBitmap },
        params: this.params,
      },
      [data.canvas],
    );

    imageBitmap = null;

    this.domEvents = new DomEvents(this.canvas, this.worker);
    this.domEvents.subscribe('dom-event', this.onEventDispatched.bind(this));

    // this.decoder = new TextDecoder();
    const gamepads = window.navigator.getGamepads();

    if (gamepads.length > 0) {
      for (let i = 0, l = gamepads.length; i < l; i += 1) {
        const gamepad = gamepads[i];

        if (gamepad != null && gamepad.connected) {
          this.#gamepadIndex = i;
          break;
        }
      }
    }

    if (this.#gamepadIndex !== -1) {
      this.domEvents.setEventHandlers(true);
      this.worker.postMessage({
        type: 'gamepad-connected',
        value: this.#gamepadIndex,
      });
    } else {
      this.domEvents.setEventHandlers(false);
      this.worker.postMessage({ type: 'create-controls' });
    }

    const onGamepadConnected = (e) => {
      const { index } = e.gamepad;
      this.#gamepadIndex = index;

      this.domEvents.removeEventHandlers();
      this.domEvents.setEventHandlers(true);

      this.worker.postMessage({
        type: 'gamepad-connected',
        value: this.#gamepadIndex,
      });
    };

    // TODO: プレイ中にゲームパッドの接続が切れたとき、ゲームを中断する
    const onGamepadDisconnected = () => {
      this.#gamepadIndex = -1;

      this.domEvents.removeEventHandlers();
      this.domEvents.setEventHandlers(false);

      this.worker.postMessage({ type: 'gamepad-disconnected' });
    };

    this.onGamepadConnected = onGamepadConnected.bind(this);
    this.onGamepadDisconnected = onGamepadDisconnected.bind(this);

    const onResize = function onResize() {
      const { width, height } = window.visualViewport;
      this.canvas.style.setProperty('width', `${width}px`);
      this.canvas.style.setProperty('height', `${height}px`);

      this.worker.postMessage({
        type: 'resize',
        value: [width, height],
      });
    };

    const onMessage = (event) => {
      switch (event.data.type) {
        case 'loaded': {
          window.addEventListener('gamepadconnected', this.onGamepadConnected);
          window.addEventListener(
            'gamepaddisconnected',
            this.onGamepadDisconnected,
          );

          this.callbacks.setLoading(false);
          this.start(true);
          break;
        }

        case 'set-scene': {
          const scene = event.data.value;

          if (scene === 'clear') {
            this.stop(true);
          }

          this.callbacks.setScene(scene);
          break;
        }

        case 'set-elapsed-time': {
          this.callbacks.setElapsedTime(event.data.value);
          break;
        }

        case 'play-sound': {
          const [name, delay] = event.data.value;
          this.audioManager.play(name, 'sfx', delay);
          break;
        }

        case 'stop-sound': {
          const name = event.data.value;
          this.audioManager.stop(name, 'sfx');
          break;
        }

        case 'play-music': {
          const [name, delay] = event.data.value;
          this.audioManager.play(name, 'bgm', delay);
          break;
        }

        case 'stop-music': {
          const name = event.data.value;
          this.audioManager.stop(name, 'bgm');
          break;
        }

        case 'set-score': {
          const score = event.data.value;
          this.callbacks.setScore(score);
          break;
        }

        case 'player-state': {
          //
          break;
        }

        case 'request-resize': {
          this.onResize();
          break;
        }

        case 'load-score': {
          const key = event.data.value;
          const score = localStorage.getItem(key);
          this.worker.postMessage({ type: 'load-score', value: score });
          break;
        }

        case 'save-score': {
          const [key, json] = event.data.value;
          localStorage.setItem(key, json);
          break;
        }

        case 'lock': {
          this.domEvents.lock();
          break;
        }

        case 'unlock': {
          this.domEvents.unlock();
          break;
        }

        case 'worker-updated': {
          if (this.#workerUpdated != null) {
            this.#workerUpdated();
            this.#workerUpdated = null;
          }
          break;
        }

        default: {
        }
      }
    };

    this.onMessage = onMessage.bind(this);
    this.onResize = debounce(GameSettings.resizeDelayTime, onResize.bind(this));

    window.addEventListener('resize', this.onResize);
    this.worker.addEventListener('message', this.onMessage);
  }

  onEventDispatched(event, ...values) {
    const { crossOriginIsolated } = this.params;
    const offset = eventValueIndex.get(event);
    const pointerValues = crossOriginIsolated
      ? this.#sab.pointerValues
      : this.pointerValues;
    const keyValues = crossOriginIsolated
      ? this.#sab.keyValues
      : this.keyValues;

    switch (event) {
      case 'pointer-move': {
        const [button, movementX, movementY] = values;
        pointerValues[offset] += movementX;
        pointerValues[offset + 1] += movementY;
        pointerValues[offset + 2] = button;
        break;
      }

      case 'pointer-down': {
        const [button] = values;
        pointerValues[offset] = 1;
        pointerValues[offset + 1] = button;
        break;
      }

      case 'pointer-up': {
        const [button] = values;
        pointerValues[offset] = 1;
        pointerValues[offset + 1] = button;
        break;
      }

      case 'wheel': {
        const [deltaY] = values;
        pointerValues[offset] += deltaY;
        break;
      }

      case 'key-down':
      case 'key-up': {
        const [key, shiftKey, altKey] = values;

        for (let i = offset; i < offset + KeyPressMaxCount; i += 1) {
          const value = keyValues[i];

          if (value === 0) {
            keyValues[i] = key;
            break;
          }
        }

        break;
      }

      default: {
      }
    }
  }

  enableStats(bool = true) {
    this.#statsEnabled = bool;

    if (bool) {
      this.container.appendChild(this.stats.domElement);
    } else {
      this.container.removeChild(this.stats.domElement);
    }
  }

  start(active = false) {
    if (!this.loop.isActive()) {
      this.loop.start();

      if (active) {
        this.worker.postMessage({ type: 'start' });
      }
    }
  }

  pause() {
    if (this.loop.isActive()) {
      this.loop.stop();
      this.worker.postMessage({ type: 'pause' });
    }
  }

  stop(active = false) {
    if (this.loop.isActive()) {
      this.loop.stop();

      if (active) {
        this.worker.postMessage({ type: 'stop' });
      }
    }
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener(
      'gamepaddisconnected',
      this.onGamepadDisconnected,
    );
    this.worker.removeEventListener('message', this.onMessage);

    this.domEvents.dispose();
    this.audioManager.dispose();
    this.textureManager.disposeAll();
    this.container.removeChild(this.canvas);

    this.worker.postMessage({ type: 'dispose' });
  }

  setParam(name, value, sendToWorker = false) {
    this.params[name] = value;

    if (sendToWorker) {
      this.sendParamToWorker(name, value);
    }
  }

  sendParamToWorker(name, value) {
    this.worker.postMessage({ type: 'send-param', value: [name, value] });
  }

  updateMain() {
    if (this.#statsEnabled) {
      this.stats.update();
    }

    const { crossOriginIsolated, canUseWaitAsync } = this.params;

    if (
      crossOriginIsolated &&
      this.#frameCount % GameSettings.SkipFrames === 0
    ) {
      const [time] = this.#sab.time;
      this.callbacks.setElapsedTime(time);
    }

    if (this.#gamepadIndex !== -1) {
      const gamepads = window.navigator.getGamepads();
      const gamepad = gamepads[this.#gamepadIndex];

      let { buttons, axes } = gamepad;
      buttons = buttons.map((button) => button.value);

      if (!crossOriginIsolated) {
        const bData = Float32Array.from(buttons);
        const aData = Float32Array.from(axes);

        this.worker.postMessage({ type: 'update', value: [bData, aData] }, [
          bData.buffer,
          aData.buffer,
        ]);
      } else {
        this.#sab.buttons.set(buttons);
        this.#sab.axes.set(axes);

        this.worker.postMessage({ type: 'update' });
      }
    } else if (!crossOriginIsolated) {
      this.worker.postMessage(
        { type: 'update', value: [this.pointerValues, this.keyValues] },
        [this.pointerValues.buffer, this.keyValues.buffer],
      );
      this.pointerValues = new Float32Array(PointerEventSize);
      this.keyValues = new Float32Array(KeyEventSize);
    }/* else if (canUseWaitAsync) {
      Atomics.notify(this.#sab.waitWorker, 0);
    }*/ else {
      this.worker.postMessage({ type: 'update' });
    }
  }

  async update() {
    this.#frameCount += 1;

    const { framerateCoef, crossOriginIsolated, canUseWaitAsync } = this.params;

    if (crossOriginIsolated && canUseWaitAsync) {
      /*if (framerateCoef !== 1 && this.#frameCount % framerateCoef !== 0) {
        return Atomics.notify(this.#sab.waitMain, 0);
      }*/

      this.updateMain();
    } else {
      /*if (framerateCoef !== 1 && this.#frameCount % framerateCoef !== 0) {
        return Promise.resolve();
      }*/

      const { promise, resolve } = Promise.withResolvers();
      this.#workerUpdated = resolve;
      this.updateMain();

      return promise;
    }
  }
}

export default Game;
