// store/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isNightMode: false,
  },
  reducers: {
    toggleNightMode: (state) => {
      state.isNightMode = !state.isNightMode;
    },
  },
});

export const { toggleNightMode } = themeSlice.actions;
export default themeSlice.reducer;