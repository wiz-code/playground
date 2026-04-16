import { Box3, Vector3, Sphere } from 'three';

import { Game } from '../settings';
import { World } from './settings';
import Publisher from '../publisher';
// import {  } from './utils';

const { sqrt, cos, PI } = Math;

class MovableManager extends Publisher {
  constructor(game) {
    super();

    this.geometry = null;
    this.dataMap = null;
    this.refitSet = new Set();
    this.list = new Map();
  }

  setColliderGeometry(geometry) {
    this.geometry = geometry;
    this.dataMap = this.geometry.userData.movableMap;
  }

  addObject(movable) {
    if (this.geometry != null) {
      const data = this.dataMap.get(movable.name);
      movable.setGeometry(this.geometry, data);
      const nodeIndices = movable.getNodeIndices();

      for (let i = 0, l = nodeIndices.length; i < l; i += 1) {
        const nodeIndex = nodeIndices[i];
        this.refitSet.add(nodeIndex);
      }

      this.list.set(movable.name, movable);
    }
  }

  removeObject(movable) {
    if (this.list.has(movable.name)) {
      movable.clearObject();
      this.list.delete(movable.name);
    }
  }

  clearColliderGeometry() {
    this.refitSet.clear();
    this.list.forEach((object) => {
      this.removeObject(object);
    });

    this.geometry = null;
    this.dataMap = null;
  }

  dispose() {
    this.clearColliderGeometry();
    this.clear();
  }

  update(deltaTime) {
    if (this.geometry == null) {
      return;
    }

    for (const movable of this.list.values()) {
      movable.update(deltaTime);
    }

    if (this.refitSet.size > 0) {
      this.geometry.boundsTree.refit(this.refitSet);
      // this.refitSet.clear();
    }
  }
}

export default MovableManager;
