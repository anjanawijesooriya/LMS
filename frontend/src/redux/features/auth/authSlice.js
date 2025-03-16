import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // Import storage

const initialState = {
  user: null,
  token: localStorage.getItem("authToken") || null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("authToken", action.payload.token);
      localStorage.setItem("loginTime", new Date().getTime()); // Save login time
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Registration actions
    registerStart: (state) => {
      state.loading = true;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("authToken", action.payload.token);
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.setItem("authToken", null);
      localStorage.removeItem("loginTime");
      storage.removeItem("persist:root"); // Clear persisted Redux state
    },
    editProfileStart: (state) => {
      state.loading = true;
    },
    editProfileSuccess: (state, action) => {
      state.loading = false;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else {
        state.user = action.payload; // In case the user was null before
      }
    },
    editProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  editProfileStart,
  editProfileSuccess,
  editProfileFailure,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
