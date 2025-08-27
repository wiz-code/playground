import { setTimeout } from 'node:timers/promises';

import SessionTransport from '@lib/session-transport/dist/server/session-transport';
import { HeartbeatInterval } from '../common/constants';

const { default: ServerSessionTransport } = SessionTransport.ServerSessionTransport;
const { EventCodes } = ServerSessionTransport;

const serverHandlers = {
	'/wt/debug': [
	  [
	  	EventCodes.UnidiRecvStream,
	  	(value) => {
	   		console.log('server unidi-recv-stream', value);
	  	},
	  ],
		[
	  	EventCodes.SrcBidiRecvStream,
	  	async function (value) {
		    try {
		    	const rview = new DataView(value.buffer);
		      const receivedTime = rview.getFloat32(0);
		      const rtt = performance.now() - receivedTime;
		      console.info('RTT', rtt);
		      await setTimeout(HeartbeatInterval);
		      const buffer = new ArrayBuffer(4);
		      const sview = new DataView(buffer);
		      const sentTime = performance.now();
		      sview.setFloat32(0, sentTime);
		      const uint8 = new Uint8Array(buffer);
		      this.sendSrcBidiStream(uint8);
		    } catch (e) {
	      	console.error('error receiving heartbeat stream', e);
		    }
	 		},
		],
		[
	    EventCodes.DestBidiRecvStream, function (stream, value) {
	    	const text = new TextDecoder().decode(value);
	      console.log('receive bidi stream', text);
	      this.sendDestBidiStream(stream, 'エコー');
	    },
	  ],
	],
};

export default serverHandlers;