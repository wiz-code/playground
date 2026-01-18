import { Box3 } from 'three';
import EndPoint from './endpoint';
import Box from './box';
import { Game } from '../../settings';
import { getCapsuleBoundingBox } from '../utils';

const Dimensions = 3;
const dimensionMap = new Map([
  [0, 'x'],
  [1, 'y'],
  [2, 'z'],
  ['x', 0],
  ['y', 1],
  ['z', 2],
]);
const UpdatePerFrame = 60 * Game.stepsPerFrame * 5;

const insertionSort = (endPoints) => {
  for (let i = 1, l = endPoints.length; i < l; i += 1) {
    for (let j = i - 1; j >= 0; j -= 1) {
      const ep1 = endPoints[j];
      const ep2 = endPoints[j + 1];

      if (ep1.value < ep2.value) {
        break;
      }

      endPoints[j] = ep2;
      endPoints[j + 1] = ep1;
    }
  }

  return endPoints;
};

const getKey = (ep1, ep2) => {
  const id1 = ep1.box.id;
  const id2 = ep2.box.id;

  const key = id1 < id2 ? (id1 << 16) | id2 : (id2 << 16) | id1;
  return key;
};

class SweepAndPrune {
  #box = new Box3();

  #overlaps = Array(Dimensions)
    .fill()
    .map(() => new Map());

  #order = Array(Dimensions)
    .fill()
    .map((value, index) => index);

  #tickCount = 0;

  constructor() {
    this.boxes = new Map();
    this.endPoints = Array(Dimensions)
      .fill()
      .map(() => []);
    this.pairs = new Set();

    this.onAdd = this.onAdd.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  addCollider(collider, bb) {
    const epMins = [];
    const epMaxs = [];

    for (let i = 0, l = this.endPoints.length; i < l; i += 1) {
      const dimension = dimensionMap.get(i);
      epMins[i] = new EndPoint(bb.min[dimension], true);
      epMaxs[i] = new EndPoint(bb.max[dimension], false);
    }

    const box = new Box(...epMins, ...epMaxs);

    const { object } = collider;
    box.object = object;

    for (let i = 0; i < Dimensions; i += 1) {
      epMins[i].box = box;
      epMins[i].object = object;
      epMaxs[i].box = box;
      epMaxs[i].object = object;
    }

    this.boxes.set(collider, box);

    for (let i = 0, l = this.endPoints.length; i < l; i += 1) {
      const endPoints = this.endPoints[i];
      endPoints.push(epMins[i], epMaxs[i]);
    }

    return box;
  }

  removeCollider(collider) {
    const box = this.boxes.get(collider);

    this.endPoints.forEach((endPoints, index) => {
      const filtered = endPoints.filter((endPoint) => endPoint.box !== box);
      this.endPoints[index] = filtered;
    });

    this.boxes.delete(collider);
  }

  updateObject(collider) {
    collider.getBoundingBox(this.#box);

    if (!this.boxes.has(collider)) {
      return;
    }

    const { min, max } = this.boxes.get(collider);
    const { min: cmin, max: cmax } = this.#box;

    for (let i = 0; i < Dimensions; i += 1) {
      const dimension = dimensionMap.get(i);
      min[i].value = cmin[dimension];
      max[i].value = cmax[dimension];
    }
  }

  sortByVariance() {
    const variances = [];

    for (let i = 0, l = this.endPoints.length; i < l; i += 1) {
      const endPoints = this.endPoints[i];
      const len = endPoints.length;
      let sum = 0;

      for (let j = 0; j < len; j += 1) {
        const { value } = endPoints[j];
        sum += value;
      }

      const avg = sum / len;
      let diff2Sum = 0;

      for (let j = 0; j < len; j += 1) {
        const { value } = endPoints[j];
        const diff2 = (value - avg) ** 2;
        diff2Sum += diff2;
      }

      const variance = diff2Sum / len;

      variances.push([variance, i]);
    }

    variances.sort(([v1], [v2]) => v2 - v1);

    for (let i = 0, l = variances.length; i < l; i += 1) {
      this.#order[i] = variances[i][1];
    }
  }

  update() {
    if (this.#tickCount % UpdatePerFrame === 0) {
      this.sortByVariance();
    }

    this.#tickCount += 1;
    this.pairs.clear();
    let leastSize;
    let leastSizeIndex;

    if (this.boxes.size < 2) {
      return;
    }

    for (let i = 0, l = this.#order.length; i < l; i += 1) {
      const order = this.#order[i];
      const endPoints = this.endPoints[order];
      const overlaps = this.#overlaps[order];

      for (let j = 1, m = endPoints.length; j < m; j += 1) {
        for (let k = j - 1; k >= 0; k -= 1) {
          const ep2 = endPoints[k];
          const ep1 = endPoints[k + 1];

          if (ep2.value < ep1.value) {
            break;
          }

          endPoints[k] = ep1;
          endPoints[k + 1] = ep2;

          if (ep1.object === ep2.object) {
            break;
          }

          if (ep1.isMin && !ep2.isMin) {
            overlaps.set(getKey(ep1, ep2), [ep1, ep2]);
          } else if (!ep1.isMin && ep2.isMin) {
            overlaps.delete(getKey(ep1, ep2));
          }
        }
      }

      if (i === 0 || overlaps.size < leastSize) {
        leastSize = overlaps.size;
        leastSizeIndex = order;
      }
    }

    const group = { rest: [] };

    for (let i = 0, l = this.#overlaps.length; i < l; i += 1) {
      const overlaps = this.#overlaps[i];

      if (i === leastSizeIndex) {
        group.least = overlaps;
      } else {
        group.rest.push(overlaps);
      }
    }

    for (const [key, [ep1, ep2]] of group.least) {
      let overlapped = true;

      for (let i = 0, l = group.rest.length; i < l; i += 1) {
        const rest = group.rest[i];
        overlapped = rest.has(key);
      }

      if (overlapped) {
        this.pairs.add([ep1.object, ep2.object]);
      }
    }

    /* const leastSizeOverlaps = this.#overlaps[leastSizeIndex];
    const restOverlaps = [];

    for (let i = 0, l = this.#order.length; i < l; i += 1) {
      if (i !== leastSizeIndex) {
        restOverlaps.push(this.#overlaps[i]);
      }
    }

    for (const [key, [ep1, ep2]] of leastSizeOverlaps) {
      if (restOverlaps.every((overlaps) => overlaps.has(key))) {
        this.pairs.add([ep1.object, ep2.object]);
      }
    } */
  }

  onAdd() {}

  onRemove() {}
}

export default SweepAndPrune;
