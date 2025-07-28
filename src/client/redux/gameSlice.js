import { createSlice } from '@reduxjs/toolkit';

import Common from '../../common.json';

const { Games } = Common;
const games = new Map(Games);
const [gameId] = Array.from(games.keys());
const game = games.get(gameId);
const [hero = {}] = game.heroes ?? [];
const [level = {}] = game.levels ?? [];

const initialState = {
  crossOriginIsolated: false,
  canUseWaitAsync: false,
  isTouchDevice: false,
  webGPU: false,
  devicePixelRatio: 1,

  scene: 'unstarted',

  gameId,
  heroId: hero.id ?? '',
  levelId: level.id ?? '',

  loading: false,
  elapsedTime: 0,

  settingPage: false,
  mobilePlayDialog: false,
};

const gameSlice = createSlice({
  name: 'game',

  initialState: { ...initialState },
  reducers: {
    resetGameState: (state, action) => {
      const { levelId, loading, elapsedTime, settingPage } = initialState;

      state.levelId = levelId;
      state.loading = loading;
      state.elapsedTime = elapsedTime;
      state.settingPage = settingPage;
    },
    setCrossOriginIsolated: (state, action) => {
      state.crossOriginIsolated = action.payload;
    },
    setCanUseWaitAsync: (state, action) => {
      state.canUseWaitAsync = action.payload;
    },
    setIsTouchDevice: (state, action) => {
      state.isTouchDevice = action.payload;
    },
    setCanUseWebGPU: (state, action) => {
      state.webGPU = action.payload;
    },
    setDevicePixelRatio: (state, action) => {
      state.devicePixelRatio = action.payload;
    },

    setGameId: (state, action) => {
      state.gameId = action.payload;
    },
    setHeroId: (state, action) => {
      state.heroId = action.payload;
    },
    setLevelId: (state, action) => {
      state.levelId = action.payload;
    },
    setScene: (state, action) => {
      state.scene = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setElapsedTime: (state, action) => {
      state.elapsedTime = action.payload;
    },

    setSettingPage: (state, action) => {
      state.settingPage = action.payload;
    },
    setMobilePlayDialog: (state, action) => {
      state.mobilePlayDialog = action.payload;
    },
  },
});

export default gameSlice;
