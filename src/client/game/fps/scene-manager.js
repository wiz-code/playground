import { WebGLRenderer, WebGLRenderTarget, Vector2, Color, LinearFilter, RGBAFormat } from 'three';
//import { WebGPURenderer } from 'three/webgpu';
import WebGPU from 'three/addons/capabilities/WebGPU.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import {
  createSight,
  sightLines,
  createVerticalFrame,
  createPovIndicator,
  createCenterMark,
} from './screen';

const sceneFilterMap = new Map([
  ['field', null],
  ['screen', null],
]);

const params = {
  ssao: [512, 512, 32],
};

const { round } = Math;

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

  constructor(canvas, params) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    this.devicePixelRatio = params.devicePixelRatio;

    const { width, height } = this.renderer.getSize(new Vector2());

    this.renderer.autoClear = false;
    this.renderer.setClearAlpha(0);
    this.renderer.setPixelRatio(this.devicePixelRatio);

    const renderTarget = new WebGLRenderTarget(width, height, { samples: 8 });
    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.list = new Map();
  }

  add(name, scene, camera) {
    const filters = sceneFilterMap.get(name);

    if (filters == null || (Array.isArray(filters) && filters.length === 0)) {
      this.list.set(name, [scene, camera, this.renderer]);
      return;
    }

    const renderPass = new RenderPass(scene, camera);
    renderPass.clear = false;
    this.composer.addPass(renderPass);

    for (let i = 0, l = filters.length; i < l; i += 1) {
      const filter = filters[i];

      switch (filter) {
        case 'fxaa': {
          const outputPass = new OutputPass();
          this.composer.addPass(outputPass);

          const fxaaPass = new FXAAPass();
          this.composer.addPass(fxaaPass);
          
          break;
        }

        case 'ssaa': {
          renderPass.enabled = false;

          const ssaaPass = new SSAARenderPass(scene, camera);
          ssaaPass.sampleLevel = 2;
          this.composer.addPass(ssaaPass);
          const outputPass = new OutputPass();
          this.composer.addPass(outputPass);
          
          break;
        }

        case 'ssao': {
          const ssaoPass = new SSAOPass(scene, camera, ...params.ssao);
          this.composer.addPass(ssaoPass);

          const outputPass = new OutputPass();
          this.composer.addPass(outputPass);
          
          break;
        }

        default: {}
      }
    }

    this.list.set(name, [scene, camera, this.composer]);
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

  setSize(width, height) {
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
  }

  dispose() {
    this.renderer.dispose();
    this.composer.dispose();
  }

  async compile() {
    for (const [scene, camera, renderer] of this.list.values()) {
      if (renderer === this.renderer) {
        await this.renderer.compileAsync(scene, camera);
      } else {
        await renderer.renderer.compileAsync(scene, camera);
      }
    }
  }

  update(deltaTime) {
    this.renderer.clear();

    for (const [scene, camera, renderer] of this.list.values()) {
      if (renderer === this.renderer) {
        this.renderer.clearDepth();
        this.renderer.render(scene, camera);
      } else {
        renderer.render(deltaTime);
      }
    }
  }
}

export default SceneManager;
