import {
  Box3,
  Sphere,
  Vector3,
  Euler,
  Spherical,
  Object3D,
  Quaternion,
  /* */ CapsuleGeometry,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  EdgesGeometry /* */,
} from 'three';

import { World, InitialDir, Axis } from './settings';
import Capsule from './capsule';
import Collider from './collider';
import {
  createCapsule,
  createCapsuloid,
  createBust,
  createSphere,
  createPolyhedron,
} from './create-object';
import Skeletal from './skeletal';
import { getVectorPos, visibleChildren, getRandomDistance } from './utils';
import { Game } from '../settings';

const { HalfPI } = Game;

const { PI } = Math;

class Collidable {
  #vec = new Vector3();

  #v1 = new Vector3();

  #v2 = new Vector3();

  #v3 = new Vector3();

  #center = new Vector3();

  #pos = new Vector3();

  #rot = new Euler();

  #q1 = new Quaternion();

  #q2 = new Quaternion();

  constructor(object, parent = null, data) {
    this.object = object;
    this.parent = parent;
    this.children = [];

    this.velocity = new Vector3();
    this.data = {
      prevCenter: new Vector3(),
    };

    /// /////
    this.mesh = new Object3D();
    /// ////

    const {
      name,
      type,
      offset,
      body,
      collider,
      skeletal,
      children = [],
    } = data;

    this.name = name;
    this.type = type ?? 'object';
    this.offset = offset ?? {};
    this.params = { body, collider };//////////////

    if (body.shape === 'capsuloid') {
      this.body = createCapsuloid(
        object.subtype,
        name,
        this.type,
        body,
        this.offset,
      );
    } else if (body.shape === 'capsule') {
      this.body = createCapsule(
        object.subtype,
        name,
        this.type,
        body,
        this.offset,
      );
      /// ////////
      let geom = new CapsuleGeometry(
        body.size.radius * 1.1,
        body.size.height,
        4,
        8,
        3,
      );
      //geom.translate(0, body.size.height * 0.5, 0);
      geom = new EdgesGeometry(geom);
      const mat = new MeshBasicMaterial({
        color: 0x5aff19,
      });
      this.mesh = new Mesh(geom, mat);
      object.game.scene.add(this.mesh);
      /// ////////////////////
    } else if (body.shape === 'polyhedron') {
      this.body = createPolyhedron(object.subtype, name, body, this.offset);
    } else if (body.shape === 'sphere') {
      this.body = createSphere(
        object.subtype,
        name,
        this.type,
        body,
        this.offset,
      );
      /// //////////
      let geom = new SphereGeometry(body.size.radius * 1.1, 8, 4);
      geom = new EdgesGeometry(geom);
      const mat = new MeshBasicMaterial({
        color: 0x5aff19,
      });
      this.mesh = new Mesh(geom, mat);
      object.game.scene.add(this.mesh);
      /// ////////
    } else if (body.shape === 'none') {
      this.body = new Object3D();
      this.body.name = name;
    }

    // 親オブジェクトがアームの場合、自身の起点を親アームの長さ分だけ進ませる必要がある
    if (parent != null && parent.type === 'arm') {
      const { height } = parent.body.geometry.parameters;
      this.body.position.z += height;
    }

    this.satellite = null;
    const satellite = this.body.getObjectByName('points');

    if (satellite != null) {
      this.satellite = satellite;
    }

    let bounds;

    if (collider.shape === 'capsule') {
      bounds = new Capsule(
        new Vector3(0, collider.size.height * -0.5, 0),
        new Vector3(0, collider.size.height * 0.5, 0),
        collider.size.radius,
      );
    } else if (collider.shape === 'sphere') {
      bounds = new Sphere(new Vector3(0, 0, 0), collider.size.radius);
    } else if (collider.shape === 'aabb') {
      bounds = new Box3(collider.min, collider.max);
    }

    this.collider = new Collider(object, bounds, collider.size, collider.stats, this.type);
    this.collider.enable(collider.enabled ?? true);

    this.skeletal = null;

    if (skeletal != null) {
      //const { name, options } = skeletal;
      const { name, clips } = skeletal;
      //this.skeletal = new Skeletal(name, this.object, this, options);
      this.skeletal = new Skeletal(name, clips, this.object, this);
    }

    this.rotation = new Quaternion(); // ローカル回転
    this.quaternion = new Quaternion(); // グローバル回転
    this.position = new Vector3(); // ローカル座標
    this.updated = false;//////////

    if (children.length > 0) {
      for (let i = 0, l = children.length; i < l; i += 1) {
        const cdata = children[i];
        const collidable = new Collidable(object, this, cdata);
        this.children.push(collidable);
      }
    }
  }

  show() {
    if (this.object.hasControls) {
      this.body.traverse((mesh) => {
        if (mesh.isMesh || mesh.isLineSegments || mesh.isPoints) {
          mesh.material.visible = true;
        }
      });
    } else {
      this.traverse(({ body }) => (body.visible = true));
    }
  }

  hide() {
    if (this.object.hasControls) {
      this.body.traverse((mesh) => {
        if (mesh.isMesh || mesh.isLineSegments || mesh.isPoints) {
          mesh.material.visible = false;
        }
      });
    } else {
      this.traverse(({ body }) => (body.visible = false));
    }
  }

  attach(scene) {
    this.traverse((col) => {
      const { parent, body } = col;

      if (parent != null) {
        parent.body.add(body);
      } else {
        scene.add(body);
      }
    });
  }

  detach(scene) {
    this.traverse((col) => {
      const { parent, body } = col;

      if (parent != null) {
        parent.body.remove(body);
      } else {
        scene.remove(body);
      }
    });
  }

  setPosition(vec) {
    this.position.copy(vec);
    this.applyRotation();
  }

  setRotation(rotation) {
    if (rotation.isEuler) {
      this.#q1.setFromEuler(rotation);
    } else {
      this.#q1.copy(rotation);
    }

    this.rotation.copy(this.#q1);
  }

  rotateBy(delta = new Quaternion()) {
    this.rotation.multiply(delta);
  }

  applyRotation() {
    this.traverse(({ object, parent, body, collider, rotation, quaternion, position }, depth) => {
      if (parent == null) {
        quaternion.copy(object.rotation).multiply(rotation);
        this.updated = true;

        if (collider.shape === 'capsule') {
          collider.setCapsuleRotation(quaternion);
        }
        
        this.#v1.copy(object.position);

        this.#v2.copy(position);
        this.#v2.applyQuaternion(object.rotation);
      } else {
        if (depth === 0) {
          this.updated = true;
        }

        const { type: pt, collider: pc, quaternion: pq } = parent;
        quaternion.multiplyQuaternions(pq, rotation);

        if (collider.shape === 'capsule') {
          collider.setCapsuleRotation(quaternion);
        }

        if (pt === 'arm') {
          this.#v1.copy(pc.getProp('end'));
        } else {
          pc.getCenter(this.#v1);
        }

        this.#v2.copy(position);
        this.#v2.applyQuaternion(pq);
      }

      collider.moveTo(this.#v1);
      collider.moveBy(this.#v2);
    });
  }

  updateRotation() {
    this.traverse(({ parent, body, rotation, quaternion, updated }, depth) => {
      if (!updated) {
        return;
      }

      if (parent == null) {
        body.quaternion.copy(quaternion);
      } else {
        body.quaternion.copy(rotation);
      }

      this.updated = false;
    });
  }

  traverse(callback, depth = 0) {
    let flag = callback(this, depth) ?? true;

    if (!flag) {
      return;
    }

    for (let i = 0, l = this.children.length; i < l; i += 1) {
      const child = this.children[i];
      flag = child.traverse(callback, depth + 1) ?? true;

      if (!flag) {
        break;
      }
    }

    return flag;
  }

  getChildByName(name) {///////////
    let child = null;

    this.traverse((col) => {
      if (col.name === name) {
        child = col;
        return false;
      }
    });

    return child;
  }

  static init(root) {
    const euler = new Euler();

    root.traverse((col) => {
      const { offset, rotation, position } = col;
      const { rotation: rot = {}, position: pos = {} } = offset;

      euler.x = rot.x ?? 0;
      euler.y = rot.y ?? 0;
      euler.z = rot.z ?? 0;
      rotation.copy(new Quaternion().setFromEuler(euler));

      position.x = pos.x ?? 0;
      position.y = pos.y ?? 0;
      position.z = pos.z ?? 0;
    });
  }
}

export default Collidable;
