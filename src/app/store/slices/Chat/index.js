import { createSlice } from "@reduxjs/toolkit";
import { chatHistoryState, userQueryState } from "../../state";

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

export const {
  startGetChatHistory,
  successGetChatHistory,
  errorGetChatHistory,
} = chatHistorySlice.actions;

export const { startGetUserQuery, successGetUserQuery, errrorGetUserQuery } =
  chatQuerySlice.actions;

export const getChatHistoryReducer = chatHistorySlice.reducer;
export const getUserChatQueryReducer = chatQuerySlice.reducer;
