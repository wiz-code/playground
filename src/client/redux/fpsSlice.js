import { createSlice } from '@reduxjs/toolkit';

const fpsSlice = createSlice({
  name: 'fps',

  initialState: {
    score: 0,
    visibleElapsedTime: true,
  },
  reducers: {
    setScore: (state, action) => {
      state.score = action.payload;
    },
    setVisibleElapsedTime: (state, action) => {
      state.visibleElapsedTime = action.payload;
    },
  },
});

export default fpsSlice;
