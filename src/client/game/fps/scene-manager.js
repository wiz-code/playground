import { WebGLRenderer, WebGLRenderTarget, Vector2, Color, LinearFilter, RGBAFormat } from 'three';
// import { WebGPURenderer } from 'three/webgpu';
//import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
//import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
//import { FXAAPass } from 'three/addons/postprocessing/FXAAPass.js';
//import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import {
  createSight,
  sightLines,
  createVerticalFrame,
  createPovIndicator,
  createCenterMark,
} from './screen';

const sceneFilterMap = new Map([/////////
  ['field', ['fxaa']],
  ['screen', ['fxaa']],
]);

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
    //this.renderTarget = new WebGLRenderTarget(width * this.devicePixelRatio, height * this.devicePixelRatio);

    this.renderer.autoClear = false;
    this.renderer.setClearAlpha(0);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    //this.renderer.setRenderTarget(this.renderTarget);

    //this.composer = new EffectComposer(this.renderer/*, this.renderTarget*/);
    //this.composer.renderToScreen = false;/////

    this.list = new Map();
  }

  add(name, scene, camera) {
    if (!this.list.has(name)) {
      this.list.set(name, [scene, camera]);
    }
      /*const filters = sceneFilterMap.get(name);

      if (filters.length > 0) {
        //const composer = new EffectComposer(this.renderer);
        //composer.setPixelRatio(this.devicePixelRatio);
        const renderPass = new RenderPass(scene, camera);
        renderPass.clear = false;
        if (name === 'field') this.renderer.setRenderTarget(this.composer.renderTarget2);
        
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

            default: {}
          }
        }

        

        this.list.set(name, [scene, camera, this.composer]);
      } else {
        this.list.set(name, [scene, camera, true]);
      }
    }*/
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
    /*const list = Array.from(this.list.values());

    for (let i = 0, l = list.length; i < l; i += 1) {
      const [, , composer] = list[i];

      if (this.composer != null) {
        this.composer.setSize(width, height);
      }
    }*/
  }

  dispose() {
    this.renderer.dispose();
    /*const list = Array.from(this.list.values());

    for (let i = 0, l = list.length; i < l; i += 1) {
      const [, , composer] = list[i];

      if (composer != null) {
        composer.dispose();
      }
    }*/
  }

  update(deltaTime) {
    this.renderer.clear();

    const list = Array.from(this.list.values());

    for (let i = 0, l = list.length; i < l; i += 1) {
      const [scene, camera] = list[i];
      this.renderer.clearDepth();
      this.renderer.render(scene, camera);
    }

  }
}

export default SceneManager;
