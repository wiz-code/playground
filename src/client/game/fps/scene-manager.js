import {
  createSight,
  sightLines,
  createVerticalFrame,
  createPovIndicator,
  createCenterMark,
} from './screen';

class SceneManager {
  static createIndicators() {
    const povSight = createSight(self.texture);
    const povSightLines = sightLines(self.texture);
    const povIndicator = createPovIndicator(self.texture);
    const centerMark = createCenterMark(self.texture);
    const verticalFrame = createVerticalFrame(self.texture);

    return {
      povSight,
      povSightLines,
      povIndicator,
      centerMark,
      verticalFrame,
    };
  }

  constructor(renderer) {
    this.renderer = renderer;
    this.list = new Map();
  }

  add(name, scene, camera) {
    if (!this.list.has(name)) {
      this.list.set(name, [scene, camera]);
    }
  }

  remove(name) {
    if (this.list.has(name)) {
      this.list.delete(name);
    }
  }

  clear() {
    if (this.list.size > 0) {
      this.list.clear();
    }
  }

  update() {
    this.renderer.clear();

    const list = Array.from(this.list.values());

    for (let i = 0, l = list.length; i < l; i += 1) {
      const params = list[i];
      this.renderer.render(...params);
    }
  }
}

export default SceneManager;
