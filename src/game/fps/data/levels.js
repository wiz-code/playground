import { States } from '../constants';
import { Commands } from './skeletals';

const { PI, sin, cos } = Math;

const Levels = [
  [
    'worker-fps',
    [
      [
        'stage-1',
        {
          name: 'ステージ１',
          bgm: 'first-stage',

          sections: [
            {
              checkpoint: {
                position: { x: 10, y: 0, z: 0 },
                rotation: { y: 0 },
              },
              offset: { x: 0, y: 0, z: 0 },
              characters: [
                {
                  id: 'enemy-1',
                  name: '敵キャラ１',
                  subtype: 'hero-2',

                  events: [
                    {
                      // eventManager管理
                      name: 'spawn',
                      type: 'timeout',
                      condition: { delay: 3 },
                      params: {
                        position: { x: 0, y: 3, z: 0 },
                        //rotation: { y: (90 / 360) * PI * 2 },
                        rotation: {
                          //x: (90 / 360) * PI * 2,
                          y: (90 / 360) * PI * 2,
                        },
                      },
                      handler: 'show',
                    },
                    {
                      // eventManager管理
                      name: 'start-animation',
                      type: 'timeout',
                      condition: { delay: 10 },
                      params: {
                        //command: Commands.HandsUp,
                        command: Commands.JabPunch,
                      },
                      handler: 'start-animation',
                    },
                    // { name: 'trigger-action', type: 'interval', value: { delay: 8 }, handler: 'trigger-action' },
                  ],
                  updaters: [
                    /* {
                      name: 'updater-1',
                      updater: 'self-rotation',
                      params: {},
                      options: {
                        autoStart: true,
                        duration: 3,
                        repeat: true,
                      },
                    }, */
                  ],
                  section: 0,

                  params: {
                    //
                  },
                },
              ],
              movables: [
                {
                  name: 'moving-platform-1',
                  updaters: [
                    {
                      name: 'updater-1',
                      updater: 'swing-platform-1',
                      params: {
                        motions: [
                          { type: 'position', axis: 'x', moveBy: 3 },
                          { type: 'position', axis: 'y', moveBy: 5 },
                          { type: 'position', axis: 'z', moveBy: 3 },
                        ],
                      },
                      options: {
                        autoStart: true,
                        chain: 'updater-2',
                        duration: 3,
                        repeat: true,
                        alternate: true,
                      },
                    },
                    {
                      name: 'updater-2',
                      updater: 'swing-platform-1',
                      params: {
                        motions: [
                          { type: 'position', axis: 'x', moveBy: 30 },
                          { type: 'position', axis: 'y', moveBy: 2 },
                          { type: 'position', axis: 'z', moveBy: 10 },
                        ],
                      },
                      options: {
                        chain: 'updater-1',
                        duration: 7,
                        repeat: true,
                        alternate: true,
                      },
                    },
                  ],
                },
              ],
              terrain: {
                grid: [
                  {
                    widthSegments: 80,
                    heightSegments: 12,
                    depthSegments: 80,
                    rotation: { x: 0, y: 0, z: 0 },
                    position: { x: 0.25, y: 0.25, z: 0.25 },
                  },
                ],
                ground: [
                  {
                    name: 'moving-platform-1',
                    movable: true,

                    widthSegments: 5,
                    depthSegments: 5,
                    bumpHeight: 0,
                    position: { x: 5, y: -4, z: 7 },
                    rotation: { x: 0, y: 0, z: 0 },
                  },
                  {
                    widthSegments: 50,
                    depthSegments: 50,
                    bumpHeight: 0.3, // 0.45,
                    position: { x: 0, y: -5, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                  },
                  /*{
                    widthSegments: 7,
                    depthSegments: 20,
                    bumpHeight: 0.9,
                    position: { x: -2.4, y: -2, z: 0 },
                    rotation: { x: 0, y: 0, z: -1.5 },
                  },
                  {
                    widthSegments: 7,
                    depthSegments: 20,
                    bumpHeight: 0.9,
                    position: { x: 2.4, y: -2, z: 0 },
                    rotation: { x: 0, y: 0, z: 1.5 },
                  },*/
                ],
              },
            },
          ],
          updaters: [
            { name: 'bullet-fire-1', condition: States.alive },
            { name: 'satellite-points', condition: States.alive },
          ],
        },
      ],
    ],
  ],
];

export default Levels;
