const { PI } = Math;

export const Commands = {
  HandsUp: 0,
  JabPunch: 1,
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

export const Events = new Set([Commands.HandsUp, Commands.JabPunch]); /// ///

export const ProcessingOrder = [
  'left-shoulder',
  'right-shoulder',
  'left-elbow',
  'right-elbow',
];

export const Keyframes = new Map([
  [
    Commands.HandsUp,
    {
      times: [0, 2, 6],
      states: [States.Idle, States.HandsUpStart, States.HandsUpFinish],
    },
  ],
  [
    Commands.JabPunch,
    {
      times: [0, 0.6, 0.8, 1.2],
      // times: [0, 2, 4, 6],
      states: [States.Idle, States.JabStart, States.JabFinish, States.Idle],
    },
  ],
]);

export const Posings = new Map([
  [
    'left-shoulder',
    new Map([
      [
        States.Idle,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (0 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.HandsUpStart,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (0 / 360) * PI * 2,
                y: (105 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.HandsUpFinish,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (0 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.JabStart,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (10 / 360) * PI * 2,
                y: (30 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.JabFinish,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (0 / 360) * PI * 2,
                y: (-70 / 360) * PI * 2,
                z: (30 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
    ]),
  ],
  [
    'left-elbow',
    new Map([
      [
        States.Idle,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (0 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.HandsUpStart,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (105 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.HandsUpFinish,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (0 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.JabStart,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (10 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (30 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
      [
        States.JabFinish,
        [
          {
            key: '.quaternion',
            transform: {
              rotation: {
                x: (-100 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (120 / 360) * PI * 2,
              },
            },
          },
        ],
      ],
    ]),
  ],
]);
