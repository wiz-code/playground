import { Box3, Vector3, Sphere, Line3 } from 'three';
import { NOT_INTERSECTED, INTERSECTED, CONTAINED } from 'three-mesh-bvh';

import Capsule from './capsule';
import { Game } from '../settings';
import { World } from './settings';
import Publisher from '../publisher';
import SweepAndPrune from './sap';
import {
  triangleCapsuleIntersect,
  triangleSphereIntersect,
  lineToLineClosestPoints,
} from './utils';

const { sqrt, cos, PI } = Math;

const RAD45 = (45 / 360) * PI * 2;
const COS45 = cos(RAD45);
const Restitution = 0.8;

class ObjectManager extends Publisher {
  #vecA = new Vector3();

  #vecB = new Vector3();

  #vecC = new Vector3();

  #vecD = new Vector3();

  #vecE = new Vector3();

  #vecF = new Vector3();

  #box = new Box3();

  #capsule = new Capsule();

  #sphere = new Sphere();

  #center = new Vector3();

  #depth = new Vector3();

  #vec = new Vector3();

  #c1 = new Vector3();

  #c2 = new Vector3();

  #triangleIndexSet = new Set();

  #l1 = new Line3();

  #l2 = new Line3();

  #t1 = new Vector3();

  #t2 = new Vector3();

  #move = new Vector3();

  #move1 = new Vector3();

  #move2 = new Vector3();

  #colCenter = new Vector3();

  constructor(game, scene, eventManager, movableManager) {
    super();

    this.game = game;
    this.scene = scene;
    this.eventManager = eventManager;
    this.movableManager = movableManager;
    this.sap = new SweepAndPrune();
    this.list = new Set();

    this.addCollider = this.addCollider.bind(this);
    this.removeCollider = this.removeCollider.bind(this);
  }

  add(object) {
    const { collidable } = object;

    object.subscribe('add-collider', this.addCollider);
    object.subscribe('remove-collider', this.removeCollider);

    if (object.hasControls) {
      this.scene.add(object.arrow);
      collidable.hide();
    }

    collidable.attach(this.scene);
    this.list.add(object);
  }

  remove(object) {
    if (this.list.has(object)) {
      const { collidable } = object;

      object.unsubscribe('add-collider', this.addCollider);
      object.unsubscribe('remove-collider', this.removeCollider);

      if (object.hasControls) {
        this.scene.remove(object.arrow);
        collidable.show();
      }

      collidable.detach(this.scene);
      this.list.delete(object);
    }
  }

  addCollider(object) {
    const { collidable } = object;

    collidable.traverse(({ collider }) => {
      const box = new Box3();
      collider.getBoundingBox(box);
      this.sap.addCollider(collider, box);
    });
  }

  removeCollider(object) {
    const { collidable } = object;

    collidable.traverse(({ collider }) => {
      this.sap.removeCollider(collider);
    });
  }

  clearList() {
    this.list.forEach((object) => this.remove(object));
  }

  setAlive(bool) {
    this.list.forEach((object) => object.setAlive(bool));
  }

  dispose() {
    this.list.forEach((object) => {
      this.remove(object);
      object.dispose();
    });
    this.clear();
  }

  effect(object, target) {
    switch (object.type) {
      case 'item': {
        object.setAlive(false);

        if (!object.consumable) {
          const time = object.disableTime * 1000;
          setTimeout(() => {
            object.setAlive(true);
          }, time);
        }

        this.eventManager.dispatch('get-item', object.name, target, object);
        break;
      }

      default: {
      }
    }
  }

  #collisionWithTerrain(object, geometry, refitSet, movableList) {
    const { type, collidable } = object;
    const { velocity } = collidable;
    this.#move.set(0, 0, 0);

    if (type === 'character') {
      object.setGrounded(false);
      object.platform = null;
    }

    collidable.traverse(({ parent, collider }) => {
      let intersected = null;
      this.#triangleIndexSet.clear();
      this.#depth.set(0, 0, 0);
      let result = false;

      collider.getCenter(this.#center);
      collider.getBoundingBox(this.#box);
      const boundsTraverseOrder = (box) => {
        return box
          .clampPoint(this.#center, this.#vec)
          .distanceToSquared(this.#center);
        // return box.distanceToPoint(this.#center);
      };
      const intersectsBounds = (box, isLeaf, score, depth, nodeIndex) => {
        if (box.intersectsBox(this.#box)) {
          return INTERSECTED;
        }

        return NOT_INTERSECTED;
      };
      const callbacks = {
        boundsTraverseOrder,
        intersectsBounds,
      };

      if (collider.type === 'capsule') {
        collider.copyTo(this.#capsule);

        const intersectsTriangle = (triangle, triangleIndex, a, depth) => {
          const collision = triangleCapsuleIntersect(this.#capsule, triangle);

          if (collision !== false) {
            if (intersected != null) {
              this.#triangleIndexSet.add(triangleIndex);
            }

            result = true;
            this.#depth.add(collision.normal.multiplyScalar(collision.depth));
          }

          return false;
        };
        const intersectsRange = (
          offset,
          count,
          contained,
          depth,
          nodeIndex,
        ) => {
          for (let k = 0; k < count; k += 1) {
            const i1 = (offset + k) * 3;
            const vertexIndex = geometry.index.getX(i1);

            for (const movable of movableList.values()) {
              const offsetEnd = movable.offset + movable.count;

              if (movable.offset <= vertexIndex && vertexIndex <= offsetEnd) {
                intersected = movable;
                refitSet.add(nodeIndex);
              }
            }
          }
        };
        callbacks.intersectsTriangle = intersectsTriangle;
        callbacks.intersectsRange = intersectsRange;

        geometry.boundsTree.shapecast(callbacks);
      } else if (collider.type === 'sphere') {
        this.#sphere.copy(collider.getBounds());

        const intersectsTriangle = (triangle) => {
          const collision = triangleSphereIntersect(this.#sphere, triangle);

          if (collision !== false) {
            result = true;
            this.#depth.add(collision.normal.multiplyScalar(collision.depth));
          }

          return false;
        };
        callbacks.intersectsTriangle = intersectsTriangle;

        geometry.boundsTree.shapecast(callbacks);
      } else if (collider.type === 'aabb') {
        this.#box.getBoundingSphere(this.#sphere);

        geometry.boundsTree.shapecast({
          boundsTraverseOrder,
          intersectsBounds,
          intersectsTriangle: (triangle) => {
            const collision = this.#box.intersectsTriangle(triangle);

            if (collision) {
              result = true;

              // TODO
            }

            return false;
          },
        });
      }

      if (result) {
        const depth = this.#depth.length();
        result = { normal: this.#depth.clone().normalize(), depth };
      }

      if (result !== false) {
        if (type === 'character') {
          const onGround = result.normal.y > COS45;

          // 着地時はバウンドを無効に
          if (!onGround) {
            velocity.addScaledVector(
              result.normal,
              -result.normal.dot(velocity),
            );
          } else if (!object.isGrounded()) {
            object.setGrounded(onGround);
          }

          if (this.#triangleIndexSet.size > 0) {
            for (const index of this.#triangleIndexSet) {
              const vindex = geometry.index.getX(index * 3);

              if (
                intersected.offset <= vindex &&
                vindex <= intersected.offset + intersected.count
              ) {
                object.platform = intersected;
                break;
              }
            }
          }

          const fallingDistance = object.getFallingDistance();

          if (onGround && fallingDistance >= World.fallingDeathDistance) {
            this.eventManager.dispatch(null, 'fall-down', object);
          }
        } else {
          // object.addBounceCount();

          velocity.addScaledVector(
            result.normal,
            -result.normal.dot(velocity) * 1.5,
          );
        }

        if (result.depth >= Game.EPS) {
          this.#move.add(result.normal.multiplyScalar(result.depth));
        }
      }
    });

    collidable.traverse(({ collider }) => {
      collider.moveBy(this.#move);
      this.sap.updateObject(collider);
    });
  }

  #collisionWithObject(a1, a2) {
    const { states } = this.game;
    this.#move1.set(0, 0, 0);
    this.#move2.set(0, 0, 0);
    const { velocity: av1 } = a1.collidable;
    const { velocity: av2 } = a2.collidable;

    a1.collidable.traverse(({ collider: ca1, velocity: v1 }) => {
      if (ca1.isEnabled()) {
        a2.collidable.traverse(({ collider: ca2, velocity: v2 }) => {
          if (ca2.isEnabled()) {
            if (ca1.type === 'capsule' && ca2.type === 'capsule') {
              let collided = false;

              const la1 = this.#l1.set(
                ca1.getProp('start'),
                ca1.getProp('end'),
              );
              const la2 = this.#l2.set(
                ca2.getProp('start'),
                ca2.getProp('end'),
              );
              lineToLineClosestPoints(la1, la2, this.#t1, this.#t2);
              this.#vecA.subVectors(this.#t1, this.#t2);
              const len = this.#vecA.length();
              const normal = this.#vecA.normalize();
              const depth = ca1.getProp('radius') + ca2.getProp('radius') - len;

              if (depth > 0) {
                collided = true;

                const m1 = ca1.stats.weight;
                const m2 = ca2.stats.weight;
                const m = m1 + m2;

                this.#vecB.subVectors(v1, v2);
                const dot = this.#vecB.dot(normal);

                if (dot <= 0) {
                  const j = (-(1 + Restitution) * dot * (m1 * m2)) / m;
                  this.#vecC.copy(normal).multiplyScalar(j);

                  //v1.add(this.#vecD.copy(this.#vecC).divideScalar(m1));
                  //v2.sub(this.#vecE.copy(this.#vecC).divideScalar(m2));
                  av1.add(this.#vecD.copy(this.#vecC).divideScalar(m1));
                  av2.sub(this.#vecE.copy(this.#vecC).divideScalar(m2));
                }

                this.#move1.add(normal.multiplyScalar(depth));
                this.#move2.add(normal.multiplyScalar(-depth));
              }

              /* if (collided && a1.type === 'character' && a2.type === 'character') {
                    this.eventManager.dispatch('collision', a1.name, a1, a2);
                    this.eventManager.dispatch('collision', a2.name, a2, a1);
                  } */
            } else if (ca1.type === 'capsule') {
              let collided = false;

              this.#l1.set(ca1.getProp('start'), ca1.getProp('end'));
              ca2.getCenter(this.#c2);

              this.#l1.closestPointToPoint(this.#c2, true, this.#t1);
              this.#vecA.subVectors(this.#t1, this.#c2);
              const len = this.#vecA.length();
              const normal = this.#vecA.normalize();
              const depth = ca1.getProp('radius') + ca2.getProp('radius') - len;

              if (depth > 0) {
                collided = true;

                if (a2.type !== 'item') {
                  const m1 = ca1.stats.weight;
                  const m2 = ca2.stats.weight;
                  const m = m1 + m2;

                  const rv = this.#vecB.subVectors(v1, v2);
                  const dot = rv.dot(normal);

                  if (dot <= 0) {
                    const j = (-(1 + Restitution) * dot * (m1 * m2)) / m;
                    this.#vecC.copy(normal).multiplyScalar(j);

                    //v1.add(this.#vecD.copy(this.#vecC).divideScalar(m1));
                    //v2.sub(this.#vecE.copy(this.#vecC).divideScalar(m2));
                    av1.add(this.#vecD.copy(this.#vecC).divideScalar(m1));
                    av2.sub(this.#vecE.copy(this.#vecC).divideScalar(m2));
                  }

                  const diff = this.#vecF.copy(normal).multiplyScalar(depth);
                  this.#move1.add(diff);

                  if (ca2.type === 'sphere') {
                    this.#move2.add(normal.multiplyScalar(-depth));
                  } else if (ca2.type === 'aabb') {
                    this.#move2.add(diff.negate()); /// //////////
                  }
                }
              }

              if (collided) {
                // a2.addBounceCount();

                if (a2.type === 'item' && a1.type === 'character') {
                  if (a1.hasControls) {
                    this.effect(a2, a1);
                  }
                } /* else if (
                      capsule.object.type === 'character' &&
                      other.object.type === 'ammo'
                    ) {
                      playSound?.('damage');
                      capsule.object.setStunning(World.collisionShock);

                      other.object.enableCollider(false);

                      if (!capsule.object.hasControls) {
                        const hits = states.get('hits');
                        states.set('hits', hits + 1);
                      }
                    } */
              }
            } else if (ca2.type === 'capsule') {
              let collided = false;

              this.#l2.set(ca2.getProp('start'), ca2.getProp('end'));
              ca1.getCenter(this.#c1);

              this.#l2.closestPointToPoint(this.#c1, true, this.#t1);
              this.#vecA.subVectors(this.#t1, this.#c1);
              const len = this.#vecA.length();
              const normal = this.#vecA.normalize();
              const depth = ca1.getProp('radius') + ca2.getProp('radius') - len;

              if (depth > 0) {
                collided = true;

                if (a1.type !== 'item') {
                  const m1 = ca1.stats.weight;
                  const m2 = ca2.stats.weight;
                  const m = m1 + m2;

                  const rv = this.#vecB.subVectors(v2, v1);
                  const dot = rv.dot(normal);

                  if (dot <= 0) {
                    const j = (-(1 + Restitution) * dot * (m1 * m2)) / m;
                    this.#vecC.copy(normal).multiplyScalar(j);

                    //v2.add(this.#vecD.copy(this.#vecC).divideScalar(m2));
                    //v1.sub(this.#vecE.copy(this.#vecC).divideScalar(m1));
                    av2.add(this.#vecD.copy(this.#vecC).divideScalar(m2));
                    av1.sub(this.#vecE.copy(this.#vecC).divideScalar(m1));
                  }

                  const diff = this.#vecF.copy(normal).multiplyScalar(depth);
                  this.#move2.add(diff);

                  if (ca1.type === 'sphere') {
                    this.#move1.add(normal.multiplyScalar(-depth));
                  } else if (ca2.type === 'aabb') {
                    this.#move1.add(diff.negate()); /// //////////
                  }
                }
              }

              if (collided) {
                // a1.addBounceCount();

                if (a1.type === 'item' && a2.type === 'character') {
                  if (a2.hasControls) {
                    this.effect(a1, a2);
                  }
                } /* else if (
                      capsule.object.type === 'character' &&
                      other.object.type === 'ammo'
                    ) {
                      playSound?.('damage');
                      capsule.object.setStunning(World.collisionShock);

                      other.object.enableCollider(false);

                      if (!capsule.object.hasControls) {
                        const hits = states.get('hits');
                        states.set('hits', hits + 1);
                      }
                    } */
              }
            } else {
              const c1 = ca1.getCenter(this.#c1);
              const c2 = ca2.getCenter(this.#c2);
              const r1 = ca1.getProp('radius');
              const r2 = ca2.getProp('radius');

              if (a1.type === 'item' || a2.type === 'item') {
                return true;
              }

              const d2 = c1.distanceToSquared(c2);
              const r = r1 + r2;
              const rr = r * r;

              if (d2 < rr) {
                const normal = this.#vecA.subVectors(c1, c2).normalize();

                const m1 = ca1.stats.weight;
                const m2 = ca2.stats.weight;
                const m = m1 + m2;

                this.#vecB.subVectors(v1, v2);
                const dot = this.#vecB.dot(normal);

                if (dot <= 0) {
                  const j = (-(1 + Restitution) * dot * (m1 * m2)) / m;

                  this.#vecC.copy(normal).multiplyScalar(j);

                  //v1.add(this.#vecD.copy(this.#vecC).divideScalar(m1));
                  //v2.sub(this.#vecE.copy(this.#vecC).divideScalar(m2));
                  av1.add(this.#vecD.copy(this.#vecC).divideScalar(m1));
                  av2.sub(this.#vecE.copy(this.#vecC).divideScalar(m2));
                }

                const d = (r - sqrt(d2)) / 2;

                this.#move1.addScaledVector(normal, d);
                this.#move2.addScaledVector(normal, -d);

                if (ca1.type === 'sphere') {
                  this.#move1.addScaledVector(normal, d);
                } else if (ca1.type === 'aabb') {
                  this.#vecF.copy(normal).multiplyScalar(d);
                  this.#move1.add(this.#vecF);
                }

                if (ca2.type === 'sphere') {
                  this.#move2.addScaledVector(normal, -d);
                } else if (ca2.type === 'aabb') {
                  this.#vecF.copy(normal).multiplyScalar(-d);
                  this.#move2.add(this.#vecF);
                }

                // a1.addBounceCount();
                // a2.addBounceCount();
              }
            }
          }
        });
      }
    });

    a1.collidable.traverse(({ collider }) => {
      collider.moveBy(this.#move1);
    });
    a2.collidable.traverse(({ collider }) => {
      collider.moveBy(this.#move2);
    });
  }

  collisions() {
    const { refitSet, geometry, list: movableList } = this.movableManager;

    for (const object of this.list) {
      if (object.isAlive()) {
        this.#collisionWithTerrain(object, geometry, refitSet, movableList);
      }
    }

    this.sap.update();

    for (const [a1, a2] of this.sap.pairs) {
      if (a1.isAlive() && a2.isAlive()) {
        this.#collisionWithObject(a1, a2);
      }
    }
  }

  /* collisions() {
    const list = Array.from(this.list.keys());
    const { refitSet, geometry, list: movableList } = this.movableManager;

    for (const object of this.list) {
      if (object.isAlive()) {
        this.#collisionWithTerrain(object, geometry, refitSet, movableList);
      }
    }

    for (let i = 0, l = list.length - 1; i < l; i += 1) {
      for (let j = i + 1; j < l + 1; j += 1) {
        const a1 = list[i];
        const a2 = list[j];

        if (a1.isAlive() && a2.isAlive()) {
          this.#collisionWithObject(a1, a2);
        }
      }
    }
  } */

  update(deltaTime, elapsedTime, damping, currentStep, steps) {
    const list = Array.from(this.list.keys());
    const len = this.list.size;
    const totalTime = deltaTime * steps;

    for (let i = 0; i < len; i += 1) {
      const object = list[i];

      if (object.isAlive()) {
        const { type, collidable } = object;

        if (currentStep === 1) {
          object.preUpdate(totalTime);
        }

        object.update(deltaTime, elapsedTime, damping);

        collidable.traverse(({ collider }) => {
          const center = collider.getCenter(this.#colCenter);

          if (center.y < World.oob) {
            this.eventManager.dispatch(null, 'oob', object);
            return false;
          }
        });
      }
    }

    this.collisions();

    if (currentStep === steps) {
      for (let i = 0; i < len; i += 1) {
        const object = list[i];
        object.postUpdate(totalTime);
      }
    }
  }
}

export default ObjectManager;
