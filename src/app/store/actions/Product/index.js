import api from "../../../lib/axios";
import {
  errorGetRecommendation,
  startGetRecommendation,
  successGetRecommendation,
} from "../../slices/Product";

const getRecommendationProduct = () => async (dispatch) => {
  dispatch(startGetRecommendation());
  let userid = localStorage.getItem("userId");
  try {
    const res = await api.get(
      `chat/api/shopping/getUserRecommendations/${userid}`
    );

    dispatch(successGetRecommendation(res?.data));
  } catch (error) {
    dispatch(
      errorGetRecommendation(error.response?.data?.message || error.message)
    );
  }
};

export { getRecommendationProduct };
