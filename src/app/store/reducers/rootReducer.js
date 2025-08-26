import { combineReducers } from "redux";
import { loginAuthReducer, signupAuthReducer } from "../slices/Auth/index";
import { profilePreferanceUpdateReducer } from "../slices/Profile/index";
import { getRecommendationReducer } from "../slices/Product/index";
import { getChatHistoryReducer } from "../slices/Chat/index";

const rootReducer = combineReducers({
  SIGNUP: signupAuthReducer,
  UPDATE_PREFERANCE: profilePreferanceUpdateReducer,
  GET_RECOMMENDATION: getRecommendationReducer,
  LOGIN: loginAuthReducer,
  CHAT_HISTORY: getChatHistoryReducer,
  //   user: userReducer,
});

export default rootReducer;
