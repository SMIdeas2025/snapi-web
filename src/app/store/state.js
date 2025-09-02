const signupAuthState = {
  signupData: null,
  signupLoading: false,
  signupError: null,
};

const loginAuthState = {
  userData: null,
  userLoading: false,
  userError: false,
};

const updatePreferanceState = {
  preferanceData: null,
  preferanceLoading: false,
  prederanceError: null,
};

const userRecommendationState = {
  recommendationData: [],
  recommendationLoading: false,
  recommendationError: null,
};

const chatHistoryState = {
  history: [],
  historyLoading: false,
  historyError: null,
};

const userQueryState = {
  responseData: null,
  queryLoading: false,
  queryError: null,
};

const sessionDetailState = {
  sessionDetail: [],
  loadingSessionDetail: false,
  errorSessionDetail: null,
};

export {
  signupAuthState,
  updatePreferanceState,
  userRecommendationState,
  loginAuthState,
  chatHistoryState,
  userQueryState,
  sessionDetailState,
};
