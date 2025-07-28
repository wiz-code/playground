import { Texture, ImageLoader } from 'three';
import sprites from './sprites';

const { PI } = Math;

const spriteMap = new Map([
  ['point', ['crossStar']],
  ['pointThin', ['crossStarThin']],
  ['directionIndicator', ['direction']],
  ['centerMark', ['centerGauge']],
  ['sight', ['sight']],
  ['sightLines', ['sightLines']],
  ['verticalFrame', ['verticalFrame']],
  ['verticalIndicator', ['verticalIndicator']],
]);

const imageMap = new Map([['heightmap-01', 'heightmap-01.png']]);

class TextureManager {
  constructor() {
    this.loader = new ImageLoader();
    this.imageMap = new Map();
    // this.contextMap = new Map();
    // this.spriteMap = new Map();

    for (const [name, params] of spriteMap) {
      const [spriteName, ...args] = params;
      this.createSprites(name, spriteName, args);
    }
  }

  createSprites(name, spriteName, args) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    sprites[spriteName](context, ...args);
    // const texture = new Texture(canvas);
    // texture.needsUpdate = true;

    this.imageMap.set(name, canvas);
  }

  async loadImages() {
    const list = [];

    for (const [name, file] of imageMap) {
      const { promise, resolve, reject } = Promise.withResolvers();

      const path = `/images/${file}`;
      this.loader.load(
        path,
        (image) => resolve({ name, image }),
        undefined,
        (err) => reject(err),
      );
      list.push(promise);
    }

    const images = await Promise.all(list);

    for (let i = 0, l = images.length; i < l; i += 1) {
      const { name, image } = images[i];
      this.imageMap.set(name, image);
    }

    return images;
  }

  /* toObject() {
    const entries = Array.from(this.spriteMap.entries());
    const textureObject = Object.fromEntries(entries);
    return textureObject;
  } */

  toImageBitmap() {
    const map = new Map();
    const keys = Array.from(this.imageMap.keys());
    const values = Array.from(this.imageMap.values());
    const promise = Promise.all(
      values.map((image) =>
        createImageBitmap(image, { imageOrientation: 'flipY' }),
      ),
    ).then((sprites) => {
      keys.forEach((key, index) => map.set(key, sprites[index]));
      return map;
    });

    return promise;
  }

  dispose(name) {
    this.imageMap.delete(name);
    /* this.contextMap.delete(name);
    const texture = this.spriteMap.get(name);
    texture.dispose();
    this.spriteMap.delete(name); */
  }

  disposeAll() {
    /* for (const key of this.spriteMap.keys()) {
      this.dispose(key);
    } */
  }
}

export default TextureManager;
