import { Vector3, Quaternion, Euler } from 'three';

import { World } from '../settings';

const Updaters = [
  [
    'swing-platform-1',
    function update(movable, params, direction, progress, deltaProgress) {
      const { motions } = params;
      const { object, offset, count } = movable;
      const position = movable.geometry.getAttribute('position');

      for (let i = 0, l = motions.length; i < l; i += 1) {
        const motion = motions[i];
        const { type, axis, moveBy } = motion;
        const delta =
          type === 'position'
            ? moveBy * World.spacing * direction * deltaProgress
            : 0;

        for (let j = 0; j < count; j += 1) {
          const index = offset + j;

          if (type === 'position') {
            if (axis === 'x') {
              const x = position.getX(index);
              position.setX(index, x + delta);
            } else if (axis === 'y') {
              const y = position.getY(index);
              position.setY(index, y + delta);
            } else {
              const z = position.getZ(index);
              position.setZ(index, z + delta);
            }
          }
        }

        if (type === 'position') {
          if (axis === 'x') {
            object.translateX(delta);
          } else if (axis === 'y') {
            object.translateY(delta);
          } else {
            object.translateZ(delta);
          }
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
