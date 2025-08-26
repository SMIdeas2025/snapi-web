import { createSlice } from "@reduxjs/toolkit";
import { userRecommendationState } from "../../state";

const userRecommendationSlice = createSlice({
  name: "UPDATE_PROFILE_PREFERANCE_SLICE",
  initialState: userRecommendationState,
  reducers: {
    startGetRecommendation: (state) => {
      state.recommendationLoading = true;
      state.recommendationError = null;
    },
    successGetRecommendation: (state, action) => {
      state.recommendationLoading = false;
      state.recommendationData = action.payload;
    },
    errorGetRecommendation: (state, action) => {
      state.recommendationLoading = false;
      state.recommendationError = action.payload;
    },
  },
});

export const {
  startGetRecommendation,
  successGetRecommendation,
  errorGetRecommendation,
} = userRecommendationSlice.actions;
export const getRecommendationReducer = userRecommendationSlice.reducer;
