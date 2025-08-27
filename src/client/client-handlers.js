import ClientSessionTransport from '@lib/session-transport';

const { EventCodes } = ClientSessionTransport;

const clientHandlers = [
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
    EventCodes.DestBidiRecvStream, function (stream, value) {
      const rview = new DataView(value.buffer);
      const receivedTime = rview.getFloat32(0);
      console.log(receivedTime)

      try {
        this.sendDestBidiStream(stream, value);
      } catch (e) {
        console.error('Error reading Heartbeat stream', e);
      }
    },
  ],
];

export default clientHandlers;