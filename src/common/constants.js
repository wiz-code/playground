import { Meta } from '../common.json';
export { Meta };

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

export const Games = [
  [
    'worker-fps',
    {
      name: 'WebWorker 一人称視点アクションゲーム',
      type: 'fps',

      keywords: 'WebWorkerテンプレート,FPS,ゲーム,テスト中',
      description: 'WebWorkerテンプレート、ブラウザで遊べるゲーム',

      heroes: [
        {
          id: 'hiroi-kun',
          name: 'ヒロイくん',
          image: 'hiroi-kun.jpg',
          description: '剣技が強い男勇者',
        },
        {
          id: 'himei-san',
          name: 'ヒメイさん',
          image: 'himei-san.jpg',
          description: '魔法が強い女勇者',
        },
      ],
      levels: [
        {
          id: 'stage-1',
          name: '最初のステージ',
          description: '基本的な操作を覚えるのに適した簡単なステージ',
        },
      ],
      transition: 'pattern-1',
    },
  ],
];

export const Paths = [
  [
    'Assets',
    [
      ['images', '/assets/images'],
      ['sounds', '/assets/sounds'],
    ],
  ],
  [
    'Sounds',
    [
      { name: 'shot', type: 'sfx', file: 'shot.mp3' },
      { name: 'damage', type: 'sfx', file: 'damage-1.mp3' },
      { name: 'jump', type: 'sfx', file: 'cursor-move-3.mp3' },
      { name: 'get-item', type: 'sfx', file: 'decision-11.mp3' },
      { name: 'dash', type: 'sfx', file: 'evasion.mp3' },
      { name: 'girl-voice-1', type: 'sfx', file: 'sugoi.mp3' },
      { name: 'goal', type: 'sfx', file: 'kirakira-1.mp3' },
      { name: 'fast-move', type: 'sfx', file: 'fast-move.mp3' },
      { name: 'first-stage', type: 'bgm', file: 'Morning.mp3' },
    ],
  ],
];

export const LastPathSegments = ['index.html'];