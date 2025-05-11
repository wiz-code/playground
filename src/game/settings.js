import { Vector3, VSMShadowMap, ACESFilmicToneMapping, Color } from 'three';

const { PI } = Math;

export const Game = {
  maxSteps: 15,
  stepsPerFrame: 5,
  resizeDelayTime: 200,
  volume: 0.5,
  EPS: 1e-6,
  longDistance: 10000,
  RAD30: (30 / 360) * PI * 2,
  RAD1: (1 / 360) * PI * 2,
  SkipFrames: 5,
  FPS60: 1 / 60,
  HalfPI: PI * 0.5,
};

export const Sound = {
  volume: 100,
  mute: false,
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
  /* assets: 'assets/',
  images: 'assets/images/',
  sounds: 'assets/sounds/', */
};
