import {
  BufferGeometry,
  Mesh,
  Box3,
  Vector3,
  Euler,
  Quaternion,
  Matrix4,
  Group,
  ArrowHelper,
  MeshBasicMaterial,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH, MeshBVHHelper, SAH, StaticGeometryGenerator } from 'three-mesh-bvh';
import { World } from './settings';

import { createGrid, createGround, loadTerrainData, createStaticObject } from './terrain';

const createLevel = async (levelData, callback, { devicePixelRatio, crossOriginIsolated }) => {
  const { sections } = levelData;
  const levelObject = new Group();
  levelObject.name = 'level-object';
  const movableMap = new Map();
  const staticGeometries = [];
  const materialList = [];
  const colliderGeometries = [];
  const dataList = [];

  for (let i = 0, l = sections.length; i < l; i += 1) {
    const section = sections[i];
    const { terrain } = section;
    //const objects = new Group();
    //const colliders = new Group();

    if (Array.isArray(terrain.grid)) {
      const gridGroup = new Group();

      for (let j = 0, m = terrain.grid.length; j < m; j += 1) {
        const data = terrain.grid[j];
        const grid = createGrid(data, devicePixelRatio);
        gridGroup.add(grid);
        gridGroup.type = 'grid';
        levelObject.add(gridGroup);
      }
    } else if (terrain.grid != null) {
      const gridGroup = new Group();
      const grid = createGrid(terrain.grid, devicePixelRatio);
      gridGroup.add(grid);
      gridGroup.type = 'grid';
      levelObject.add(gridGroup);
    }

    for (let j = 0, m = terrain.ground.length; j < m; j += 1) {
      const data = terrain.ground[j];

      if (data.useLoader) {
        const list = await loadTerrainData(data, callback);

        for (let k = 0, n = list.length; k < n; k += 1) {
          const { geometry, material } = list[k];
          staticGeometries.push(geometry);
          materialList.push(material);
        }
      } else {
        const { geometry, material } = createGround(data, devicePixelRatio);

        const position = data.position ?? { x: 0, y: 0, z: 0 };
        const rotation = data.rotation ?? { x: 0, y: 0, z: 0 };
          
        const x = position.x * World.spacing;
        const y = position.y * World.spacing;
        const z = position.z * World.spacing;

        const pos = new Vector3(x, y, z);
        const euler = new Euler(rotation.x, rotation.y, rotation.z);
        const quat = new Quaternion().setFromEuler(euler);
        const scale = new Vector3().setScalar(1);
        const matrix = new Matrix4().compose(pos, quat, scale);

        if (data.movable) {
          const object = createStaticObject(data.name, geometry, material, devicePixelRatio);
          object.applyMatrix4(matrix);

          const colliderGeom = geometry.clone();
          colliderGeom.name = data.name ?? '';
          colliderGeom.userData.movable = true;
          colliderGeom.userData.object = object;

          colliderGeom.applyMatrix4(matrix);

          levelObject.add(object);
          colliderGeometries.push(colliderGeom);
        } else {
          geometry.applyMatrix4(matrix);
          staticGeometries.push(geometry);
          materialList.push(material);
        }
      }
    }
  }

  const staticGeom = mergeGeometries(staticGeometries, true);
  const staticObject = createStaticObject('static-object', staticGeom, materialList, devicePixelRatio);
  levelObject.add(staticObject);

  colliderGeometries.push(...staticGeometries);
  const colliderGeom = mergeGeometries(colliderGeometries);
  let offset = 0;

  for (let i = 0, l = colliderGeometries.length; i < l; i += 1) {
    const geometry = colliderGeometries[i];
    const { count } = geometry.getAttribute('position');

    if (geometry.userData.movable) {
      const data = {
        object: geometry.userData.object,
        offset,
        count,
      };
      movableMap.set(geometry.name, data);
    }

    offset += count;
  }

  colliderGeom.userData.movableMap = movableMap;

  const collider = new Mesh(
    colliderGeom,
    new MeshBasicMaterial({ wireframe: true }),
  );
  collider.name = 'level-collider';
  collider.visible = false;
  
  collider.geometry.boundsTree = new MeshBVH(colliderGeom, {
    maxDepth: 15,
    maxLeafSize: 6,
    useSharedArrayBuffer: crossOriginIsolated,
    strategy: SAH,
  });


  // const helper = new MeshBVHHelper(collider.geometry.boundsTree, 8);//v0.7.3ではok v0.7.7以上でエラー
  const helper = new MeshBVHHelper(collider, 10);
  return { object: levelObject, collider, helper };
};

export default createLevel;
