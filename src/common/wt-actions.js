
const serverActions = {
  startHeartbeat: async (session) => {
    try {
      const buffer = new ArrayBuffer(4);
      const sview = new DataView(buffer);
      const sentTime = performance.now();
      sview.setFloat32(0, sentTime);
  	      
    	session.sendSrcBidiStream(buffer);
    } catch (e) {
      console.error('Error sending heartbeat stream', e);
    }
  },
  startDatagramHeartbeat: async (session) => {
    try {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      const sentTime = performance.now();
      view.setFloat32(0, sentTime);
          
      session.sendDatagrams(buffer);
    } catch (e) {
      console.error('Error sending datagram heartbeat stream', e);
    }
  },
};

export { serverActions };