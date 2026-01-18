import { Vector3 } from 'three';

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

export const Parts = {
  Body: 'body',
  UpperBody: 'upper-body',
  LowerBody: 'lower-body',
  LeftShoulder: 'left-shoulder',
  LeftUpperarm: 'left-upperarm',
  LeftElbow: 'left-elbow',
  LeftForearm: 'left-forearm',
  LeftHand: 'left-hand',
  RightShoulder: 'right-shoulder',
  RightUpperarm: 'right-upperarm',
  RightElbow: 'right-elbow',
  RightForearm: 'right-forearm',
  RightHand: 'right-hand',
};