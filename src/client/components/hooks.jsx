import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import ClientSessionTransport from '@lib/session-transport';
import { WtPaths } from '../../common/constants';
//import { clientActions as actions } from '../../common/actions';
import clientHandlers from '../../client/client-handlers';

const handlerMap = new Map(clientHandlers);
const { EventCodes } = ClientSessionTransport;
/*const wtHandlerMap = {
  heartbeat: new Map([
    [EventCodes.TransportClose, () => sessionMap.delete(transport)],
    [
      EventCodes.RecvDatagrams, async function (value) {
        const rview = new DataView(value.buffer);
        const receivedTime = rview.getFloat32(0);
        console.log(receivedTime)

        try {
          await this.sendDatagrams(value);
        } catch (e) {
          console.error('Error reading Heartbeat datagrams', e);
        }
      },
    ],
    [
      EventCodes.UnidiRecvStream,
      (value) => {
        const text = new TextDecoder().decode(value);
        console.log('client unidi-recv-stream', text);
      },
    ],
    [
      EventCodes.SrcBidiRecvStream, (value) => {
        const text = new TextDecoder().decode(value);
        console.log('receive returned bidi stream!!!!', text);
      },
    ],
    [
      EventCodes.DestBidiRecvStream, async function (stream, value) {
        const rview = new DataView(value.buffer);
        const receivedTime = rview.getFloat32(0);

        try {
          await this.sendDestBidiStream(stream, value);
        } catch (e) {
          console.error('Error reading Heartbeat stream', e);
        }
      },
    ],
  ]),
};*/

function useWebTransport(handlerMap) {
  const [webTransport, setWebTransport] = useState(null);

  useEffect(() => {
    let wtUrl = process.env.REMOTE_WT_URL;

    if (process.env.ENV === 'local') {
      wtUrl = process.env.LOCAL_WT_URL;
    }

    const wt = new ClientSessionTransport(wtUrl, handlerMap);
    wt.connect();
    setWebTransport(wt);

    return () => {
      wt.close();
    };
  }, []);
  
  return webTransport;
}

export { useWebTransport };