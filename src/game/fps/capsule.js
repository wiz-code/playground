import { Vector3 /* */, Euler } from 'three';

import { Axis } from './settings';

const normalAxis = { joint: Axis.y, arm: Axis.z };

function checkAABBAxis(p1x, p1y, p2x, p2y, minx, maxx, miny, maxy, radius) {
  return (
    (minx - p1x < radius || minx - p2x < radius) &&
    (p1x - maxx < radius || p2x - maxx < radius) &&
    (miny - p1y < radius || miny - p2y < radius) &&
    (p1y - maxy < radius || p2y - maxy < radius)
  );
}

class Capsule {
  #v1 = new Vector3();

  #v2 = new Vector3();

  #v3 = new Vector3();

  #c1 = new Vector3();

  constructor(
    start = new Vector3(0, 0.5, 0),
    end = new Vector3(0, 1, 0),
    radius = 0.5,
  ) {
    this.start = new Vector3();
    this.end = new Vector3();
    this.normal = new Vector3();
    this.radius = 0;
    this.height = 0;

    this.set(start, end, radius);
  }

  clone() {
    return new Capsule(this.start.clone(), this.end.clone(), this.radius);
  }

  rotate(quaternion, role) {
    if (role === 'arm') {
      this.normal.copy(Axis.z).applyQuaternion(quaternion);
      this.end.copy(
        this.#v2.addVectors(
          this.start,
          this.#v1.copy(this.normal).multiplyScalar(this.height),
        ),
      );
    } else {
      this.normal.copy(Axis.y).applyQuaternion(quaternion);
      this.getCenter(this.#c1);

      this.end.copy(
        this.#v2.addVectors(
          this.#c1,
          this.#v1.copy(this.normal).multiplyScalar(this.height * 0.5),
        ),
      );
      this.start.copy(
        this.#v2.addVectors(
          this.#c1,
          this.#v1.copy(this.normal).multiplyScalar(-this.height * 0.5),
        ),
      );
    }
  }

  set(start, end, radius) {
    this.start.copy(start);
    this.end.copy(end);
    this.radius = radius;

    this.#v1.subVectors(end, start);
    this.height = this.#v1.length();
    this.normal.copy(this.#v1.normalize());
  }

  setPosition(vec) {
    const halfHeight = this.height * 0.5;
    this.start
      .copy(vec)
      .add(this.#v1.copy(this.normal).multiplyScalar(-halfHeight));
    this.end
      .copy(vec)
      .add(this.#v1.copy(this.normal).multiplyScalar(halfHeight));
  }

  getBoundingBox(box) {
    const { x: sx, y: sy, z: sz } = this.start;
    const { x: ex, y: ey, z: ez } = this.end;

    if (sx <= ex) {
      box.min.x = this.start.x - this.radius;
      box.max.x = this.end.x + this.radius;
    } else {
      box.min.x = this.end.x - this.radius;
      box.max.x = this.start.x + this.radius;
    }

    if (sy <= ey) {
      box.min.y = this.start.y - this.radius;
      box.max.y = this.end.y + this.radius;
    } else {
      box.min.y = this.end.y - this.radius;
      box.max.y = this.start.y + this.radius;
    }

    if (sz <= ez) {
      box.min.z = this.start.z - this.radius;
      box.max.z = this.end.z + this.radius;
    } else {
      box.min.z = this.end.z - this.radius;
      box.max.z = this.start.z + this.radius;
    }

    return box;
  }

  copy({ start, end, radius }) {
    this.set(start, end, radius);
  }

  getBase(target) {
    return target
      .copy(this.start)
      .add(this.#v1.copy(this.normal).negate().multiplyScalar(this.radius));
  }

  getTip(target) {
    return target
      .copy(this.end)
      .add(this.#v1.copy(this.normal).multiplyScalar(this.radius));
  }

  getCenter(target) {
    return target.copy(this.end).add(this.start).multiplyScalar(0.5);
  }

  translate(vec) {
    this.start.add(vec);
    this.end.add(vec);
  }

  intersectsBox(box) {
    const { x: sx, y: sy, z: sz } = this.start;
    const { x: ex, y: ey, z: ez } = this.end;
    const { x: minX, y: minY, z: minZ } = box.min;
    const { x: maxX, y: maxY, z: maxZ } = box.max;

    return (
      checkAABBAxis(sx, sy, ex, ey, minX, maxX, minY, maxY, this.radius) &&
      checkAABBAxis(sx, sz, ex, ez, minX, maxX, minZ, maxZ, this.radius) &&
      checkAABBAxis(sy, sz, ey, ez, minY, maxY, minZ, maxZ, this.radius)
    );
  }
}

export default Capsule;
