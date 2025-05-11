import {
  Scene as ThreeScene,
  FogExp2,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  Color,
  AmbientLight,
  Texture,
} from 'three';

import { Game as GameSettings } from '../settings';
import { Scene, Camera, World, Light } from './settings';
import FirstPersonControls from './controls';
import GamepadControls from './gamepad.controls';
import { GameStates, PlayState, CommonEvents } from './constants';
import { Methods } from './data/methods';
import { Heroes } from './data/entities';
import Levels from './data/levels';
import { Commands } from './data/skeletals';
import createLevel from './create-level';
import ObjectManager from './object-manager';
import SceneManager from './scene-manager';
import Character from './character';
import Player from './player';
import Obstacle from './obstacle';
import EventManager from './event-manager';
/* import ScoreManager from './score-manager'; */
import MovableManager from './movable-manager';
import GridProcessor from './grid-processor';
import Movable from './movable';

import { offsetPosition, disposeObject } from './utils';

const { floor, min, exp } = Math;
const levelMap = new Map(Levels);

const { baseResistance } = World;
const resistances = Object.entries(World.Resistance);
const dampingData = {};
const getDamping = (delta) => {
  const base = exp(baseResistance * delta) - 1;

  for (let i = 0, l = resistances.length; i < l; i += 1) {
    const [key, value] = resistances[i];
    const result = base * value;
    dampingData[key] = result;
  }

  return dampingData;
};
self.promiseList = new Map();

const heroMap = new Map(Heroes);

class WorkerMain {
  #gamepadIndex = -1;

  #startTime = 0;

  #elapsedTime = 0;

  #frameCount = 0;

  constructor(data, params) {
    const { canvas, width, height, sab, imageBitmap } = data;

    this.params = { ...params };

    imageBitmap.forEach((value, key, map) => {
      const texture = new Texture(value);
      texture.needsUpdate = true;
      map.set(key, texture);
    });
    self.texture = imageBitmap;

    this.canvas = canvas;
    this.canvas.style = { width: 0, height: 0 };

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      preserveDrawingBuffer: true,
    });

    this.renderer.autoClear = false;
    this.renderer.setClearColor(new Color(0x000000));
    this.renderer.setPixelRatio(this.params.devicePixelRatio);

    this.sab = sab;

    this.data = {};

    // ゲーム管理変数
    this.game = {};
    this.game.states = new Map(GameStates);
    this.game.states.set('gameId', this.params.gameId);
    this.game.states.set('heroId', this.params.heroId);
    this.game.states.set('levelId', this.params.levelId);

    this.game.methods = new Map(Methods);
    this.game.methods.forEach((value, key, map) =>
      map.set(key, value.bind(this)),
    );

    this.game.level = {};
    const levels = levelMap.get(this.params.gameId);
    this.game.level.data = new Map(levels);

    this.pendingList = [];
    this.cache = { controls: null };

    this.sceneManager = new SceneManager(this.renderer);

    this.scene = {};
    this.camera = {};

    this.scene.field = new ThreeScene();
    this.scene.field.background = new Color(Scene.background);
    this.scene.field.fog = new FogExp2(Scene.Fog.color, Scene.Fog.density);
    /// ///////////////////
    this.game.scene = this.scene.field;
    /// ////////////////
    this.scene.screen = new ThreeScene();
    this.indicators = SceneManager.createIndicators();
    const { povSight, povSightLines, povIndicator, centerMark, verticalFrame } =
      this.indicators;
    this.scene.screen.add(povSight);
    this.scene.screen.add(povSightLines);
    this.scene.screen.add(povIndicator.horizontal);
    this.scene.screen.add(povIndicator.vertical);
    this.scene.screen.add(centerMark);
    this.scene.screen.add(verticalFrame);

    this.camera.field = new PerspectiveCamera(
      Camera.FOV,
      width / height,
      Camera.near,
      Camera.far,
    );
    this.camera.field.rotation.order = Camera.order;
    this.camera.field.position.set(0, 0, 0);

    const halfWidth = floor(width / 2);
    const halfHeight = floor(height / 2);
    this.camera.screen = new OrthographicCamera(
      -halfWidth,
      halfWidth,
      halfHeight,
      -halfHeight,
      0.1,
      1000,
    );

    this.eventManager = new EventManager();
    this.movableManager = new MovableManager(this.game);
    this.gridProcessor = new GridProcessor();

    this.sceneManager.add('field', this.scene.field, this.camera.field);
    this.sceneManager.add('screen', this.scene.screen, this.camera.screen);

    this.light = {};
    this.light.ambient = new AmbientLight(
      Light.Ambient.color,
      Light.Ambient.intensity,
    );
    this.scene.field.add(this.light.ambient);

    this.objectManager = new ObjectManager(
      this.game,
      this.scene.field,
      this.eventManager,
      this.movableManager,
    );

    this.player = null;
    this.controls = null;

    this.onMessage = this.onMessage.bind(this);
    self.addEventListener('message', this.onMessage);

    this.init();

    if (this.params.crossOriginIsolated && this.params.canUseWaitAsync) {
      this.awaitWorker();
    }
  }

  async init() {
    this.setLevel();

    await new Promise((resolve) => {
      if (!self.promiseList.has('create-controls')) {
        self.promiseList.set('create-controls', resolve);
      }
    });

    const heroId = this.game.states.get('heroId');
    const data = heroMap.get(heroId);

    this.player = new Player(this.game, data.name, data.subtype);

    const levelId = this.game.states.get('levelId');
    const sdata = this.game.level.data.get(levelId);
    const sectionIndex = this.game.states.get('sectionIndex');
    const { checkpoint, offset } = sdata.sections[sectionIndex];

    const coords = this.getInitCoords();
    const event = {
      name: 'spawn',
      type: 'timeout',
      condition: {
        delay: 0.1,
      },
      params: coords,
      handler: 'show',
    };

    this.player.setControls(this.camera.field, this.controls);
    this.objectManager.add(this.player);
    this.eventManager.watch(this.player);
    this.player.addEvent(event);
    this.player.activate('spawn');

    await new Promise((resolve) => {
      self.postMessage({ type: 'request-resize' });

      if (!self.promiseList.has('request-resize')) {
        self.promiseList.set('request-resize', resolve);
      }
    });

    Promise.allSettled(this.pendingList).then(() => {
      self.postMessage({ type: 'loaded' });
    });
  }

  onMessage(event) {
    switch (event.data.type) {
      case 'resize': {
        const [width, height] = event.data.value;

        const halfWidth = floor(width / 2);
        const halfHeight = floor(height / 2);
        this.camera.field.aspect = width / height;
        this.camera.field.updateProjectionMatrix();

        this.camera.screen.left = -halfWidth;
        this.camera.screen.right = halfWidth;
        this.camera.screen.top = halfHeight;
        this.camera.screen.bottom = -halfHeight;
        this.camera.screen.updateProjectionMatrix();

        this.controls.handleResize(width, height);
        this.renderer.setSize(width, height, false);
        this.sceneManager.update();

        if (self.promiseList.has('request-resize')) {
          const resolve = self.promiseList.get('request-resize');
          self.promiseList.delete('request-resize');
          resolve();
        }

        break;
      }

      // 最初のゲームスタート時は必ず呼ばれる。ゲームパッド認識後、二度目移行は呼ばれない
      case 'create-controls': {
        this.controls = new FirstPersonControls(
          this.indicators,
          this.camera.field,
        );
        this.cache.controls = this.controls;

        if (self.promiseList.has('create-controls')) {
          const resolve = self.promiseList.get('create-controls');
          self.promiseList.delete('create-controls');
          resolve();
        }
        break;
      }

      case 'gamepad-connected': {
        this.#gamepadIndex = event.data.value;
        this.controls = this.createGamepadControls(this.#gamepadIndex);

        if (this.cache.controls == null) {
          this.cache.controls = this.controls;
        }

        // ゲームパッド認識後に再スタート
        if (self.promiseList.has('create-controls')) {
          const resolve = self.promiseList.get('create-controls');
          self.promiseList.delete('create-controls');
          resolve();
        } else {
          this.controls.enable(false);
          this.initGamepad();
        }
        break;
      }

      case 'gamepad-disconnected': {
        this.#gamepadIndex = -1;
        this.controls.enable(false);
        this.player.unsetControls();

        if (this.cache.controls != null) {
          this.controls = this.cache.controls;

          this.player.setControls(this.camera.field, this.controls);
        }
        break;
      }

      case 'key-down': {
        if (this.controls == null) {
          return;
        }

        const [code, repeat, shiftKey, altKey] = event.data.value;
        this.controls.onKeyDown(code, repeat, shiftKey, altKey);
        break;
      }

      case 'key-up': {
        if (this.controls == null) {
          return;
        }

        const [code, shiftKey, altKey] = event.data.value;
        this.controls.onKeyUp(code, shiftKey, altKey);
        break;
      }

      case 'start': {
        this.start();
        break;
      }

      case 'pause': {
        this.pause();
        break;
      }

      case 'stop': {
        this.stop();
        break;
      }

      case 'dispose': {
        this.dispose();
        break;
      }

      case 'send-param': {
        const [name, value] = event.data.value;
        this.params[name] = value;
        break;
      }

      case 'update': {
        const { value } = event.data;

        if (this.#gamepadIndex !== -1) {
          if (!this.params.crossOriginIsolated) {
            const [buttons, axes] = value;
            this.controls.input(buttons, axes);
          } else {
            const { buttons, axes } = this.sab;
            this.controls.input(buttons, axes);
          }
        } else {
          if (!this.params.crossOriginIsolated) {
            const [pointerValues, keyValues] = value;
            this.controls.handleEvents(pointerValues, keyValues);
          } else {
            this.controls.handleEvents(
              this.sab.pointerValues,
              this.sab.keyValues,
            );
            this.sab.pointerValues.fill(0);
            this.sab.keyValues.fill(0);
          }

          this.controls.input();
        }

        this.update();

        break;
      }

      default: {
      }
    }
  }

  async initGamepad() {
    await new Promise((resolve) => {
      self.postMessage({ type: 'request-resize' });

      if (!self.promiseList.has('request-resize')) {
        self.promiseList.set('request-resize', resolve);
      }
    });

    this.player.setControls(this.camera.field, this.controls);

    this.controls.enable();
  }

  setLevel() {
    this.clearLevel();

    this.eventManager.addEvents(CommonEvents);

    const levelId = this.game.states.get('levelId');
    const sdata = this.game.level.data.get(levelId);

    const { level, bvh, helper } = createLevel(
      sdata,
      this.params.crossOriginIsolated,
    );

    this.movableManager.setBVH(bvh);
    this.scene.field.add(level);
    this.scene.field.add(bvh);

    const grids = level.getObjectsByProperty('type', 'grid');
    this.gridProcessor.addList(grids);
    // this.helper = helper;this.scene.field.add(helper);//////////

    this.game.level.object = level;
    this.game.level.meshBVH = bvh;

    for (let i = 0, l = sdata.sections.length; i < l; i += 1) {
      const { characters, movables } = sdata.sections[i];

      characters.forEach((data) => {
        const character = new Character(this.game, data.name, data.subtype);

        this.objectManager.add(character);

        if (data.params != null) {
          character.setParams(data.params);
        }

        if (data.events != null) {
          this.eventManager.watch(character);
          character.addEvents(data.events);
          character.activate('spawn', 'timeout');
          character.activate('start-animation', 'timeout');
        }

        if (Array.isArray(data.updaters)) {
          character.setUpdaters(data.updaters);
        }
      });

      movables.forEach((data) => {
        const { name, updaters } = data;
        const movable = new Movable(name);
        movable.setUpdaters(updaters);
        this.movableManager.addObject(movable);
      });
    }

    /// ///////////
    for (let i = 0; i < 1; i += 1) {
      const rx = Math.random() * 20 - 10;
      const rz = Math.random() * 20 - 10;

      const edata = {
        id: 'enemy-2',
        name: '敵キャラ２',
        subtype: 'heroine-1',

        events: [
          {
            name: 'spawn',
            type: 'timeout',
            condition: {
              delay: 6,
            },
            params: {
              position: { x: rx, y: 0, z: rz },
              rotation: { y: 0 },
            },
            handler: 'show',
          }, // eventManager管理
        ],
        /* updaters: [
          {
            name: 'updater-2',
            updater: 'self-rotation',
            params: {},
            options: {
              autoStart: true,
              duration: 3,
              repeat: true,
            },
          },
        ], */
        params: {
          //
        },
      };

      const enemy = new Character(this.game, edata.name, edata.subtype);

      this.eventManager.watch(enemy);
      enemy.addEvents(edata.events);
      enemy.activate('spawn', 'timeout');

      // enemy.startAnimation(Commands.HandsUp); /// ///////

      if (Array.isArray(edata.updaters)) {
        enemy.setUpdaters(edata.updaters);
      }
      this.objectManager.add(enemy);
    }

    for (let i = 0; i < 1 /* 100 */; i += 1) {
      const rx = Math.random() * 20 - 10;
      const rz = Math.random() * 40 - 10;

      const event = {
        name: 'spawn',
        type: 'timeout',
        condition: {
          delay: 8,
        },
        params: {
          position: { x: rx, y: 0, z: rz },
          rotation: { y: 0 },
        },
        handler: 'show',
      };

      const obstacle = new Obstacle(this.game, '障害物', 'round-stone');
      this.objectManager.add(obstacle);
      this.eventManager.watch(obstacle);
      obstacle.addEvents(event);
      obstacle.activate('spawn', 'timeout');
    }
    /// /////////////////

    const { bgm } = this.game.level.data.get(levelId);
    const data = {
      name: 'play-music',
      type: 'timeout',
      condition: { delay: 0 },
      params: { name: bgm },
      handler: 'play-music',
    };
    this.eventManager.addEvent(data);
    this.eventManager.activate(null, 'play-music');
  }

  getInitCoords() {
    const levelId = this.game.states.get('levelId');
    const sectionIndex = this.game.states.get('sectionIndex');
    const sdata = this.game.level.data.get(levelId);
    const { checkpoint, offset } = sdata.sections[sectionIndex];

    const position = offsetPosition(checkpoint.position, offset);
    return { position, rotation: checkpoint.rotation };
  }

  getElapsedTime() {
    return this.#elapsedTime;
  }

  resetTime() {
    this.#elapsedTime = 0;
  }

  createGamepadControls(index) {
    const controls = new GamepadControls(
      index,
      this.indicators,
      this.camera.field,
    );

    return controls;
  }

  async setScene(scene) {
    this.game.states.set('scene', scene);

    switch (scene) {
      case 'play': {
        self.postMessage({ type: 'set-scene', value: 'play' });
        break;
      }

      case 'clear': {
        self.postMessage({ type: 'set-scene', value: 'clear' });
        break;
      }

      default: {
        //
      }
    }
  }

  clearLevel() {
    this.objectManager.clearList();
    this.movableManager.clearBVH();
    this.eventManager.clearMap();
    this.scene.field.clear();

    /* this.game.states.set('time', 0);
    this.game.states.set('falls', 0);
    this.game.states.set('hits', 0);
    this.game.states.set('push-away', 0);
    this.game.states.set('no-checkpoint', 0);

    self.postMessage({ type: 'set-score', value: null });

    this.game.ammos.clear();//////
    this.game.characters.clear();
    this.game.items.clear();
    this.game.obstacles.clear(); */
  }

  dispose() {
    this.scene.field.traverse(disposeObject);
    this.scene.screen.traverse(disposeObject);

    this.objectManager.dispose();
    this.eventManager.dispose();
    this.movableManager.dispose();
    this.controls.dispose();

    this.game.level = null;
    this.scene.field.clear();
    this.scene.screen.clear();

    // this.skeletalManager.dispose(); /// /////////

    this.renderer.dispose();
    self.close();
  }

  setParams(name, value) {
    this.params[name] = value;
  }

  start() {
    const playState = this.game.states.get('playState');
    const currentTime = performance.now() / 1000;

    if (playState === PlayState.idle) {
      this.#startTime = currentTime;
      this.#elapsedTime = 0;
    } else if (playState === PlayState.paused) {
      this.#startTime = currentTime - this.#elapsedTime;
    }

    this.game.states.set('playState', PlayState.running);
  }

  stop() {
    this.game.states.set('playState', PlayState.idle);
  }

  pause() {
    const playState = this.game.states.get('playState');

    if (playState === PlayState.running) {
      this.game.states.set('playState', PlayState.paused);
    }
  }

  async awaitWorker() {
    const wait = Atomics.waitAsync(this.sab.waitWorker, 0, 0);
    await wait.value;

    this.controls.handleEvents(this.sab.pointerValues, this.sab.keyValues);
    this.sab.pointerValues.fill(0);
    this.sab.keyValues.fill(0);
    this.controls.input();

    this.update();
  }

  update() {
    this.#frameCount += 1;

    let elapsedTime = this.#elapsedTime;
    const currentTime = performance.now() * 0.001;
    this.#elapsedTime = currentTime - this.#startTime;

    const deltaTime = this.#elapsedTime - elapsedTime;
    const additional = floor(deltaTime / GameSettings.FPS60);
    const stepsPerFrame = min(
      GameSettings.stepsPerFrame + additional,
      GameSettings.maxSteps,
    );
    const delta = deltaTime / stepsPerFrame;
    const damping = getDamping(delta);

    this.eventManager.update(deltaTime, this.#elapsedTime);
    this.movableManager.update(deltaTime);
    this.gridProcessor.update(this.#elapsedTime);

    for (let i = 1; i <= stepsPerFrame; i += 1) {
      elapsedTime += delta;
      this.controls.update(delta);
      this.objectManager.update(delta, elapsedTime, damping, i, stepsPerFrame);
    }

    this.sceneManager.update();
    // this.helper.update();

    this.game.states.set('time', this.#elapsedTime);

    const { crossOriginIsolated, canUseWaitAsync } = this.params;

    if (!crossOriginIsolated) {
      if (this.#frameCount % GameSettings.SkipFrames === 0) {
        self.postMessage({
          type: 'set-elapsed-time',
          value: this.#elapsedTime,
        });
      }
    } else {
      this.sab.time[0] = this.#elapsedTime;
    }

    if (!(crossOriginIsolated && canUseWaitAsync)) {
      self.postMessage({ type: 'worker-updated' });
    } else {
      this.awaitWorker();
      Atomics.notify(this.sab.waitMain, 0);
    }
  }
}

export default WorkerMain;
