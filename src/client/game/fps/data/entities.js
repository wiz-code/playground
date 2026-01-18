import { Parts } from '../constants';
import { Clips } from './skeletals';/////////
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

const BodyParts = {
  arm1: {
    name: Parts.LeftShoulder,
    type: 'joint',
    skeletal: {
      name: Parts.LeftShoulder,
      clips: [Clips.JabPunch],
    },
    offset: {
      rotation: {
        x: (80 / 360) * PI * 2,
        y: (30 / 360) * PI * 2,
        z: (-90 / 360) * PI * 2,
        /*x: (0 / 360) * PI * 2,
        y: (0 / 360) * PI * 2,
        z: (0 / 360) * PI * 2,*/
      },
      //position: { x: 2.7, y: 2, z: 0 },
      position: { x: 0.55, y: 0.4, z: 0 },
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
      //size: { radius: 0.7 },
      size: { radius: 0.15 },
      wireframe: true,
      satellite: true,
      satelliteCap: 'none',
      pointSize: 'small',
    },
    collider: {
      shape: 'sphere',
      stats: { weight: 1 },
      //size: { radius: 0.7 },
      size: { radius: 0.15 },
      // enabled: false,
    },
    children: [
      {
        name: Parts.LeftUpperarm,
        type: 'arm',
        offset: {
          //position: { x: 0, y: 0, z: 1.1 },
          position: { x: 0, y: 0, z: 0.25 },
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
            // rotation: { z: -PI * 0.5 },
          },
          wireframe: true,
          satellite: true,
          satelliteCap: 'none',
          pointSize: 'small',
          //size: { radius: 0.4, height: 3 },
          size: { radius: 0.1, height: 0.6 },
        },
        collider: {
          shape: 'capsule',
          stats: { weight: 1 },
          //size: { radius: 0.4, height: 3 },
          size: { radius: 0.1, height: 0.6 },
        },
        children: [
          {
            name: Parts.LeftElbow,
            type: 'joint',
            skeletal: { name: Parts.LeftElbow, clips: [Clips.JabPunch] },
            offset: {
              rotation: {
                x: (0 / 360) * PI * 2,
                y: (-135 / 360) * PI * 2,
                z: (-90 / 360) * PI * 2,
                /*x: (0 / 360) * PI * 2,
                y: (0 / 360) * PI * 2,
                z: (0 / 360) * PI * 2,*/
              },
              //position: { x: 0, y: 0, z: 0.9 },
              position: { x: 0, y: 0, z: 0.25 },
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
              //size: { radius: 0.5 },
              size: { radius: 0.15 },
              wireframe: true,
              satellite: true,
              satelliteCap: 'none',
              pointSize: 'small',
            },
            collider: {
              shape: 'sphere',
              stats: { weight: 1 },
              //size: { radius: 0.5 },
              size: { radius: 0.15 },
              // enabled: false,
            },
            children: [
              {
                name: Parts.LeftForearm,
                type: 'arm',
                offset: {
                  //position: { x: 0, y: 0, z: 0.9 },
                  position: { x: 0, y: 0, z: 0.25 },
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
                    // rotation: { z: -PI * 0.5 },
                  },
                  wireframe: true,
                  satellite: true,
                  satelliteCap: 'none',
                  pointSize: 'small',
                  //size: { radius: 0.4, height: 3 },
                  size: { radius: 0.1, height: 0.6 },
                },
                collider: {
                  shape: 'capsule',
                  stats: { weight: 1 },
                  //size: { radius: 0.4, height: 3 },
                  size: { radius: 0.1, height: 0.6 },
                },
                children: [
                  {
                    name: Parts.LeftHand,
                    type: 'joint',
                    offset: {
                      rotation: { y: 0 },
                      //position: { x: 0, y: 0, z: 1.4 },
                      position: { x: 0, y: 0, z: 0.3 },
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
                      //size: { radius: 1 },
                      size: { radius: 0.2 },
                      wireframe: true,
                      satellite: true,
                      satelliteCap: 'end',
                    },
                    collider: {
                      shape: 'sphere',
                      stats: { weight: 3 },
                      //size: { radius: 1 },
                      size: { radius: 0.2 },
                      // enabled: false,
                    },
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
  arm2: {
    name: Parts.LeftShoulder,
    type: 'joint',
    skeletal: {
      name: Parts.LeftShoulder,
      clips: [Clips.JabPunch],
    },
    offset: {
      rotation: {
        x: (30 / 360) * PI * 2,
        y: (0 / 360) * PI * 2,
        z: (0 / 360) * PI * 2,
      },
      position: { x: 2.7, y: 2, z: 0 },
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
        name: Parts.LeftUpperarm,
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
            // rotation: { z: -PI * 0.5 },
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
      },
    ],
  },
};

export const Characters = [
  [
    'hero-1',
    {
      stats: {
        ...CommonStats,

        //moveAccel: 180,
        moveAccel: 40,
        //airMoveAccel: 50,
        airMoveAccel: 15,

        turnSpeed: 1.8,
        sprint: 2.5,
        urgencyMoveAccel: 8,
        rotAccel: 50,

        //jumpPower: 120,
        jumpPower: 30,
        satelliteSpeed: 2,
      },

      collidable: {
        name: 'body1',
        type: 'object',
        offset: {
          //rotation: { y: (90 / 360) * PI * 2 },
        },
        /*skeletal: {
          name: 'body',
          options: { loop: false, relative: true },
        },*/
        body: {
          shape: 'capsuloid',
          style: {
            ...CommonStyle,

            color: 0x007399,
            wireColor: 0x004d66,
            pointColor: 0xeb4b2f,
            faceColor: 0xdc143c,
            faceWireColor: 0xdb6e84,
          },
          //size: { radius: 2, height: 4 },
          size: { radius: 0.4, height: 0.8 },///////////
        },
        collider: {
          shape: 'capsule',
          stats: { weight: 1 },
          //size: { radius: 2, height: 4 },
          size: { radius: 0.4, height: 0.8 },///////////
        },
        children: [BodyParts.arm1],
      },
    },
  ],
  [
    'hero-2',
    {
      stats: {
        ...CommonStats,

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
        offset: {
          rotation: {
            x: (0 / 360) * PI * 2,
            y: (0 / 360) * PI * 2,
            z: (0 / 360) * PI * 2,
          },
        },
        /*skeletal: {
          name: 'body',
          options: { loop: false, relative: true },
        },*/
        body: {
          shape: 'capsuloid',
          style: {
            ...CommonStyle,

            color: 0x007399,
            backColor: 0x87ceeb, /// //////////////////////////////////
            wireColor: 0x004d66,
            pointColor: 0xeb4b2f,
            faceColor: 0xdc143c,
            faceWireColor: 0xdb6e84,
          },
          wireframe: true,
          satellite: true,
          //size: { radius: 2, height: 4 },
          size: { radius: 0.4, height: 0.8 },////////
        },
        collider: {
          shape: 'capsule',
          stats: { weight: 1 },
          //size: { radius: 2, height: 4 },
          size: { radius: 0.4, height: 0.8 },///////////////
        },
        children: [BodyParts.arm1],
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
          shape: 'capsuloid',
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
        type: 'object',
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
          //size: { radius: 6, detail: 1 },
          size: { radius: 1.5, detail: 1 },
        },
        collider: {
          shape: 'sphere',
          stats: { weight: 60 },
          //size: { radius: 6 },
          size: { radius: 1.5 },
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
