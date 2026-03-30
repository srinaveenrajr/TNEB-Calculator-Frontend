import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    ready: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setReady(state, action) {
      state.ready = Boolean(action.payload);
    },
    logout(state) {
      state.user = null;
      state.ready = false;
    },
  },
});

export const { setUser, setReady, logout } = authSlice.actions;
export default authSlice.reducer;

