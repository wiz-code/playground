import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

import { Url } from './settings';

const gltfLoader = new GLTFLoader();

class ModelLoader {
  #promiseMap = new Map();

	constructor() {
		this.loader = null;
	}

  load(url, filename, loaderType = 'gltf') {
    const object = {
      name: filename,
      url,
      promise: null,
      data: null,
      progress: null,
      status: 'unstarted',
    };
    this.#promiseMap.set(filename, object);

    if (loaderType === 'gltf') {
      this.loader = gltfLoader;
    } else if (loaderType === 'vrm') {
      this.loader = gltfLoader;
      this.loader.register(ModelLoader.callbacks.vrm);
    }

    object.promise = new Promise((resolve, reject) => {
      object.status = 'loading';

      this.loader.load(
        url,
        (data) => {
          object.status = 'success';
          object.data = data;

          resolve(data);

          if (loaderType === 'vrm') {
            this.loader.unregister(ModelLoader.callbacks.vrm);
          }
        },
        (progress) => this.setProgress(filename, progress),
        (error) => {
          object.status = 'failed';
          reject(error);

          if (loaderType === 'vrm') {
            this.loader.unregister(ModelLoader.callbacks.vrm);
          }
        },
      );
    });

    return object.promise;
  }

  getPromise(filename) {
    if (this.#promiseMap.has(filename)) {
      const { object } = this.#promiseMap.get(filename);
      return object;
    }

    return null;
  }

  getProgress(filename) {
    if (this.#promiseMap.has(filename)) {
      const { progress } = this.#promiseMap.get(filename);

      if (progress == null) {
        return 0;
      }

      const rate = floor((progress.loaded / progress.total) * 100) / 100;
      return rate;
    }
  }

  setProgress(filename, progress) {
    if (this.#promiseMap.has(filename)) {
      const object = this.#promiseMap.get(filename);
      object.progress = progress;
    }
  }

  static callbacks = {
    vrm: (parser) => {
      return new VRMLoaderPlugin(parser);
    },
  };
}

export default ModelLoader;