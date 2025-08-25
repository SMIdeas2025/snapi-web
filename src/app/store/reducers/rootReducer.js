import { combineReducers } from "redux";
import { loginAuthReducer, signupAuthReducer } from "../slices/Auth/index";
import { profilePreferanceUpdateReducer } from "../slices/Profile/index";
import { getRecommendationReducer } from "../slices/Product/index";
const rootReducer = combineReducers({
  SIGNUP: signupAuthReducer,
  UPDATE_PREFERANCE: profilePreferanceUpdateReducer,
  GET_RECOMMENDATION: getRecommendationReducer,
  LOGIN: loginAuthReducer,
  //   user: userReducer,
});

export default rootReducer;
