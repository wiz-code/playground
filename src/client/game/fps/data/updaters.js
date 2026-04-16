import { Vector3, Quaternion, Euler } from 'three';

import { World } from '../settings';

const Updaters = [
  [
    'move-platform',
    function update(movable, params, direction, progress, deltaProgress) {
      const { motions } = params;
      const { object, geometry, offset, count } = movable;
      const position = geometry.getAttribute('position');
      const delta = {};

      for (let i = 0, l = motions.length; i < l; i += 1) {
        const motion = motions[i];
        const { axis, moveBy } = motion;
        const value = moveBy * World.spacing * direction * deltaProgress;
        delta[axis] = value;
      }

      for (let j = 0; j < count; j += 1) {
        const index = offset + j;

        if (delta.x != null) {
          const value = position.getX(index) + delta.x;
          position.setX(index, value);
        }

        if (delta.y != null) {
          const value = position.getY(index) + delta.y;
          position.setY(index, value);
        }

        if (delta.z != null) {
          const value = position.getZ(index) + delta.z;
          position.setZ(index, value);
        }
      }

      position.needsUpdate = true;

      const { x, y, z } = object.position;

      if (delta.x != null) {
        object.position.x += delta.x;
      }

      if (delta.y != null) {
        object.position.y += delta.y;
      }

      if (delta.z != null) {
        object.position.z += delta.z;
      }
    },
  ],
  [
    'rotate-platform',
    function update(movable, params, direction, progress, deltaProgress) {///////////////////////////
      const { motions } = params;
      const { object, offset, count } = movable;
      const position = movable.geometry.getAttribute('position');

      for (let i = 0, l = motions.length; i < l; i += 1) {
        const motion = motions[i];
        const { type, axis, rotateBy } = motion;
        const delta = rotateBy * direction * deltaProgress;

        for (let j = 0; j < count; j += 1) {
          const index = offset + j;
        }
      }

      position.needsUpdate = true;
    },
  ],
  [
    'self-rotation',
    function update(object, params, direction, progress, deltaProgress) {
      const delta = direction * deltaProgress * 30;
      object.angularVel += delta;
    },
  ],
  /* [
    'self-rotation',
    function update(object, params, direction, progress, deltaProgress) {
      const delta = direction * deltaProgress * 1;
      const [col1] = object.collidable.children;
      const [joint] = col1.children;
      const q = new Quaternion().setFromEuler(new Euler(0, delta, 0));
      joint.updateDeltaRotation(q);
    },
  ], */
];

export default Updaters;
