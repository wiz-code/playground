import { Vector3 } from 'three';

export const InputKeys = {
  // event.codeで取得する
  KeyW: 1,
  ArrowUp: 1,
  KeyS: 2,
  ArrowDown: 2,

  KeyA: 3,
  ArrowLeft: 3,
  KeyD: 4,
  ArrowRight: 4,

  KeyQ: 5,
  KeyE: 6,

  KeyR: 7,
  KeyF: 8,
  KeyZ: 9,
  KeyX: 10,
  KeyC: 11,

  Space: 20,

  // event.shiftKeyなどの真偽値で取得
  Shift: 30,
  ShiftLeft: 30,
  ShiftRight: 30,
  Alt: 40,
  AltLeft: 40,
  AltRight: 40,
};

export const MashKeys = [
  'KeyW',
  'ArrowUp',

  'KeyA',
  'ArrowLeft',

  'KeyS',
  'ArrowDown',

  'KeyD',
  'ArrowRight',

  'KeyQ',
  'KeyE',
];

export const Pointers = {
  left: 0,
  center: 1,
  right: 2,
};

export const Actions = {
  moveForward: 0,
  moveBackward: 1,
  rotateLeft: 2,
  rotateRight: 3,
  moveLeft: 4,
  moveRight: 5,

  jump: 10,
  trigger: 11,

  sprint: 20,

  quickMoveForward: 30,
  quickMoveBackward: 31,
  quickTurnLeft: 32,
  quickTurnRight: 33,
  quickMoveLeft: 34,
  quickMoveRight: 35,
};

export const States = {
  alive: 0,
  urgency: 1,
  stunning: 2,
};

export const PlayState = {
  idle: 0,
  running: 1,
  paused: 2,
};

export const UrgentActions = [
  Actions.quickMoveForward,
  Actions.quickMoveBackward,
  Actions.quickTurnLeft,
  Actions.quickTurnRight,
  Actions.quickMoveLeft,
  Actions.quickMoveRight,
];

export const CommonEvents = [
  { name: 'fall-down', type: 'immediate', handler: 'fall-down' },
  { name: 'oob', type: 'immediate', handler: 'oob' },
];

export const EventMap = [
  /// ////////
  ['immediate', { delegate: false }],
  ['timeout', { delegate: true }],
  ['interval', { delegate: true }],
];

export const GameStates = [
  ['gameId'],
  ['gameName', ''],
  ['heroId', ''],
  ['levelId', ''],
  ['sectionIndex', 0],

  ['playState', PlayState.idle], // 'idle', 'running', 'paused'
  ['scene', 'loading'], // 'loading', 'title', play', 'clear'
  // score state
  ['time', 0],
  ['falls', 0],
  ['hits', 0],
  ['push-away', 0],
  ['no-checkpoint', 0],
];
