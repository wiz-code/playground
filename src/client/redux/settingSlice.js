import { createSlice } from '@reduxjs/toolkit';

import Common from '../../common.json';
import { HighFramerateCoef } from '../../common/constants';
import { Sound } from '../game/settings';

const { Games } = Common;
const games = new Map(Games);
const [gameName] = Array.from(games.keys());

const settingSlice = createSlice({
  name: 'setting',

  initialState: {
    isFullscreen: false,
    framerateCoef: HighFramerateCoef,
    visibleStats: true,

    mute: false,
    volume: Sound.volume,
  },
  reducers: {
    setIsFullscreen: (state, action) => {
      state.isFullscreen = action.payload;
    },
    setFramerateCoef: (state, action) => {
      state.framerateCoef = action.payload;
    },
    setVisibleStats: (state, action) => {
      state.visibleStats = action.payload;
    },
    setMute: (state, action) => {
      state.mute = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
  },
});

export default settingSlice;
