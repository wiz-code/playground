import {
  IcosahedronGeometry,
  OctahedronGeometry,
  BufferGeometry,
  WireframeGeometry,
  MeshBasicMaterial,
  LineBasicMaterial,
  PointsMaterial,
  Mesh,
  LineSegments,
  Points,
  Group,
  Float32BufferAttribute,
  Vector3,
  Sphere,
  Box3,
  NormalBlending,
} from 'three';

import { World, Axis, InitialDir } from './settings';
import Entity from './entity';
import { Obstacles } from './data/entities';
import Collidable from './collidable';

const rollingCoef = 0.01;

class Obstacle extends Entity {
  #move = new Vector3();

  #pos = new Vector3();

  #dir = new Vector3();

  #side = new Vector3();

  constructor(game, name, subtype) {
    super(game, name, 'obstacle', subtype, Obstacles);

    this.collidable = new Collidable(this, null, this.data.collidable);
    this.hide();
  }

  update(deltaTime, elapsedTime, damping) {
    super.update(deltaTime);

    if (!this.isAlive()) {
      return;
    }

    this.velocity.y -= World.gravity * deltaTime;
    this.velocity.addScaledVector(this.velocity, damping[this.type]);
    // this.#dir.copy(this.velocity).normalize();
    // this.rotation.setFromVector3(this.#dir);

    this.#move.copy(this.velocity).multiplyScalar(deltaTime);
    this.#dir.copy(this.#move).normalize();
    // this.rotation.setFromVector3(this.#dir);

    this.collidable.traverse(({ collider }) => {
      collider.moveBy(this.#move);
    });
  }

  postUpdate(deltaTime, elapsedTime) {
    const {
      collidable: { body },
      position,
    } = this;

    // position.add(this.relPos);
    // this.#pos.copy(position);
    this.collidable.collider.getCenter(this.#pos);
    // this.#pos.y += this.data.centerHeight;
    body.position.copy(this.#pos);
    // body.rotation.y = this.rotation.theta;////////////

    /* this.#dir.setFromSpherical(this.rotation);
    this.#side.crossVectors(this.#dir, Axis.y).normalize();
    const len = this.velocity.length();
    body.setRotationFromAxisAngle(
      this.#side,
      -elapsedTime * rollingCoef * this.data.stats.satelliteSpeed * len,
    ); */
  }
}

export default Obstacle;
