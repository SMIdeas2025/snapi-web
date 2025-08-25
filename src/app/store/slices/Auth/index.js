import { createSlice } from "@reduxjs/toolkit";
import { signupAuthState, loginAuthState } from "../../state";

const signupAuthSlice = createSlice({
  name: "SIGNUP_AUTH_SLICE",
  initialState: signupAuthState,
  reducers: {
    startSignup: (state) => {
      state.signupLoading = true;
      state.signupError = null;
    },
    successSignup: (state, action) => {
      state.signupLoading = false;
      state.signupData = action.payload;
    },
    errorSignup: (state, action) => {
      state.signupLoading = false;
      state.signupError = action.payload;
    },
  },
});

const loginAuthSlice = createSlice({
  name: "LOGIN_AUTH_SLICE",
  initialState: loginAuthState,
  reducers: {
    startLogin: (state) => {
      state.userLoading = true;
      state.userError = null;
    },
    successLogin: (state, action) => {
      state.userLoading = false;
      state.userData = action.payload;
    },
    errorLogin: (state, action) => {
      state.userLoading = false;
      state.userError = action.payload;
    },
  },
});

export const { startSignup, successSignup, errorSignup } =
  signupAuthSlice.actions;
export const { startLogin, successLogin, errorLogin } = loginAuthSlice.actions;
export const signupAuthReducer = signupAuthSlice.reducer;
export const loginAuthReducer = loginAuthSlice.reducer;
