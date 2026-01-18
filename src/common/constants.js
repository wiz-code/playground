export const EventCodes = {
  TransportClose: 0,

  SendDatagrams: 10,
  RecvDatagrams: 11,
  UnidiSendStream: 12,
  UnidiRecvStream: 13,
  SrcBidiSendStream: 14,
  SrcBidiRecvStream: 15,
  DestBidiSendStream: 16,
  DestBidiRecvStream: 17,
};

export const StreamNameMap = new Map([
  ['sendDatagrams', EventCodes.SendDatagrams],
  ['recvDatagrams', EventCodes.RecvDatagrams],
  ['unidiSend', EventCodes.UnidiSendStream],
  ['unidiRecv', EventCodes.UnidiRecvStream],
  ['srcBidiSend', EventCodes.SrcBidiSendStream],
  ['srcBidiRecv', EventCodes.SrcBidiRecvStream],
  ['destBidiSend', EventCodes.DestBidiSendStream],
  ['destBidiRecv', EventCodes.DestBidiRecvStream],
]);

export const StreamTypeMap = new Map([
  [EventCodes.SendDatagrams, 'sending datagram'],
	[EventCodes.RecvDatagrams, 'receiving datagram'],
	[EventCodes.UnidiSendStream, 'sending unidirectional stream'],
	[EventCodes.UnidiRecvStream, 'receiving unidirectional stream'],
	[EventCodes.SrcBidiSendStream, 'sending source bidirectional stream'],
	[EventCodes.SrcBidiRecvStream, 'receiving source bidirectional stream'],
	[EventCodes.DestBidiSendStream, 'sending destination bidirectional stream'],
	[EventCodes.DestBidiRecvStream, 'receiving destination bidirectional stream'],
]);

export const F32ByteLen = 4;
export const PacketHeaderSize = F32ByteLen * 2;
export const MaxDatagramSize = 1024;
export const HeartbeatInterval = 5000;

export const WtPaths = ['/wt/debug'];

export const KeyPressMaxCount = 4;
export const PointerEventSize = 8;
export const ButtonSize = 17;
export const AxisSize = 6;
export const SharedDataSize = 2;
export const SharedDataIndex = {
  frameCount: 0,
  time: 1,
};
export const HighFramerateCoef = 1;
export const LowFramerateCoef = 2;

