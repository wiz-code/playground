import { Color, /**/ Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { Url } from './settings';

const gltfLoader = new GLTFLoader();

class WorkerLoader {
  #promiseMap = new Map();///////

	constructor() {
		this.loader = null;
	}

	async load(filename, loaderType = 'gltf') {
    const url = `${Url.objects}${filename}`;
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
		}

    object.promise = new Promise((resolve, reject) => {
      object.status = 'loading';

      this.loader.load(
        url,
        (data) => {
          object.status = 'success';
          object.data = data;

          /*if (this.#gltf.userData.vrm != null) {
            VRMUtils.removeUnnecessaryVertices(this.#gltf.scene);
            VRMUtils.removeUnnecessaryJoints(this.#gltf.scene);
          }*/

          resolve(data);
        },
        (progress) => this.setProgress(filename, progress),
        (error) => {
          object.status = 'failed';
          reject(error);
        },
      );
    });

    return object.promise;
  }

  clearObject(filename) {///////////
    if (this.#promiseMap.has(filename)) {
      const { data } = this.#promiseMap.get(filename);
  	
      if (data != null) {
  		  data.dispose();
      }
  	}
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
}

const init = () => {
  const loader = new WorkerLoader();

  const onMessage = (event) => {
  	switch (event.data.type) {
      case 'load': {
        const [filename, loaderType] = event.data.value;
        loader.load(filename, loaderType).then((data) => {
          const json = data.scene.toJSON();
          data.scene.traverse((child) => {
            if (child instanceof Mesh) {
              child.geometry.dispose();

              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          self.postMessage({ type: 'load-model', value: json });
        }).catch((e) => console.error(e));
      	break;
      }

  		default: {}
  	}
  };
   
  self.addEventListener('message', onMessage);
};

self.addEventListener('message', init, { once: true });

