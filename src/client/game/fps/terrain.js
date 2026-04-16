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
  Euler,
  Quaternion,
  Matrix4,
  FrontSide,
  BackSide,
  DoubleSide,
  Color,
} from 'three';
import { mergeGeometries, mergeVertices, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';//////////
import { SUBTRACTION, ADDITION, Brush, Evaluator } from 'three-bvh-csg';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import TextureManager from '../texture-manager';
import { World, Ground, Grid, Cylinder, Tower, Column } from './settings';
import { getPointsNormals } from './utils';
import ModelLoader from '../model-loader';

const { sin, cos, floor, ceil, abs, PI } = Math;
const modelLoader = new ModelLoader();
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
    width: widthSegments * World.spacing * 0.5,
    height: heightSegments * World.spacing * 0.5,
    depth: depthSegments * World.spacing * 0.5,
  };
  const halfSpacing = World.spacing * 0.5;
  const geometry = new BufferGeometry();
  let count1 = 0, count2 = 0;

  for (let i = 0, l = widthSegments + 1; i < l; i += 1) {
    for (let j = 0, m = heightSegments + 1; j < m; j += 1) {
      for (let k = 0, n = depthSegments + 1; k < n; k += 1) {
        const x = i * World.spacing - halfSize.width;
        const y = j * World.spacing - halfSize.height;
        const z = k * World.spacing - halfSize.depth;
        vertices.push(x, y, z);
        count1 += 1;
      }
    }
  }

  geometry.addGroup(0, count1, 0);

  for (let i = 0, l = widthSegments * 2 + 1; i < l; i += 1) {
    for (let j = 0, m = heightSegments * 2 + 1; j < m; j += 1) {
      for (let k = 0, n = depthSegments * 2 + 1; k < n; k += 1) {
        if (i % 2 !== 0 || j % 2 !== 0 || k % 2 !== 0) {
          const x = i * halfSpacing - halfSize.width;
          const y = j * halfSpacing - halfSize.height;
          const z = k * halfSpacing - halfSize.depth;
          count2 += 1;
          vertices.push(x, y, z);
        }
      }
    }
  }

  geometry.addGroup(count1, count1 + count2, 1);

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.computeBoundingSphere();

  const pointSize = World.pointSize / self.devicePixelRatio;
  const gridMat = new PointsMaterial({
    color: Grid.color,
    size: pointSize,
    transparent: true,
    alphaMap: self.texture.get('point'),
    blending: NormalBlending,
    alphaTest: Grid.alphaTest,
    depthWrite: false,
  });

  const findGridMat = gridMat.clone();
  findGridMat.size =  pointSize / 2;
  findGridMat.alphaMap = self.texture.get('pointThin');

  const grid = new Points(geometry, [gridMat, findGridMat]);

  grid.position.set(
    position.x * World.spacing,
    position.y * World.spacing,
    position.z * World.spacing,
  );

  grid.rotation.set(rotation.x, rotation.y, rotation.z, 'XYZ');

  return grid;
};

export const loadTerrainData = async (
  {
    filename,
    fileType,
    role = 'static-object',

    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
  },
  callback,
) => {
  const url = await callback(filename, fileType);
  const data = await modelLoader.load(url, filename, fileType);
  const terrain = data.scene;
  console.log(terrain)
  const list = [];

  const x = position.x * World.spacing;
  const y = position.y * World.spacing;
  const z = position.z * World.spacing;
  const pos = new Vector3(x, y, z);
  const euler = new Euler(rotation.x, rotation.y, rotation.z);
  const quat = new Quaternion().setFromEuler(euler);
  const matrix = new Matrix4().compose(pos, quat, new Vector3().setScalar(1));

  terrain.traverse((object) => {
    if (object.isMesh) {
      const { geometry, material } = object;

      const geom = mergeVertices(geometry);
      const mat = material.clone();

      geom.applyMatrix4(object.matrixWorld);
      geom.applyMatrix4(matrix);

      geometry.dispose();
      material.dispose();

      list.push({ geometry: geom, material: mat }); 
    }
  });

  return list;
};

export const createStaticObject = (name = '', geometry, material) => {
  const geom = {};
  const mat = {};
  const mesh = {};

  geom.surface = geometry;

  const vertices = geom.surface.getAttribute('position').array;
  const normals = geom.surface.getAttribute('normal').array;

  const pointsNormals = getPointsNormals(vertices, normals);
  const pointsVertices = vertices.map((value, index) => value + (pointsNormals[index] * World.pointOffset / self.devicePixelRatio));

  geom.wireframe = new WireframeGeometry(geom.surface);

  geom.points = new BufferGeometry();
  geom.points.setAttribute(
    'position',
    new Float32BufferAttribute(pointsVertices, 3),
  );

  mat.surface = material;
  mat.wireframe = new LineBasicMaterial({
    color: Ground.wireColor,
  });
  mat.points = new PointsMaterial({
    color: Ground.pointColor,
    size: World.pointSize / self.devicePixelRatio,
    transparent: true,
    alphaMap: self.texture.get('point'),
    blending: NormalBlending,
    alphaTest: Ground.alphaTest,
    depthWrite: false,
  });

  mesh.surface = new Mesh(geom.surface, mat.surface);
  mesh.surface.name = 'surface';
  mesh.wireframe = new LineSegments(geom.wireframe, mat.wireframe);
  mesh.wireframe.name = 'wireframe';
  mesh.points = new Points(geom.points, mat.points);
  mesh.points.name = 'points';

  const object = new Group();
  object.name = name;
  object.add(mesh.surface);
  object.add(mesh.wireframe);
  object.add(mesh.points);

  // BVHジオメトリーは回転のみ適用し、移動はメッシュ側に適用する
  /*object.rotation.set(rotation.x, rotation.y, rotation.z);
  geom.collider.rotateX(rotation.x);
  geom.collider.rotateY(rotation.y);
  //geom.collider.rotateX(rotation.x);
  geom.collider.rotateZ(rotation.z);

  const x = position.x * World.spacing;
  const y = position.y * World.spacing;
  const z = position.z * World.spacing;

  object.position.set(x, y, z);
  mesh.collider.position.set(x, y, z);*/

  //geom.collider.userData.object = object;

  return object;
};

/*export const loadTerrainData = async (
  {
    filename,
    fileType,
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
  },
  callback,
) => {
  const json = await callback(filename, fileType);
  const terrain = await new ObjectLoader().parseAsync(json);console.log(terrain.children)

  const object = new Group();
  const meshes = [];

  terrain.traverse((origMesh) => {
    if (origMesh.isMesh) {
      const { geometry, material } = origMesh;
      meshes.push(origMesh);

      const geom = {};
      const mat = {};
      const mesh = {};

      geom.surface = mergeVertices(geometry);

      const vertices = geom.surface.getAttribute('position').array;
      const normals = geom.surface.getAttribute('normal').array;

      const pointsNormals = getPointsNormals(vertices, normals);
      const pointsVertices = vertices.map((value, index) => value + (pointsNormals[index] * World.pointOffset / devicePixelRatio));

      geom.wireframe = new WireframeGeometry(geom.surface);

      geom.points = new BufferGeometry();
      geom.points.setAttribute(
        'position',
        new Float32BufferAttribute(pointsVertices, 3),
      );
      geom.points.setAttribute(
        'normal',
        new Float32BufferAttribute(pointsNormals, 3),
      );

      mat.surface = material.clone();
      mat.wireframe = new LineBasicMaterial({
        color: Ground.wireColor,
      });
      mat.points = new PointsMaterial({
        color: Ground.pointColor,
        size: World.pointSize / devicePixelRatio,
        transparent: true,
        alphaMap: self.texture.get('point'),
        blending: NormalBlending,
        alphaTest: Ground.alphaTest,
        depthWrite: false,
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

      group.applyMatrix4(origMesh.matrix);

      object.add(group);
    }
  });

  const geometries = meshes.map((mesh) => {
    const { geometry, material } = mesh;
    const geom = geometry.toNonIndexed();
    geom.deleteAttribute('uv');
    geom.setIndex(null);

    geom.applyMatrix4(mesh.matrix);

    geometry.dispose();
    material.dispose();

    return geom;
  });

  const collider = new Mesh(mergeGeometries(geometries));

  return { object, collider }*/


  /*const geom = {};
  const mat = {};
  const mesh = {};

  geom.surface = mergeVertices(geometry);
  geometry.dispose();

  geom.surface.scale(1, 1, 1);

  const vertices = geom.surface.getAttribute('position').array;
  const normals = geom.surface.getAttribute('normal').array;

  const pointsNormals = getPointsNormals(vertices, normals);
  const pointsVertices = vertices.map((value, index) => value + (pointsNormals[index] * World.pointOffset / devicePixelRatio));

  geom.collider = geom.surface.toNonIndexed();
  geom.collider.deleteAttribute('uv'); // mergeGeometries()でattributesの数を揃える必要があるため
  geom.collider.setIndex(null); // mergeGeometries()でindexの有無をどちらかに揃える必要があるため

  geom.wireframe = new WireframeGeometry(geom.surface);

  geom.points = new BufferGeometry();
  geom.points.setAttribute(
    'position',
    new Float32BufferAttribute(pointsVertices, 3),
  );
  geom.points.setAttribute(
    'normal',
    new Float32BufferAttribute(pointsNormals, 3),
  );

  geom.collider.name = filename;//////

  mat.surface = material.clone();
  material.dispose();
  mat.wireframe = new LineBasicMaterial({
    color: Ground.wireColor,
  });

  mat.points = new PointsMaterial({
    color: Ground.pointColor,
    size: World.pointSize / devicePixelRatio,
    transparent: true,
    alphaMap: self.texture.get('point'),
    blending: NormalBlending,
    alphaTest: Ground.alphaTest,
    depthWrite: false,
  });

  mesh.surface = new Mesh(geom.surface, mat.surface);
  mesh.surface.name = 'surface';
  mesh.wireframe = new LineSegments(geom.wireframe, mat.wireframe);
  mesh.wireframe.name = 'wireframe';
  mesh.points = new Points(geom.points, mat.points);
  mesh.points.name = 'points';
  
  mesh.collider = new Mesh(geom.collider);
  mesh.collider.name = 'collider';

  const object = new Group();
  object.add(mesh.surface);
  object.add(mesh.wireframe);
  object.add(mesh.points);

  

  //const helper = new VertexNormalsHelper(mesh.points, 1, 0xff0000);
  //object.add(helper);

  // BVHジオメトリーは回転のみ適用し、移動はメッシュ側に適用する
  object.rotation.set(rotation.x, rotation.y, rotation.z);
  geom.collider.rotateX(rotation.x);
  geom.collider.rotateY(rotation.y);
  geom.collider.rotateZ(rotation.z);

  const x = position.x * World.spacing;
  const y = position.y * World.spacing;
  const z = position.z * World.spacing;

  object.position.set(x, y, z);
  mesh.collider.position.set(x, y, z);
  return { object, collider: mesh.collider };
};*/

export const createGround = ({
  name = '',
  movable = false,

  widthSegments = 10,
  depthSegments = 10,
  bumpHeight = 1,
  
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
}) => {
  const width = widthSegments * World.spacing;
  const depth = depthSegments * World.spacing;

  const heightData = generateHeight(width, depth);

  const geometry = new PlaneGeometry(width, depth, widthSegments, depthSegments);
  geometry.deleteAttribute('uv'); // mergeGeometries()でattributesの数を揃える必要があるため
  geometry.rotateX(-PI / 2);

  const vertices = geometry.getAttribute('position').array;

  for (let i = 0, j = 0, l = vertices.length; i < l; i += 1, j += 3) {
    vertices[j + 1] = heightData[i] * bumpHeight;
  }

  const material = new MeshBasicMaterial({
    color: Ground.color,
    side: DoubleSide,
  });
  return { geometry, material };
};
