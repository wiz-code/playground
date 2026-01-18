import { debounce } from 'throttle-debounce';
import Stats from 'three/addons/libs/stats.module.js';
///// for development ///////
import GUI from 'lil-gui';
////////////

import { InputKeys } from './constants';
import { Game as GameSettings, BindedKeys } from './settings';
import {
  KeyPressMaxCount,
  PointerEventSize,
  ButtonSize,
  AxisSize,
  SharedDataSize,
  SharedDataIndex,
  HighFramerateCoef,
} from '../../common/constants';
import Publisher from './publisher';
import Loop from './loop';

import DomEvents from './dom-events';
import AudioManager from './audio-manager';
import TextureManager from './texture-manager';

const { floor } = Math;

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

//// for development ////
const gui = new GUI();
//////////////////

class Game extends Publisher {
  #gamepadIndex = -1;

  #frameCount = 0;

  #elapsedTime = 0;

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
      const sabData = new SharedArrayBuffer(SharedDataSize * 4);

      this.#sab = {
        pointerValues: new Float32Array(sabPointerValues),
        keyValues: new Float32Array(sabKeyValues),
        buttons: new Float32Array(sabButtons),
        axes: new Float32Array(sabAxes),
        data: new Float32Array(sabData),

        waitMain: null,
        waitStats: null,
        waitWorker: null,
      };

      if (canUseWaitAsync) {
        const sabWaitMain = new SharedArrayBuffer(4);
        this.#sab.waitMain = new Int32Array(sabWaitMain);

        const sabWaitStats = new SharedArrayBuffer(4);
        this.#sab.waitStats = new Int32Array(sabWaitStats);

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

    this.init(data);

    if (crossOriginIsolated && canUseWaitAsync) {
      this.updateStats();
    }

    this.update = this.update.bind(this);
    this.loop = new Loop(this.update, false, 'timeout');

    ///////////for develop////////
    const props = {
      stateJabStart: {
        leftShoulder: { angleX: 0, angleY: 0, angleZ: 0 },
        leftElbow: { angleX: 0, angleY: 0, angleZ: 0 },
      },
      stateJabFinish: {
        leftShoulder: { angleX: 0, angleY: 0, angleZ: 0 },
        leftElbow: { angleX: 0, angleY: 0, angleZ: 0 },
      },
    };

    const StateJabStartGui = gui.addFolder('State JabStart');
    const LeftShoulderGui1 = StateJabStartGui.addFolder('leftShoulder');
    const LeftElbowGui1 = StateJabStartGui.addFolder('leftElbow');
    LeftShoulderGui1.add(props.stateJabStart.leftShoulder, 'angleX', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-start', 'left-shoulder', 'x', value] });
    });
    LeftShoulderGui1.add(props.stateJabStart.leftShoulder, 'angleY', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-start', 'left-shoulder', 'y', value] });
    });
    LeftShoulderGui1.add(props.stateJabStart.leftShoulder, 'angleZ', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-start', 'left-shoulder', 'z', value] });
    });
    
    LeftElbowGui1.add(props.stateJabStart.leftElbow, 'angleX', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-start', 'left-elbow', 'x', value] });
    });
    LeftElbowGui1.add(props.stateJabStart.leftElbow, 'angleY', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-start', 'left-elbow', 'y', value] });
    });
    LeftElbowGui1.add(props.stateJabStart.leftElbow, 'angleZ', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-start', 'left-elbow', 'z', value] });
    });

    const StateJabFinishGui = gui.addFolder('State JabFinish');
    const LeftShoulderGui2 = StateJabFinishGui.addFolder('leftShoulder');
    const LeftElbowGui2 = StateJabFinishGui.addFolder('leftElbow');
    LeftShoulderGui2.add(props.stateJabFinish.leftShoulder, 'angleX', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-finish', 'left-shoulder', 'x', value] });
    });
    LeftShoulderGui2.add(props.stateJabFinish.leftShoulder, 'angleY', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-finish', 'left-shoulder', 'y', value] });
    });
    LeftShoulderGui2.add(props.stateJabFinish.leftShoulder, 'angleZ', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-finish', 'left-shoulder', 'z', value] });
    });
    
    LeftElbowGui2.add(props.stateJabFinish.leftElbow, 'angleX', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-finish', 'left-elbow', 'x', value] });
    });
    LeftElbowGui2.add(props.stateJabFinish.leftElbow, 'angleY', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-finish', 'left-elbow', 'y', value] });
    });
    LeftElbowGui2.add(props.stateJabFinish.leftElbow, 'angleZ', -180, 180, 1).onChange((value) => {
      this.worker.postMessage({ type: 'change-gui', value: ['state-jab-finish', 'left-elbow', 'z', value] });
    });
  }

  async init(data) {
    let imageBitmap = await this.textureManager.toImageBitmap();

    this.worker = new Worker(new URL('./worker-init.js', import.meta.url));
    this.worker.postMessage(
      {
        type: 'init',
        data: { ...data, imageBitmap },
        params: this.params,
      },
      [data.canvas],
    );

    imageBitmap = null;

    this.domEvents = new DomEvents(this.canvas);
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

    //const onMessage = (event) => {
    const onMessage = function (event) {//////////////
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

        case 'start': {
          if (!this.loop.isActive()) {
            this.start(false);
          }

          break;
        }

        case 'pause': {
          if (this.loop.isActive()) {
            this.pause(false);
          }

          break;
        }

        case 'stop': {
          if (this.loop.isActive()) {
            this.stop(false);
          }

          break;
        }

        case 'update': {
          if (!this.params.crossOriginIsolated) {
            const [frameCount, time] = event.data.value;
            this.#frameCount = frameCount;
            this.#elapsedTime = time;
          }

          this.updateStats();
          
          break;
        }

        default: {
        }
      }
    };

    this.onMessage = onMessage.bind(this);
    this.onResize = debounce(GameSettings.resizeDelayTime, onResize.bind(this));

    window.addEventListener('resize', this.onResize);
    window.addEventListener('beforeunload', this.onBeforeUnload);
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
        const [code] = values;
        const key = InputKeys[BindedKeys[code]];

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

  onBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = 'タブを閉じようとしています';
  }

  enableStats(bool = true) {
    this.#statsEnabled = bool;

    if (bool) {
      this.container.appendChild(this.stats.domElement);
    } else {
      this.container.removeChild(this.stats.domElement);
    }
  }

  start(active = true) {
    if (!this.loop.isActive()) {
      this.loop.start();
    }

    if (active) {
      this.worker.postMessage({ type: 'start' });
    }
  }

  pause(active = true) {
    if (this.loop.isActive()) {
      this.loop.stop();
    }

    if (active) {
      this.worker.postMessage({ type: 'pause' });
    }
  }

  stop(active = true) {
    if (this.loop.isActive()) {
      this.loop.stop();
    }

    if (active) {
      this.worker.postMessage({ type: 'stop' });
    }
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener(
      'gamepaddisconnected',
      this.onGamepadDisconnected,
    );
    window.removeEventListener('beforeunload', this.onBeforeUnload);
    this.worker.removeEventListener('message', this.onMessage);

    this.domEvents.dispose();
    this.audioManager.dispose();
    this.textureManager.disposeAll();
    this.container.removeChild(this.canvas);

    this.worker.postMessage({ type: 'dispose' });

    //////for develop///////
    gui.destroy();
    ////////////////////////
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

  async updateStats() {
    this.stats.update();

    const { crossOriginIsolated, canUseWaitAsync } = this.params;

    if (crossOriginIsolated && canUseWaitAsync) {
      const wait = Atomics.waitAsync(this.#sab.waitStats, 0, 0);
      const state = await wait.value;

      this.updateStats();
    }
  }

  async update(frameCount, time) {
    const { crossOriginIsolated, canUseWaitAsync } = this.params;

    if (crossOriginIsolated && canUseWaitAsync) {
      this.#frameCount = this.#sab.data[SharedDataIndex.frameCount];
      this.#elapsedTime = this.#sab.data[SharedDataIndex.time];
    }

    /*if (this.#statsEnabled) {
      this.stats.update();
    }*/

    if (this.#frameCount % GameSettings.SkipFrames === 0) {
      this.callbacks.setElapsedTime(this.#elapsedTime);
    }

    this.updateMain();
  }

  updateMain() {
    const { crossOriginIsolated, canUseWaitAsync } = this.params;

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
      }
    } else if (!crossOriginIsolated) {
      this.worker.postMessage(
        { type: 'update', value: [this.pointerValues, this.keyValues] },
        [this.pointerValues.buffer, this.keyValues.buffer],
      );
      this.pointerValues = new Float32Array(PointerEventSize);
      this.keyValues = new Float32Array(KeyEventSize);
    }
  }
}

export default Game;
