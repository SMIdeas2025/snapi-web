import { createSlice } from "@reduxjs/toolkit";
import { chatHistoryState } from "../../state";

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

export const {
  startGetChatHistory,
  successGetChatHistory,
  errorGetChatHistory,
} = chatHistorySlice.actions;
export const getChatHistoryReducer = chatHistorySlice.reducer;
