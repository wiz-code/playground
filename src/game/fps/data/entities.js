import { getSpherical } from '../utils';

const { PI } = Math;

const CommonStyle = {
  color: 0x007399,
  wireColor: 0x004d66,
  pointColor: 0xeb4b2f,
  faceColor: 0xdc143c,
  faceWireColor: 0xdb6e84,
  navelColor: 0xff69b4,
};

const CommonStats = {
  arrowPitch: (-12.5 / 360) * 2 * PI, /// /////
  moveSideCoef: 0.8,
};

export const Heroes = [
  [
    'hiroi-kun',
    {
      name: 'ヒロイくん',
      subtype: 'hero-1',

      events: [
        {
          name: 'spawn',
          type: 'timeout',
          condition: {
            delay: 0.1,
          },
          handler: 'show',
        },
      ],
    },
  ],
];

export const Characters = [
  [
    'hero-1',
    {
      stats: {
        ...CommonStats,

        arrowOffsetY: 1,
        arrowOffsetZ: 4,
        cameraOffsetY: 2,

        moveAccel: 180,
        airMoveAccel: 50,

        turnSpeed: 1.8,
        sprint: 2.5,
        urgencyMoveAccel: 8,
        rotAccel: 50,

        jumpPower: 120,
        satelliteSpeed: 2,
      },

      collidable: {
        name: 'body1',
        type: 'object',
        body: {
          shape: 'body',
          style: {
            ...CommonStyle,

            color: 0x007399,
            wireColor: 0x004d66,
            pointColor: 0xeb4b2f,
            faceColor: 0xdc143c,
            faceWireColor: 0xdb6e84,
          },
          size: { radius: 2, height: 4 },
        },
        collider: {
          shape: 'capsule',
          stats: { weight: 1 },
          size: { radius: 2, height: 4 },
        },
        children: [],
      },
    },
  ],
  [
    'hero-2',
    {
      stats: {
        ...CommonStats,

        arrowOffsetY: 1,
        arrowOffsetZ: 4,
        cameraOffsetY: 2,

        moveAccel: 180,
        airMoveAccel: 50,

        turnSpeed: 1.8,
        sprint: 2.5,
        urgencyMoveAccel: 8,
        rotAccel: 50,

        jumpPower: 120,
        satelliteSpeed: 2,
      },

      collidable: {
        name: 'body2',
        type: 'object',
        offset: {/////////////////////
          rotation: {
            x: (0 / 360) * PI * 2,
            y: (0 / 360) * PI * 2,
            z: (0 / 360) * PI * 2,
          },
        },

        body: {
          shape: 'body',
          style: {
            ...CommonStyle,

            color: 0x007399,
            backColor: 0x87ceeb, /////////////////////////////////////
            wireColor: 0x004d66,
            pointColor: 0xeb4b2f,
            faceColor: 0xdc143c,
            faceWireColor: 0xdb6e84,
          },
          wireframe: true,
          satellite: true,
          size: { radius: 2, height: 4 },
        },
        collider: {
          shape: 'capsule',
          stats: { weight: 1 },
          size: { radius: 2, height: 4 },
        },
        children: [
          {
            name: 'left-shoulder',
            type: 'joint',
            offset: {
              rotation: {
                x: (90 / 360) * PI * 2,
                y: (30 / 360) * PI * 2,
                z: (-90 / 360) * PI * 2,
              },
              position: { x: 2, y: 2, z: 0 },
            },
            body: {
              shape: 'sphere',
              style: {
                ...CommonStyle,

                color: 0x7fffd4,
                backColor: 0x87ceeb,
                wireColor: 0x004d66,
                pointColor: 0xeb4b2f,
              },
              size: { radius: 0.7 },
              wireframe: true,
              satellite: true,
              satelliteCap: 'none',
              pointSize: 'small',
            },
            collider: {
              shape: 'sphere',
              stats: { weight: 1 },
              size: { radius: 0.7 },
              // enabled: false,
            },
            skeletal: { name: 'left-shoulder', options: { loop: true, relative: true } },
            children: [
              {
                name: 'left-upper-arm',
                type: 'arm',
                offset: {
                  position: { x: 0, y: 0, z: 1.1 },
                  rotation: {
                    x: (0 / 360) * PI * 2,
                    y: (0 / 360) * PI * 2,
                    z: (0 / 360) * PI * 2,
                  },
                },
                body: {
                  shape: 'capsule',
                  style: {
                    ...CommonStyle,

                    color: 0x7fffd4,
                    backColor: 0x87ceeb,
                    wireColor: 0x004d66,
                    pointColor: 0xeb4b2f,
                  },
                  transform: {
                    //rotation: { z: -PI * 0.5 },
                  },
                  wireframe: true,
                  satellite: true,
                  satelliteCap: 'none',
                  pointSize: 'small',
                  size: { radius: 0.4, height: 3 },
                },
                collider: {
                  shape: 'capsule',
                  stats: { weight: 1 },
                  size: { radius: 0.4, height: 3 },
                },
                children: [
                  {
                    name: 'left-elbow',
                    type: 'joint',
                    skeletal: { name: 'left-elbow', options: { loop: true } },
                    offset: {
                      rotation: {
                        x: (0 / 360) * PI * 2,
                        y: (-135 / 360) * PI * 2,
                        z: (-105 / 360) * PI * 2,
                      },
                      position: { x: 0, y: 0, z: 1.1 },
                    },
                    body: {
                      shape: 'sphere',
                      style: {
                        ...CommonStyle,

                        color: 0x7fffd4,
                        backColor: 0x87ceeb,
                        wireColor: 0x004d66,
                        pointColor: 0xeb4b2f,
                      },
                      size: { radius: 0.7 },
                      wireframe: true,
                      satellite: true,
                      satelliteCap: 'none',
                      pointSize: 'small',
                    },
                    collider: {
                      shape: 'sphere',
                      stats: { weight: 1 },
                      size: { radius: 0.7 },
                      // enabled: false,
                    },
                    children: [
                      {
                        name: 'left-forearm',
                        type: 'arm',
                        offset: {
                          position: { x: 0, y: 0, z: 1.1 },
                          rotation: {
                            x: (0 / 360) * PI * 2,
                            y: (0 / 360) * PI * 2,
                            z: (0 / 360) * PI * 2,
                          },
                        },
                        body: {
                          shape: 'capsule',
                          style: {
                            ...CommonStyle,

                            color: 0x7fffd4,
                            backColor: 0x87ceeb,
                            wireColor: 0x004d66,
                            pointColor: 0xeb4b2f,
                          },
                          transform: {
                            //rotation: { z: -PI * 0.5 },
                          },
                          wireframe: true,
                          satellite: true,
                          satelliteCap: 'none',
                          pointSize: 'small',
                          size: { radius: 0.4, height: 3 },
                        },
                        collider: {
                          shape: 'capsule',
                          stats: { weight: 1 },
                          size: { radius: 0.4, height: 3 },
                        },
                        children: [
                          {
                            name: 'left-hand',
                            type: 'joint',
                            offset: {
                              rotation: { y: 0 },
                              position: { x: 0, y: 0, z: 1.4 },
                            },
                            body: {
                              shape: 'sphere',
                              style: {
                                ...CommonStyle,

                                color: 0x7fffd4,
                                backColor: 0x87ceeb,
                                wireColor: 0x004d66,
                                pointColor: 0xeb4b2f,
                              },
                              size: { radius: 1 },
                              wireframe: true,
                              satellite: true,
                              satelliteCap: 'end',
                            },
                            collider: {
                              shape: 'sphere',
                              stats: { weight: 3 },
                              size: { radius: 1 },
                              // enabled: false,
                            },
                            // skeletal: { name: 'left-hand' },
                            children: [
                              //
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  [
    'heroine-1',
    {
      stats: {
        ...CommonStats,

        moveAccel: 180,
        airMoveAccel: 50,

        turnSpeed: 1.8,
        sprint: 2.5,
        urgencyMoveAccel: 8,
        rotAccel: 50, // 20,

        jumpPower: 120,
        satelliteSpeed: 2,
      },

      collidable: {
        name: 'core',
        type: 'object',
        body: {
          shape: 'body',
          style: {
            ...CommonStyle,

            color: 0xfff0f5,
            wireColor: 0xffd700,
            pointColor: 0xeb4b2f,
            faceColor: 0x87ceeb,
            faceWireColor: 0xffd700,
          },
          size: { radius: 2, height: 4 },
        },
        collider: {
          shape: 'capsule',
          stats: { weight: 1 },
          size: { radius: 2, height: 4 },
        },
        children: [
          {
            name: 'left-shoulder',
            type: 'joint',
            offset: {
              rotation: { x: (0 / 360) * PI * 2 },
              position: { x: 6, y: 2, z: 0 },
            },
            body: {
              shape: 'sphere',
              style: {
                ...CommonStyle,

                color: 0x7fffd4,
                wireColor: 0x004d66,
                pointColor: 0xeb4b2f,
              },
              size: { radius: 1, widthSegments: 16, heightSegments: 8 },
              wireframe: true,
              satellite: true,
            },
            collider: {
              shape: 'sphere',
              stats: { weight: 1 },
              size: { radius: 1 },
              // enabled: false,
            },
            // skeletal: { name: 'left-shoulder', options: { loop: true } },
            children: [
              {
                name: 'left-elbow',
                type: 'joint',
                offset: {
                  rotation: { y: 0 },
                  position: { x: 0, y: -2, z: 6 },
                },
                body: {
                  shape: 'sphere',
                  style: {
                    ...CommonStyle,

                    color: 0x7fffd4,
                    wireColor: 0x004d66,
                    pointColor: 0xeb4b2f,
                  },
                  size: { radius: 1, widthSegments: 16, heightSegments: 8 },
                  wireframe: true,
                  satellite: true,
                },
                collider: {
                  shape: 'sphere',
                  stats: { weight: 1 },
                  size: { radius: 1 },
                  // enabled: false,
                },
                // skeletal: { name: 'left-elbow' },
                children: [
                  //
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  [
    'enemy-1',
    {
      ...CommonStyle,

      color: 0x007399,
      wireColor: 0x004d66,
      pointColor: 0xeb4b2f,
      faceColor: 0xdc143c,
      faceWireColor: 0xdb6e84,
      height: 4, // 20
      radius: 2, // 10

      speed: 120, // 300,
      rotateSpeed: 2,

      // turnSpeed: PI * 2 * (1 / 6), // 1秒間に1/6周する
      // turnSpeed: PI * 2 * (1 / 3), // 1秒間に1/3周する
      turnSpeed: 1.1,
      sprint: 2.5,
      urgencyMove: 8,

      airSpeed: 50, // 100
      jumpPower: 120, // 350

      gunTypes: ['peashooter'],
    },
  ],
];

export const Obstacles = [
  [
    'round-stone',
    {
      stats: {
        satelliteSpeed: 1,
      },
      collidable: {
        type: 'skeletal', /// //
        body: {
          shape: 'polyhedron',
          type: 'icosahedron',
          style: {
            color: 0x203b33,
            wireColor: 0x4c625b,
            pointColor: 0xf4e511,
          },
          wireframe: true,
          satellite: true,
          size: { radius: 6, detail: 1 },
        },
        collider: {
          shape: 'sphere',
          stats: { weight: 120 },
          size: { radius: 6 },
        },
      },
    },
  ],
  [
    'instanced-round-stone',
    {
      stats: {
        satelliteSpeed: 1,
      },
      collidable: {
        type: 'object',
        body: {
          shape: 'polyhedron',
          type: 'icosahedron',
          style: {
            color: 0x203b33,
            wireColor: 0x4c625b,
            pointColor: 0xf4e511,
          },
          size: { radius: 6, detail: 1 },
          wireframe: true,
          satellite: true,
        },
        collider: {
          shape: 'sphere',
          stats: { weight: 120 },
          size: { radius: 6 },
        },
      },
    },
  ],
  [
    'small-round-stone',
    {
      collider: 'sphere',

      radius: 10,
      detail: 1,
      pointsDetail: 0,
      weight: 30, // 3,

      color: 0x203b33,
      wireColor: 0x4c625b,
      pointColor: 0xf4e511,
      rotateSpeed: 3,
    },
  ],
];
