import { createSlice } from "@reduxjs/toolkit";
import { userRecommendationState } from "../../state";

const userRecommendationSlice = createSlice({
  name: "UPDATE_PROFILE_PREFERANCE_SLICE",
  initialState: userRecommendationState,
  reducers: {
    startGetRecommendation: (state) => {
      state.preferanceLoading = true;
      state.prederanceError = null;
    },
    successGetRecommendation: (state, action) => {
      state.preferanceLoading = false;
      state.preferanceData = action.payload;
    },
    errorGetRecommendation: (state, action) => {
      state.preferanceLoading = false;
      state.prederanceError = action.payload;
    },
  },
});

export const {
  startGetRecommendation,
  successGetRecommendation,
  errorGetRecommendation,
} = userRecommendationSlice.actions;
export const getRecommendationReducer = userRecommendationSlice.reducer;
