import { Parts } from '../constants';

const { PI } = Math;

export const Clips = {
  HandsUp: 'hands-up',
  JabPunch: 'jab-punch',
};

export const States = {
  Idle: 0,

  HandsUpStart: 10, /// /////
  HandsUpFinish: 11, /// //////

  JabStart: 20,
  JabThrow: 21,
  JabInpact: 22,
  JabFinish: 23,
};

export const Events = new Set([Clips.HandsUp, Clips.JabPunch]); /// ///

export const AnimationClips = new Map([
  [
    Clips.JabPunch,
    {
      parts: [Parts.Body, Parts.LeftShoulder, Parts.LeftElbow],
      relative: false,////////////
      keyframes: [
        {
          state: States.Idle,
          time: 0,
          
        },
        {
          state: States.JabStart,
          time: 0.6,
        },
        {
          state: States.JabImpact,
          time: 0.8,
        },
        {
          state: States.JabFinish,
          time: 1.0,
        },
        {
          state: States.Idle,
          time: 1.4,
        },
      ],
    },
  ],
]);

export const KeyPoses = new Map([
  [
    Parts.Body,
    new Map([
      [
        States.Idle,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.JabStart,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
              /*x: (0 / 360) * PI * 2,
              y: (15 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,*/
            },
          },
        ],
      ],
      [
        States.JabFinish,
        [
          {
            key: '.quaternion',
            value: {
              /*x: (0 / 360) * PI * 2,
              y: (-30 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,*/
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
    ]),
  ],
  [
    Parts.LeftShoulder,
    new Map([
      [
        States.Idle,
        [
          {
            key: '.quaternion',
            value: {
              x: (80 / 360) * PI * 2,
              y: (30 / 360) * PI * 2,
              z: (-90 / 360) * PI * 2,
              /*x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,*/
            },
          },
        ],
      ],
      [
        States.HandsUpStart,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (105 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.HandsUpFinish,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.JabStart,
        [
          {
            key: '.quaternion',
            value: {
              /*x: (15 / 360) * PI * 2,
              y: (50 / 360) * PI * 2,
              z: (-40 / 360) * PI * 2,*/
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.JabImbact,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.JabFinish,
        [
          {
            key: '.quaternion',
            value: {
              /*x: (0 / 360) * PI * 2,
              y: (-75 / 360) * PI * 2,
              z: (75 / 360) * PI * 2,*/
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
    ]),
  ],
  [
    Parts.LeftElbow,
    new Map([
      [
        States.Idle,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (-135 / 360) * PI * 2,
              z: (-90 / 360) * PI * 2,
              /*x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,*/
            },
          },
        ],
      ],
      [
        States.HandsUpStart,
        [
          {
            key: '.quaternion',
            value: {
              x: (105 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.HandsUpFinish,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.JabStart,
        [
          {
            key: '.quaternion',
            value: {
              /*x: (20 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (70 / 360) * PI * 2,*/
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.JabImbact,
        [
          {
            key: '.quaternion',
            value: {
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
      [
        States.JabFinish,
        [
          {
            key: '.quaternion',
            value: {
              /*x: (-135 / 360) * PI * 2,
              y: (-10 / 360) * PI * 2,
              z: (45 / 360) * PI * 2,*/
              x: (0 / 360) * PI * 2,
              y: (0 / 360) * PI * 2,
              z: (0 / 360) * PI * 2,
            },
          },
        ],
      ],
    ]),
  ],
]);
