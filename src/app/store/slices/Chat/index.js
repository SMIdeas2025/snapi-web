import { createSlice } from "@reduxjs/toolkit";
import {
  chatHistoryState,
  sessionDetailState,
  userQueryState,
} from "../../state";

const chatHistorySlice = createSlice({
  name: "CHAT_HISTORY_SLICE",
  initialState: chatHistoryState,
  reducers: {
    startGetChatHistory: (state) => {
      state.historyLoading = true;
      state.historyError = null;
    },
    successGetChatHistory: (state, action) => {
      state.historyLoading = false;
      state.history = action.payload;
    },
    errorGetChatHistory: (state, action) => {
      state.historyLoading = false;
      state.historyError = action.payload;
    },
  },
});

const chatQuerySlice = createSlice({
  name: "CHAT_QUERY_SLICE",
  initialState: userQueryState,
  reducers: {
    startGetUserQuery: (state) => {
      state.queryLoading = true;
      state.queryError = null;
    },
    successGetUserQuery: (state, action) => {
      state.queryLoading = false;
      state.responseData = action.payload;
    },
    errrorGetUserQuery: (state, action) => {
      state.queryLoading = false;
      state.queryError = action.payload;
    },
  },
});

const sessionDetailSlice = createSlice({
  name: "SESSION_DETAIL_SLICE",
  initialState: sessionDetailState,
  reducers: {
    startGetSessionDetail: (state) => {
      state.loadingSessionDetail = true;
      state.errorSessionDetail = null;
    },
    successGetSessionDetail: (state, action) => {
      state.loadingSessionDetail = false;
      state.sessionDetail = action.payload;
    },
    errroGetSessionDetail: (state, action) => {
      state.loadingSessionDetail = false;
      state.errorSessionDetail = action.payload;
    },
  },
});

export const {
  startGetChatHistory,
  successGetChatHistory,
  errorGetChatHistory,
} = chatHistorySlice.actions;

export const { startGetUserQuery, successGetUserQuery, errrorGetUserQuery } =
  chatQuerySlice.actions;
export const {
  startGetSessionDetail,
  successGetSessionDetail,
  errroGetSessionDetail,
} = sessionDetailSlice.actions;

export const getChatHistoryReducer = chatHistorySlice.reducer;
export const getUserChatQueryReducer = chatQuerySlice.reducer;
export const getSessionDetailReducer = sessionDetailSlice.reducer;
