const { sin, floor, abs, PI } = Math;

export const maze1 = [
  {
    front: false,
    back: false,
    widthSegments: 4,
    heightSegments: 5,
    depthSegments: 24,
  },
  {
    back: false,
    left: false,
    widthSegments: 4,
    heightSegments: 5,
    depthSegments: 4,
    position: { sx: 0, sy: 0, sz: 14 },
  },
  {
    left: false,
    right: false,
    widthSegments: 24,
    heightSegments: 5,
    depthSegments: 4,
    position: { sx: 14, sy: 0, sz: 14 },
  },
];

export const maze2 = [
  {
    right: false,
    back: false,
    widthSegments: 4,
    heightSegments: 5,
    depthSegments: 4,
    position: { sx: 28, sy: 0, sz: 14 },
  },
  {
    front: false,
    back: false,
    widthSegments: 4,
    heightSegments: 5,
    depthSegments: 24,
    position: { sx: 28, sy: 0, sz: 0 },
  },
  {
    front: false,
    right: false,
    widthSegments: 4,
    heightSegments: 5,
    depthSegments: 4,
    position: { sx: 28, sy: 0, sz: -14 },
  },
  {
    right: false,
    left: false,
    widthSegments: 24,
    heightSegments: 5,
    depthSegments: 4,
    position: { sx: 14, sy: 0, sz: -14 },
  },
];

export const ground1 = [
  {
    widthSegments: 5,
    depthSegments: 20,
    bumpHeight: 0.45,
    position: { sx: 0, sy: 0, sz: 0 },
    rotation: { x: -0.2, y: 0, z: 0 },
  },
  {
    widthSegments: 7,
    depthSegments: 20,
    bumpHeight: 0.9,
    position: { sx: -2.4, sy: 1, sz: 0 },
    rotation: { x: 0, y: 0, z: -1.4 },
  },
  {
    widthSegments: 7,
    depthSegments: 20,
    bumpHeight: 0.9,
    position: { sx: 2.4, sy: 1, sz: 0 },
    rotation: { x: 0, y: 0, z: 1.4 },
  },
];
