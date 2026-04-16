import { Color, /**/ Mesh } from 'three';

import { Url } from './settings';

const init = () => {
  const onMessage = (event) => {
  	switch (event.data.type) {
      case 'load-model': {
        const [filename, loaderType] = event.data.value;

        const loadFile = async () => {
          const url = `${Url.objects}${filename}`;
          let data;

          try {
            const res = await fetch(url);

            if (res.ok) {
              data = await res.arrayBuffer();
              self.postMessage(
                { type: 'send-model', value: [filename, loaderType, data] },
                [data],
              );
            } else {
              const message = `ERROR::RESPONSE_STATUS:${res.status}`;
              throw new Error(message);
            }
          } catch (e) {
            console.error(e);
          }
        };

        /*const loadFile = async () => {
          let data;

          try {
            data = await loader.load(filename, loaderType);
          } catch (e) {
            console.error(e);
          }
          
          let scene;

          if (loaderType === 'gltf') {
            ({ scene } = data);
          } else if (loaderType === 'vrm') {
            const { vrm } = data.userData;
            console.log(vrm);
            const decycled = decycle(vrm);
          const json = JSON.stringify(decycled);

          self.postMessage({ type: 'send-model', value: [filename, json] });return;
            //({ scene } = vrm);
          }

          const decycled = decycle(scene.toJSON());
          const json = JSON.stringify(decycled);

          self.postMessage({ type: 'send-model', value: [filename, json] });

          scene.traverse((object) => {
            if (object instanceof Mesh) {
              object.geometry.dispose();

              if (Array.isArray(object.material)) {
                object.material.forEach((mat) => {
                  Object.values(mat).forEach((prop) => {
                    if (prop?.isTexture) {
                      prop.dispose();
                    }
                  });
                  mat.dispose();
                });
              } else {
                Object.values(object.material).forEach((prop) => {
                  if (prop?.isTexture) {
                    prop.dispose();
                  }
                });
                object.material.dispose();
              }
            }
          });
        };*/
          
        loadFile();
      	break;
      }

  		default: {}
  	}
  };
   
  self.addEventListener('message', onMessage);
};

self.addEventListener('message', init, { once: true });

