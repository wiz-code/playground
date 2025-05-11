import Common from '../common.json';
import { Sound } from './settings';
import Publisher from './publisher';

const { min, max, floor } = Math;
const { Paths } = Common;

const MaxSourceSize = 100;

class AudioManager extends Publisher {
  #loaded = false;

  #faildList = [];

  constructor(context = null, params = {}) {
    super();

    this.params = { ...Sound, ...params };

    this.context = context == null ? new AudioContext() : context;
    this.bufferMap = new Map([
      ['sfx', new Map()],
      ['bgm', new Map()],
    ]);
    this.sourceMap = new Map([
      ['sfx', new Map()],
      ['bgm', new Map()],
    ]);

    const pathMap = new Map(Paths);

    this.soundList = pathMap.get('Sounds');

    const AssetPaths = pathMap.get('Assets');
    const assetPaths = new Map(AssetPaths);
    this.prefixPath = assetPaths.get('sounds');

    this.setVolume = this.setVolume.bind(this);
    this.setMute = this.setMute.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);

    this.init();

    this.onStateChange = this.onStateChange.bind(this);
    this.context.addEventListener('statechange', this.onStateChange);
  }

  async init() {
    this.#loaded = await this.load();
  }

  async load(list = null) {
    const soundList = list == null ? this.soundList : list;
    const soundMap = Map.groupBy(soundList, ({ type }) => type);

    this.#loaded = true;
    this.#faildList.length = 0;

    const sfxList = soundMap.get('sfx');

    const invertedMap = new Map();
    const promises = sfxList.map(({ name, type, file }) => {
      const url = `${this.prefixPath}/${file}`;
      invertedMap.set(url, { name, type });
      const promise = fetch(url);
      return promise;
    });

    const results = await Promise.allSettled(promises);

    for (let i = 0, l = results.length; i < l; i += 1) {
      const { value: response } = results[i];

      const url = new URL(response.url);
      const { pathname } = url;
      const { name, type } = invertedMap.get(pathname);

      if (response.ok) {
        const bufferMap = this.bufferMap.get(type);
        const buffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(buffer);
        bufferMap.set(name, audioBuffer);
      } else {
        this.#faildList.push({ name, type });
      }
    }

    const bgmList = soundMap.get('bgm');

    for (let i = 0, l = bgmList.length; i < l; i += 1) {
      const { name, type, file } = bgmList[i];
      const sourceMap = this.sourceMap.get(type);
      const element = document.createElement('audio');
      element.loop = true;

      const listener = () => {
        const source = new MediaElementAudioSourceNode(this.context, {
          mediaElement: element,
        });

        let gain = this.params.volume * 0.01;
        gain = min(1, max(0, gain));
        const gainNode = new GainNode(this.context, { gain });
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        sourceMap.set(name, { element, source, gainNode });

        element.removeEventListener('loadstart', listener);
      };
      element.addEventListener('loadstart', listener);

      const url = `${this.prefixPath}/${file}`;
      element.src = url;
    }

    return true;
  }

  onStateChange() {
    if (this.context.state === 'interrupted') {
      this.context.resume();
    }
  }

  setVolume(value) {
    this.params.volume = value;

    const sourceMap = this.sourceMap.get('bgm');

    for (const { gainNode } of sourceMap.values()) {
      gainNode.gain.value = value * 0.01;
    }
  }

  setMute(value) {
    this.params.mute = value;
    let sourceMap = this.sourceMap.get('bgm');

    for (const { element } of sourceMap.values()) {
      element.muted = value;
    }

    sourceMap = this.sourceMap.get('sfx');

    for (const name of sourceMap.keys()) {
      this.stop(name, 'sfx');
    }
  }

  dispose() {
    this.bufferMap.clear();
    this.sourceMap.clear();
    this.context.close();
  }

  play(name, type, delay = 0) {
    const sourceMap = this.sourceMap.get(type);

    if (type === 'sfx') {
      const bufferMap = this.bufferMap.get(type);

      if (!bufferMap.has(name)) {
        return;
      }

      const source = new AudioBufferSourceNode(this.context, {
        buffer: bufferMap.get(name),
      });

      if (!sourceMap.has(name)) {
        sourceMap.set(name, []);
      }

      const list = sourceMap.get(name);
      list.push(source);

      if (list.length > MaxSourceSize) {
        list.shift();
      }

      let gain = this.params.volume * 0.01;
      gain = !this.params.mute ? gain : 0;
      gain = min(1, max(0, gain));
      const gainNode = new GainNode(this.context, { gain });
      source.connect(gainNode);

      gainNode.connect(this.context.destination);
      source.start(this.context.currentTime + delay);
    } else if (type === 'bgm') {
      if (sourceMap.has(name)) {
        const { element } = sourceMap.get(name);
        const { mute } = this.params;

        if (mute) {
          element.muted = mute;
        }

        element.play();
      }
    }
  }

  stop(name, type) {
    const sourceMap = this.sourceMap.get(type);

    if (type === 'sfx') {
      const list = sourceMap.get(name);

      if (list.length > 0) {
        const source = list.pop();
        source.stop();
      }
    } else if (type === 'bgm') {
      if (sourceMap.has(name)) {
        const { element } = sourceMap.get(name);
        element.pause();
        element.currentTime = 0;
      }
    }
  }

  getPlayingTracks() {
    const trackNames = [];
    const sourceMap = this.sourceMap.get('bgm');

    for (const [name, { element }] of sourceMap) {
      if (!element.paused) {
        trackNames.push(name);
      }
    }

    return trackNames;
  }

  update(deltaTime, elapsedTime) {}
}

export default AudioManager;
