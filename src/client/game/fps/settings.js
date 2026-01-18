import {
  Vector3,
  Euler,
  VSMShadowMap,
  ACESFilmicToneMapping,
  Color,
} from 'three';

const { PI } = Math;

export const Scene = {
  background: 0x111111,
  Fog: {
    color: 0x111111,
    near: 60,
    far: 300,//100,
    density: 0.02,//0.004,
  },
};
export const Camera = {
  FOV: 68,
  near: 0.1,//1,
  far: 200,//400,
  order: 'YXZ',
};

export const Renderer = {
  ShadowMap: {
    enabled: true,
    type: VSMShadowMap,
    toneMapping: ACESFilmicToneMapping,
  },
};
export const Light = {
  Ambient: {
    color: 0xfef9fb,
    intensity: 2,
  },
};

export const Grid = {
  color: 0x71acc4,//0x4d7399,
};

export const Axis = {
  y: new Vector3(0, 1, 0),
  x: new Vector3(1, 0, 0),
  z: new Vector3(0, 0, 1),
};

export const InitialDir = new Vector3(0, 0, 1);

export const Cylinder = {
  color: 0x5a4c3f, // 0x4d4136,
  wireColor: 0x332000,
  pointColor: 0xf4e511, // 0xffff00,
};

export const Ground = {
  color: 0x4d4136,
  wireColor: 0x332000,
  pointColor: 0xf4e511,
};

export const Tower = {
  color: 0x665747, // 0x806d59,
  stairColor: 0x806d59,

  wireColor: 0x332000,
  pointColor: 0xf4e511,
};

export const Column = {
  color: 0x665747,

  wireColor: 0x332000,
  pointColor: 0xf4e511,
};

export const Controls = {
  idleTime: 0.3,
  restoreSpeed: 12,
  restoreMinAngle: PI * 2 * (0.2 / 360),

  pointerMaxMove: 100,
  stickSpeed: 1200,

  inputDuration: 120,

  wheelSpeed: 3,
  horizontalAngleLimit: 160,
  verticalAngleLimit: 80,

  lookSpeed: 135,
  stickMomentum: 16,
  momentum: 10,
};

export const World = {
  oob: -240,
  gravity: 100, //300,
  baseResistance: -6,
  Resistance: {
    ground: 1,
    air: 0.1,
    spin: 5,
    ammo: 0.2,
    obstacle: 1 / 60,
    item: 0.4,
  },
  collisionShock: 0.8,
  pointSize: 0.5, //1.5,
  pointOffset: 0.2, //0.7,
  spacing: 3.6, //12.5,
  fallingDeathDistance: 145,

  urgencyDuration: 0.1,
  stunningDuration: 0.3,

  urgencyTurnDuration: 0.3,
  stunningTurnDuration: 0.1,

  urgencyTurn: (90 / 360) * PI * 2,
};

export const Screen = {
  normalColor: 0xffffff,
  sightPovColor: 0x5aff19,
  sightLinesColor: 0x9e9e9e,
  verticalFrameColor: 0x9e9e9e,
  centerMarkColor: 0x9e9e9e,
  warnColor: 0xffc107,
  sightSize: 36,
  sightPovSize: 384,
  sightLinesSize: 128 * 0.75,
  horizontalIndicatorSize: 128 * 0.75,
  centerMarkSize: 128 * 0.75,
  verticalFrameSize: 384,
  gaugeHeight: 384 * 0.75 - 14,
  arrowColor: 0x2cbbce,
  //arrowSize: { width: 2, height: 4 },
  arrowSize: { width: 0.4, height: 0.8 },
};

export const GameColor = {
  SightColor: {
    front: new Color(Screen.normalColor),
    pov: new Color(Screen.sightPovColor),
  },
  IndicatorColor: {
    normal: new Color(Screen.normalColor),
    beyondFov: new Color(Screen.warnColor),
  },
  SightLinesColor: {
    normal: new Color(Screen.sightLinesColor),
    wheel: new Color(Screen.sightPovColor),
  },
};
