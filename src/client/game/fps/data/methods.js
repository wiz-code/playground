import { Vector3 } from 'three';

const { random } = Math;

const Methods = [
  [
    'play-sound',
    function (name, delay) {
      self.postMessage({ type: 'play-sound', value: [name, delay] });
    },
  ],
  [
    'stop-sound',
    function (name) {
      self.postMessage({ type: 'stop-sound', value: name });
    },
  ],
  [
    'play-music',
    function (name, delay) {
      self.postMessage({ type: 'play-music', value: [name, delay] });
    },
  ],
  [
    'stop-music',
    function (name) {
      self.postMessage({ type: 'stop-music', value: name });
    },
  ],
];

const Handlers = [
  [
    'show',
    function (event) {
      const { parent: target, params } = event;
      target.setAlive();
      target.show(params);
    },
  ],
  [
    'hide',
    function (event) {
      const { parent: target } = event;
      target.setAlive(false);
      target.hide();
    },
  ],
  [
    'fall-down',
    function (event) {
      const { props } = event;
      const [target] = props;

      if (target.hasControls) {
        //
      } else {
        target.vanish();
      }
    },
  ],
  [
    'trigger-action', /// ////////
    function () {
      console.log(target.id, 'fire!!');
    },
  ],
  [
    'start-animation', /// ////////
    function (event) {
      const { parent: target, params } = event;
      const { command } = params;
      target.startAnimation(command);
    },
  ],
  [
    'play-music',
    function (event) {
      const {
        params: { name, delay },
      } = event;
      self.postMessage({ type: 'play-music', value: [name, delay] });
    },
  ],
  [
    'oob',
    function (event) {
      const { props } = event;
      const [target] = props;

      if (target.hasControls) {
        // const coords = this.getInitCoords();
        // target.setCoords(coords);
        target.vanish();
      } else {
        target.vanish();
      }
    },
  ],
];

export { Methods, Handlers };
