const initFPS = async function (data, params) {
  const { default: WorkerMain } = await import('./fps/main');
  self.main = new WorkerMain(data, params);
};

const init = (event) => {
  const { type, data, params } = event.data;

  if (type === 'init') {
    if (params.type === 'fps') {
      initFPS(data, params);
    } else if (params.type === 'racing') {
      //
    }
  }
};

self.addEventListener('message', init, { once: true });
