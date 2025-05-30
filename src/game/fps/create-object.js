import {
  CircleGeometry,//////////////
  CapsuleGeometry,
  ConeGeometry,
  EdgesGeometry,
  SphereGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
  LineBasicMaterial,
  PointsMaterial,
  NormalBlending,
  Mesh,
  LineSegments,
  Points,
  Group,
} from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

import { Game } from '../settings';
import { World, Screen } from './settings';

const { HalfPI } = Game;
const { floor, PI } = Math;

const caches = {
  geometry: new Map(),
  material: new Map(),
};

const pointSpriteMap = new Map([
  ['normal', 'point'],
  ['small', 'pointThin'],
]);

const pointSizeMap = new Map([
  ['normal', 1],
  ['small', 0.5],
]);

const pointGap = 6;

const offsetMesh = (mesh, offset) => {
  const { rotation, position } = offset;

  if (rotation != null) {
    const { x = 0, y = 0, z = 0 } = rotation;

    const { rotation: rot } = mesh;

    rot.x = x;
    rot.y = y;
    rot.z = z;
  }

  if (position != null) {
    const px = position.x ?? 0;
    const py = position.y ?? 0;
    const pz = position.z ?? 0;

    const { position: pos } = mesh;

    pos.x = px;
    pos.y = py;
    pos.z = pz;
  }
};

export const createPolyhedron = (
  subtype,
  name,
  { type, style, size, transform = {}, wireframe = false, satellite = false },
  offset,
) => {
  let geometry = {};
  let material = {};
  const mesh = {};

  const key = `${subtype}-${name}`;
  let Geometry;

  switch (type) {
    case 'dodecahedron': {
      Geometry = DodecahedronGeometry;
      break;
    }

    case 'icosahedron': {
      Geometry = IcosahedronGeometry;
      break;
    }

    case 'octahedron': {
      Geometry = OctahedronGeometry;
      break;
    }

    case 'tetrahedron': {
      Geometry = TetrahedronGeometry;
      break;
    }

    default: {
    }
  }

  if (caches.geometry.has(key)) {
    geometry = caches.geometry.get(key);
  } else {
    geometry.body = new Geometry(size.radius, size.detail);

    if (wireframe) {
      geometry.wire = new EdgesGeometry(geometry.body);
    }

    if (satellite) {
      const pointDetail = size.pointDetail ?? 0;
      geometry.points = new OctahedronGeometry(size.radius + 1, pointDetail);
      const pointsVertices = geometry.points.getAttribute('position').array.slice();

      geometry.points = new BufferGeometry();
      geometry.points.setAttribute(
        'position',
        new Float32BufferAttribute(pointsVertices, 3),
      );
    }

    caches.geometry.set(key, geometry);
  }

  if (caches.material.has(key)) {
    material = caches.material.get(key);
  } else {
    material.body = new MeshBasicMaterial({
      color: style.color,
    });

    if (wireframe) {
      material.wire = new LineBasicMaterial({
        color: style.wireColor,
      });
    }

    if (satellite) {
      material.points = new PointsMaterial({
        color: style.pointColor,
        size: World.pointSize,
        map: self.texture.get('point'),
        blending: NormalBlending,
        alphaTest: 0.5,
      });
    }

    caches.material.set(key, material);
  }

  mesh.body = new Mesh(geometry.body, material.body);
  mesh.body.name = name;

  if (wireframe) {
    mesh.wire = new LineSegments(geometry.wire, material.wire);
    mesh.body.add(mesh.wire);
  }

  if (satellite) {
    mesh.points = new Points(geometry.points, material.points);
    mesh.points.name = 'points';
    mesh.body.add(mesh.points);
  }

  offsetMesh(mesh.body, offset);

  return mesh.body;
};

export const createSphere = (subtype, name, type, body, offset) => {
  const {
    wireframe = false,
    satellite = false,
    satelliteCap = 'both',
    pointSize = 'normal',
    style,
    size,
    transform = {},
  } = body;
  let geometry = {};
  let material = {};
  const mesh = {};

  const key = `${subtype}-${name}`;

  if (caches.geometry.has(key)) {
    geometry = caches.geometry.get(key);
  } else {
    const widthSegments = size.widthSegments ?? 12;
    const heightSegments = size.heightSegments ?? 6;
    geometry.body = new SphereGeometry(
      size.radius,
      widthSegments,
      heightSegments,
    );

    if (wireframe) {
      geometry.wire = new EdgesGeometry(geometry.body);
    }

    if (satellite) {
      let geom;
      const pointDetail = size.pointDetail ?? 0;
      const additional = pointSizeMap.get(pointSize);
      const radius = size.radius + additional;

      if (satelliteCap === 'both') {
        geom = new OctahedronGeometry(radius, pointDetail);
      } else if (satelliteCap === 'end') {
        geom = new ConeGeometry(radius, radius, 3);
        geom.translate(0, radius * 0.5, 0);
      } else {
        geom = new CircleGeometry(radius, 3);
        geom.rotateX(-PI * 0.5);
      }

      const pointsVertices = geom.getAttribute('position').array.slice();

      geometry.points = new BufferGeometry();
      geometry.points.setAttribute(
        'position',
        new Float32BufferAttribute(pointsVertices, 3),
      );
    }

    if (type === 'joint') {
      geometry.body.rotateX(PI * 0.5);

      if (wireframe) {
        geometry.wire.rotateX(PI * 0.5);
      }

      if (satellite) {
        geometry.points.rotateX(PI * 0.5);
      }
    }

    if (transform != null) {
      const { position, rotation } = transform;

      if (rotation != null) {
        const rx = rotation.x ?? 0;
        const ry = rotation.y ?? 0;
        const rz = rotation.z ?? 0;

        geometry.body.rotateY(ry);
        geometry.body.rotateX(rx);
        geometry.body.rotateZ(rz);

        if (wireframe) {
          geometry.wire.rotateY(ry);
          geometry.wire.rotateX(rx);
          geometry.wire.rotateZ(rz);
        }

        if (satellite) {
          geometry.points.rotateY(ry);
          geometry.points.rotateX(rx);
          geometry.points.rotateZ(rz);
        }
      }

      if (position != null) {
        const px = position.x ?? 0;
        const py = position.y ?? 0;
        const pz = position.z ?? 0;

        geometry.body.translate(px, py, pz);

        if (wireframe) {
          geometry.wire.translate(px, py, pz);
        }

        if (satellite) {
          geometry.points.translate(px, py, pz);
        }
      }
    }

    caches.geometry.set(key, geometry);
  }

  if (caches.material.has(key)) {
    material = caches.material.get(key);
  } else {
    material.body = new MeshBasicMaterial({
      color: style.color,
    });

    if (wireframe) {
      material.wire = new LineBasicMaterial({
        color: style.wireColor,
      });
    }

    if (satellite) {
      const pSprite = pointSpriteMap.get(pointSize);
      const pSize = pointSizeMap.get(pointSize) * World.pointSize;
      material.points = new PointsMaterial({
        color: style.pointColor,
        size: pSize,
        map: self.texture.get(pSprite),
        blending: NormalBlending,
        alphaTest: 0.5,
      });
    }

    caches.material.set(key, material);
  }

  mesh.body = new Mesh(geometry.body, material.body);
  mesh.body.name = name;

  if (wireframe) {
    mesh.wire = new LineSegments(geometry.wire, material.wire);
    mesh.body.add(mesh.wire);
  }

  if (satellite) {
    mesh.points = new Points(geometry.points, material.points);
    mesh.points.name = 'points';
    mesh.body.add(mesh.points);
  }

  offsetMesh(mesh.body, offset);

  return mesh.body;
};

export const createCapsule = (subtype, name, type, body, offset) => {
  const {
    wireframe = false,
    satellite = false,
    satelliteCap = 'both',
    pointSize = 'normal',
    style,
    size,
    transform = {},
  } = body;
  let geometry = {};
  let material = {};
  const mesh = {};

  const key = `${subtype}-${name}`;

  if (caches.geometry.has(key)) {
    geometry = caches.geometry.get(key);
  } else {
    const capSegments = size.capSegments ?? 4;
    const radiusSegments = size.radiusSegments ?? 8;
    const heightSegments = size.heightSegments ?? 1;
    geometry.body = new CapsuleGeometry(size.radius, size.height, capSegments, radiusSegments, heightSegments);

    if (wireframe) {
      geometry.wire = new EdgesGeometry(geometry.body);
    }

    if (satellite) {
      const additional = pointSizeMap.get(pointSize);
      const radius = size.radius + additional;
      const heightSegments = (size.height > pointGap ? floor(size.height / pointGap) : 0) + 1;
      let geom;

      if (satelliteCap == 'both') {
        geom = new CapsuleGeometry(radius, size.height, 1, 3, heightSegments);
      } else if (satelliteCap === 'end') {
        const geom1 = new ConeGeometry(radius, radius, 3);
        geom1.translate(0, (size.height + radius) * 0.5, 0);
        const geom2 = new CylinderGeometry(radius, radius, size.height, 3, heightSegments, true);
        geom = mergeGeometries([geom1, geom2]);
        geom = mergeVertices(geom);
      } else {
        geom = new CylinderGeometry(radius, radius, size.height, 3, heightSegments, true);
      }
      const vertices = geom.getAttribute('position').array.slice();

      geometry.points = new BufferGeometry();
      geometry.points.setAttribute(
        'position',
        new Float32BufferAttribute(vertices, 3),
      );
    }

    if (type === 'joint' || type === 'arm') {
      geometry.body.rotateX(PI * 0.5);

      if (type === 'arm') {
        geometry.body.translate(0, 0, size.height * 0.5);
      }

      if (wireframe) {
        geometry.wire.rotateX(PI * 0.5);

        if (type === 'arm') {
          geometry.wire.translate(0, 0, size.height * 0.5);
        }
      }

      if (satellite) {
        geometry.points.rotateX(PI * 0.5);

        if (type === 'arm') {
          geometry.points.translate(0, 0, size.height * 0.5);
        }
      }
    }
    
    if (transform != null) {
      const { position, rotation } = transform;

      if (rotation != null) {
        const rx = rotation.x ?? 0;
        const ry = rotation.y ?? 0;
        const rz = rotation.z ?? 0;

        geometry.body.rotateX(rx);
        geometry.body.rotateY(ry);
        geometry.body.rotateZ(rz);

        if (wireframe) {
          geometry.wire.rotateX(rx);
          geometry.wire.rotateY(ry);
          geometry.wire.rotateZ(rz);
        }

        if (satellite) {
          geometry.points.rotateX(rx);
          geometry.points.rotateY(ry);
          geometry.points.rotateZ(rz);
        }
      }

      if (position != null) {
        const px = position.x ?? 0;
        const py = position.y ?? 0;
        const pz = position.z ?? 0;

        geometry.body.translate(px, py, pz);

        if (wireframe) {
          geometry.wire.translate(px, py, pz);
        }

        if (satellite) {
          geometry.points.translate(px, py, pz);
        }
      }
    }

    caches.geometry.set(key, geometry);
  }

  if (caches.material.has(key)) {
    material = caches.material.get(key);
  } else {
    material.body = new MeshBasicMaterial({
      color: style.color,
    });

    if (wireframe) {
      material.wire = new LineBasicMaterial({
        color: style.wireColor,
      });
    }

    if (satellite) {
      const pSprite = pointSpriteMap.get(pointSize);
      const pSize = pointSizeMap.get(pointSize) * World.pointSize;
      material.points = new PointsMaterial({
        color: style.pointColor,
        size: pSize,
        map: self.texture.get(pSprite),
        blending: NormalBlending,
        alphaTest: 0.5,
      });
    }

    caches.material.set(key, material);
  }

  mesh.body = new Mesh(geometry.body, material.body);
  mesh.body.name = name;

  if (wireframe) {
    mesh.wire = new LineSegments(geometry.wire, material.wire);
    mesh.body.add(mesh.wire);
  }

  if (satellite) {
    mesh.points = new Points(geometry.points, material.points);
    mesh.points.name = 'points';
    mesh.body.add(mesh.points);
  }

  offsetMesh(mesh.body, offset);

  return mesh.body;
};

export const createBody = (
  subtype,
  name,
  type,
  { style, size, transform = {}, wireframe, satellite },
  offset,
) => {
  let geometry = {};
  let material = {};
  const mesh = {};

  const body = createCapsule(
    subtype,
    name,
    type,
    { style, size, transform, wireframe, satellite },
    offset,
  );
  const bust = createBust(subtype, name, { style, size });
  body.add(bust);

  const navelSize = size.radius * 0.2;
  const navelOffsetY = -size.height * 0.15;
  const navelOffsetZ = size.radius;

  const key = `${subtype}-${name}-navel`;

  if (caches.geometry.has(key)) {
    geometry = caches.geometry.get(key);
  } else {
    geometry.navel = new SphereGeometry(
      navelSize,
      16,
      8,
      undefined,
      undefined,
      undefined,
      PI / 2,
    );
    geometry.navel.rotateX(PI / 2);

    caches.geometry.set(key, geometry);
  }

  if (caches.material.has(key)) {
    material = caches.material.get(key);
  } else {
    material.navel = new MeshBasicMaterial({
      color: style.navelColor,
    });

    caches.material.set(key, material);
  }

  mesh.navel = new Mesh(geometry.navel, material.navel);
  mesh.navel.position.setY(navelOffsetY);
  mesh.navel.position.setZ(navelOffsetZ);

  body.add(mesh.navel);

  return body;
};

export const createArrow = () => {
  const geometry = {};
  const material = {};
  const mesh = {};

  const scale = 0.8;
  const arrowHeadRadius = scale * Screen.arrowSize.width * 0.08;
  const arrowBodyRadius = scale * Screen.arrowSize.width * 0.04;
  const arrowHeadLength = scale * Screen.arrowSize.height * 0.3;
  const arrowBodyLength = scale * Screen.arrowSize.height * 0.6;

  geometry.arrowHead = new ConeGeometry(arrowHeadRadius, arrowHeadLength, 32);
  geometry.arrowBody = new CylinderGeometry(
    arrowBodyRadius,
    arrowBodyRadius,
    arrowBodyLength,
    32,
  );
  geometry.arrowHead.rotateX(PI * 0.5);
  geometry.arrowBody.rotateX(PI * 0.5);
  geometry.arrowHead.translate(0, 0, (arrowHeadLength + arrowBodyLength) / 2);

  geometry.arrow = mergeGeometries([geometry.arrowHead, geometry.arrowBody]);
  geometry.arrow.center();

  material.arrow = new MeshBasicMaterial({
    color: Screen.arrowColor,
    transparent: true,
    opacity: 0.5,
  });
  mesh.arrow = new Mesh(geometry.arrow, material.arrow);
  mesh.arrow.name = 'arrow';

  return mesh.arrow;
};

export const createBust = (subtype, name, { style, size }) => {
  let geometry = {};
  let material = {};
  const mesh = {};

  const bustOffset = size.height / 2;
  const faceSize = size.radius * 0.65;
  const faceOffset = size.radius * 0.68;

  const key = `${subtype}-${name}-bust`;

  if (caches.geometry.has(key)) {
    geometry = caches.geometry.get(key);
  } else {
    geometry.face = new SphereGeometry(
      faceSize,
      8,
      4,
      undefined,
      undefined,
      undefined,
      PI / 2,
    );
    geometry.faceWire = new EdgesGeometry(geometry.face);
    geometry.face.rotateX(PI / 2);
    geometry.faceWire.rotateX(PI / 2);

    caches.geometry.set(key, geometry);
  }

  if (caches.material.has(key)) {
    material = caches.material.get(key);
  } else {
    material.face = new MeshBasicMaterial({
      color: style.faceColor,
    });
    material.faceWire = new LineBasicMaterial({
      color: style.faceWireColor,
    });

    caches.material.set(key, material);
  }

  mesh.face = new Mesh(geometry.face, material.face);
  mesh.faceWire = new LineSegments(geometry.faceWire, material.faceWire);

  mesh.face.name = 'face';
  mesh.face.add(mesh.faceWire);
  mesh.face.position.setZ(faceOffset);

  const bust = new Group();
  bust.name = 'bust';
  bust.position.setY(bustOffset);
  bust.add(mesh.face);

  return bust;
};
