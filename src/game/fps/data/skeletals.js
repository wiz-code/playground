const { PI } = Math;

export const Commands = {
  // Idle: 0,
  HandsUp: 10,
};

export const States = {
  Idle: 0,

  HandsUpStart: 10, /// /////
  HandsUpFinish: 11, /// //////
};

export const Events = new Set([Commands.HandsUp]);

export const ProcessingOrder = [
  'left-shoulder',
  'right-shoulder',
  'left-elbow',
  'right-elbow',
];

export const ActionTimes = new Map([
  [States.FightingPose, [0, 1]],
  [States.TestStart, [0, 1]],
  [States.TestFinish, [0, 1]],
]);

export const Keyframes = new Map([
  [
    Commands.HandsUp,
    {
      times: [0, 5, 10],
      states: [States.Idle, States.HandsUpStart, States.HandsUpFinish],
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
                y: (-45 / 360) * PI * 2,
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
    ]),
  ],
  /* [
    'left-upper-arm',
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
                y: (-45 / 360) * PI * 2,
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
    ]),
  ], */
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
                x: (0 / 360) * PI * 2,
                y: (-45 / 360) * PI * 2,
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
    ]),
  ],
]);
