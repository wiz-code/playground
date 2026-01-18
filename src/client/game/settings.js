import { Vector3, VSMShadowMap, ACESFilmicToneMapping, Color } from 'three';

const { PI } = Math;

export const Game = {
  maxSteps: 15,
  stepsPerFrame: 5,
  resizeDelayTime: 200,
  EPS: 1e-6,
  longDistance: 10000,
  RAD30: (30 / 360) * PI * 2,
  RAD1: (1 / 360) * PI * 2,
  SkipFrames: 5,
  FPS60: 1 / 60,
  HalfPI: PI * 0.5,
};

export const Sound = {
  volume: 50,
  mute: false,
};

export const BindedKeys = {
  KeyW: 'KeyW',
  ArrowUp: 'KeyW',
  KeyS: 'KeyS',
  ArrowDown: 'KeyS',

  KeyA: 'KeyA',
  ArrowLeft: 'KeyA',
  KeyD: 'KeyD',
  ArrowRight: 'KeyD',

  KeyQ: 'KeyQ',
  KeyE: 'KeyE',

  KeyR: 'KeyR',
  KeyF: 'KeyF',
  KeyZ: 'KeyZ',
  KeyX: 'KeyX',
  KeyC: 'KeyC',

  Space: 'Space',

  // event.shiftKeyなどの真偽値で取得
  Shift: 'Shift',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  Alt: 'Alt',
  AltLeft: 'Alt',
  AltRight: 'Alt',
};

export const BindedButtons = {
  a: 'a',
  b: 'b',
  x: 'x',
  y: 'y',
  lb: 'lb',
  rb: 'rb',
  lt: 'lt',
  rt: 'rt',
  back: 'back',
  start: 'start',
  lsb: 'lsb',
  rsb: 'rsb',
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  guide: 'guide',
};

/// //////////////////////////////////////
const filename = 'index.html';
const { pathname } = location;
let prefix = '';

if (pathname.includes(filename)) {
  const lastIndex = pathname.lastIndexOf(filename);
  prefix = pathname.substring(0, lastIndex);
}

export const Url = {
  images: `${prefix}/images/`,
  sounds: `${prefix}/sounds/`,
  objects: `${prefix}/objects/`,
  /* assets: 'assets/',
  images: 'assets/images/',
  sounds: 'assets/sounds/', */
};
