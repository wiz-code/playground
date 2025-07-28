import { configureStore } from '@reduxjs/toolkit';

import settingSlice from './settingSlice';
import gameSlice from './gameSlice';
import fpsSlice from './fpsSlice';

const { reducer: settingReducer } = settingSlice;
const { reducer: gameReducer } = gameSlice;
const { reducer: fpsReducer } = fpsSlice;

const store = configureStore({
  reducer: {
    setting: settingReducer,
    game: gameReducer,
    fps: fpsReducer,
  },
});

export default store;
