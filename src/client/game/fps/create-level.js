import {
  BufferGeometry,
  Mesh,
  Box3,
  Vector3,
  Group,
  ArrowHelper,
  MeshBasicMaterial,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH, MeshBVHHelper, SAH } from 'three-mesh-bvh';
import { World } from './settings';

import { createGrid, createFineGrid, createGround } from './terrain';

const createLevel = (levelData, crossOriginIsolated) => {
  const { sections } = levelData;
  const level = new Group();
  const bvhGeomList = [];
  const movableBVH = new Map();
  let totalCount = 0;

  for (let i = 0, l = sections.length; i < l; i += 1) {
    const section = sections[i];
    const { terrain } = section;
    const block = new Group();
    const bvhGeoms = [];

    if (Array.isArray(terrain.grid)) {
      const gridGroup = new Group();

      for (let j = 0, m = terrain.grid.length; j < m; j += 1) {
        const data = terrain.grid[j];
        const grid = createGrid(data);
        const fineGrid = createFineGrid(data);
        gridGroup.add(grid);
        gridGroup.add(fineGrid);
        gridGroup.type = 'grid';
        block.add(gridGroup);
      }
    } else if (terrain.grid != null) {
      const gridGroup = new Group();
      const grid = createGrid(terrain.grid);
      const fineGrid = createFineGrid(terrain.grid);
      gridGroup.add(grid);
      gridGroup.add(fineGrid);
      gridGroup.type = 'grid';
      block.add(gridGroup);
    }

    for (let j = 0, m = terrain.ground.length; j < m; j += 1) {
      const data = terrain.ground[j];
      const { object, bvhGeom } = createGround(data);
      block.add(object);
      bvhGeoms.push(bvhGeom);
    }

    if (section.offset != null) {
      const { offset } = section;
      const x = offset.x * World.spacing;
      const y = offset.y * World.spacing;
      const z = offset.z * World.spacing;

      block.position.set(x, y, z);
      bvhGeoms.forEach((geom) => {
        geom.translate(x, y, z);
      });
    }

    bvhGeoms.forEach((bvhGeom) => {
      const name = bvhGeom.name !== '' ? bvhGeom.name : bvhGeom.id;
      const { count } = bvhGeom.getAttribute('position');

      if (bvhGeom.userData.movable) {
        const data = {
          object: bvhGeom.userData.object,
          offset: totalCount,
          count,
        };
        movableBVH.set(name, data);
      }

      totalCount += count;
    });

    level.add(block);
    bvhGeomList.push(...bvhGeoms);
  }

  const merged = mergeGeometries(bvhGeomList);
  merged.userData.movableBVH = movableBVH;

  const bvhMesh = new Mesh(
    merged,
    new MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: 0,
    }),
  );
  bvhMesh.geometry.boundsTree = new MeshBVH(merged, {
    maxLeafTris: 6,
    useSharedArrayBuffer: crossOriginIsolated,
    strategy: SAH,
  });
  // const helper = new MeshBVHHelper(bvhMesh.geometry.boundsTree, 8);//v0.7.3ではok v0.7.7以上でエラー
  const helper = new MeshBVHHelper(bvhMesh, 8);
  return { level, bvh: bvhMesh, helper };
};

export default createLevel;
