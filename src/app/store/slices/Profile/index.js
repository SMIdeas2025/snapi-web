import { createSlice } from "@reduxjs/toolkit";
import { updatePreferanceState } from "../../state";

const profilePreferanceSlice = createSlice({
  name: "UPDATE_PROFILE_PREFERANCE_SLICE",
  initialState: updatePreferanceState,
  reducers: {
    startUpdatePreferance: (state) => {
      state.preferanceLoading = true;
      state.prederanceError = null;
    },
    successUpdatePreferance: (state, action) => {
      state.preferanceLoading = false;
      state.preferanceData = action.payload;
    },
    errorUpdatePrefernace: (state, action) => {
      state.preferanceLoading = false;
      state.prederanceError = action.payload;
    },
  },
});

export const {
  startUpdatePreferance,
  successUpdatePreferance,
  errorUpdatePrefernace,
} = profilePreferanceSlice.actions;
export const profilePreferanceUpdateReducer = profilePreferanceSlice.reducer;
