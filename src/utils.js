import Common from './common.json';
import TupleKeyMap from './game/tuple-key-map';

const { Games, Transitions } = Common;

const gameMap = new Map(Games);
const transitMap = new Map(Transitions);

export const getNextScene = (gameId, currentScene, event) => {
  const { transition } = gameMap.get(gameId);
  const TupleKeys = transitMap.get(transition);
  const transits = new TupleKeyMap(TupleKeys);

  return transits.getValue(currentScene, event);
};

export const isRootPath = (pathname) => pathname === '/';
