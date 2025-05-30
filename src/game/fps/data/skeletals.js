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

export const Keyframes = new Map([
  [
    Commands.HandsUp,
    {
      times: [0, 2, 6],
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
    ]),
  ],
]);
