import {
  CylinderGeometry,
  BoxGeometry,
  BufferGeometry,
  WireframeGeometry,
  Float32BufferAttribute,
  BufferAttribute,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointsMaterial,
  NormalBlending,
  LineBasicMaterial,
  Mesh,
  Points,
  Group,
  PlaneGeometry,
  LineSegments,
  Vector2,
  Vector3,
  FrontSide,
  BackSide,
  DoubleSide,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SUBTRACTION, ADDITION, Brush, Evaluator } from 'three-bvh-csg';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import TextureManager from '../texture-manager';
import { World, Ground, Grid, Cylinder, Tower, Column } from './settings';
import { getPointsVertices } from './utils';

const { sin, cos, floor, ceil, abs, PI } = Math;

let seed = PI / 4;
const customRandom = () => {
  seed += 1;
  const x = sin(seed) * 10000;
  return x - floor(x);
};

const generateHeight = (width, height) => {
  const size = width * height;
  const data = new Uint8Array(size);
  const perlin = new ImprovedNoise();
  const z = customRandom() * 100;

  let quality = 1;

  for (let j = 0; j < 4; j += 1) {
    for (let i = 0; i < size; i += 1) {
      const x = i % width;
      const y = floor(i / width);
      data[i] += abs(
        perlin.noise(x / quality, y / quality, z) * quality * 1.75,
      );
    }

    quality *= 2;
  }

  return data;
};

export const createHeightMap = (
  texture,
  width,
  depth,
  widthSegments,
  depthSegments,
) => {
  const geometry = new PlaneGeometry(
    width,
    depth,
    widthSegments,
    depthSegments,
  );
  geometry.rotateX(-PI / 2);

  const material = new MeshStandardMaterial({
    side: FrontSide,
    displacementMap: texture,
    displacementScale: 10,
    map: texture,
    displacementBias: 0,
  });

  const mesh = new Mesh(geometry, material);

  const vertices = mesh.geometry.getAttribute('position').array.slice(0);

  const buffer = new BufferGeometry();
  buffer.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  buffer.computeBoundingBox();
  buffer.computeBoundingSphere();

  const mesh2 = new Mesh(
    buffer,
    new MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
  );

  mesh.add(mesh2);
  mesh.position.y -= 20;
  return mesh;
};

export const createGrid = ({
  widthSegments = 10,
  heightSegments = 10,
  depthSegments = 10,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
}) => {
  const vertices = [];
  const halfSize = {
    width: floor((widthSegments * World.spacing) / 2),
    height: floor((heightSegments * World.spacing) / 2),
    depth: floor((depthSegments * World.spacing) / 2),
  };

  for (let i = 0, l = widthSegments + 1; i < l; i += 1) {
    for (let j = 0, m = heightSegments + 1; j < m; j += 1) {
      for (let k = 0, n = depthSegments + 1; k < n; k += 1) {
        const x = i * World.spacing - halfSize.width;
        const y = j * World.spacing - halfSize.height;
        const z = k * World.spacing - halfSize.depth;
        vertices.push(x, y, z);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.computeBoundingSphere();

  const material = new PointsMaterial({
    color: Grid.color,
    size: World.pointSize,
    map: self.texture.get('point'),
    blending: NormalBlending,
    depthTest: true,
    transparent: true,
    alphaTest: 0.5,
  });

  const grid = new Points(geometry, material);

  grid.position.set(
    position.x * World.spacing,
    position.y * World.spacing,
    position.z * World.spacing,
  );

  grid.rotation.set(rotation.x, rotation.y, rotation.z, 'YXZ');

  return grid;
};

export const createFineGrid = ({
  widthSegments = 10,
  heightSegments = 10,
  depthSegments = 10,
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
}) => {
  const vertices = [];
  const halfSize = {
    width: floor((widthSegments * World.spacing) / 2),
    height: floor((heightSegments * World.spacing) / 2),
    depth: floor((depthSegments * World.spacing) / 2),
  };

  const width = floor(World.spacing / 2);
  const height = floor(World.spacing / 2);
  const depth = floor(World.spacing / 2);

  for (let i = 0, l = widthSegments * 2 + 1; i < l; i += 1) {
    for (let j = 0, m = heightSegments * 2 + 1; j < m; j += 1) {
      for (let k = 0, n = depthSegments * 2 + 1; k < n; k += 1) {
        if (i % 2 !== 0 || j % 2 !== 0 || k % 2 !== 0) {
          const x = i * width - halfSize.width;
          const y = j * height - halfSize.height;
          const z = k * depth - halfSize.depth;
          vertices.push(x, y, z);
        }
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.computeBoundingSphere();

  const size = World.pointSize / 2;

  const material = new PointsMaterial({
    color: Grid.color,
    size,
    map: self.texture.get('pointThin'),
    blending: NormalBlending,
    depthTest: true,
    transparent: true,
    alphaTest: 0.5,
  });

  const grid = new Points(geometry, material);

  grid.position.set(
    position.x * World.spacing,
    position.y * World.spacing,
    position.z * World.spacing,
  );

  grid.rotation.set(rotation.x, rotation.y, rotation.z, 'YXZ');

  return grid;
};

export const createGround = ({
  name = '',
  movable = false,

  widthSegments = 10,
  depthSegments = 10,
  bumpHeight = 1,
  color = {
    surface: Ground.color,
    wireframe: Ground.wireColor,
    points: Ground.pointColor,
  },
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
}) => {
  const width = widthSegments * World.spacing;
  const depth = depthSegments * World.spacing;

  const data = generateHeight(width, depth);

  const geom = {};
  const mat = {};
  const mesh = {};

  geom.surface = new PlaneGeometry(width, depth, widthSegments, depthSegments);
  geom.surface.rotateX(-PI / 2);

  const vertices = geom.surface.getAttribute('position').array;
  const normals = geom.surface.getAttribute('normal').array;

  for (let i = 0, j = 0, l = vertices.length; i < l; i += 1, j += 3) {
    vertices[j + 1] = data[i] * bumpHeight;
  }

  const pointsVertices = getPointsVertices(vertices, normals);

  geom.bvh = geom.surface.clone();
  geom.bvh = geom.bvh.toNonIndexed();
  geom.bvh.deleteAttribute('uv'); // mergeGeometries()でattributesの数を揃える必要があるため
  geom.bvh.setIndex(null); // mergeGeometries()でindexの有無をどちらかに揃える必要があるため

  if (name !== '') {
    geom.bvh.name = name;
  }

  if (movable) {
    geom.bvh.userData.movable = true;
  }

  geom.wireframe = new WireframeGeometry(geom.surface);

  geom.points = new BufferGeometry();
  geom.points.setAttribute(
    'position',
    new Float32BufferAttribute(pointsVertices, 3),
  );

  mat.surface = new MeshBasicMaterial({
    color: color.surface,
    side: DoubleSide,
  });
  mat.wireframe = new LineBasicMaterial({
    color: color.wireframe,
  });

  mat.points = new PointsMaterial({
    color: color.points,
    size: World.pointSize,
    map: self.texture.get('point'),
    blending: NormalBlending,
    alphaTest: 0.5,
  });

  mesh.surface = new Mesh(geom.surface, mat.surface);
  mesh.surface.name = 'surface';
  mesh.wireframe = new LineSegments(geom.wireframe, mat.wireframe);
  mesh.wireframe.name = 'wireframe';
  mesh.points = new Points(geom.points, mat.points);
  mesh.points.name = 'points';

  const group = new Group();
  group.add(mesh.surface);
  group.add(mesh.wireframe);
  group.add(mesh.points);

  // BVHジオメトリーは先に回転、次に移動の順番にする必要がある
  group.rotation.set(rotation.x, rotation.y, rotation.z, 'YXZ');
  geom.bvh.rotateY(rotation.y);
  geom.bvh.rotateX(rotation.x);
  geom.bvh.rotateZ(rotation.z);

  const x = position.x * World.spacing;
  const y = position.y * World.spacing;
  const z = position.z * World.spacing;

  group.position.set(x, y, z);
  geom.bvh.translate(x, y, z);

  geom.bvh.userData.object = group;

  return { object: group, bvhGeom: geom.bvh };
};
