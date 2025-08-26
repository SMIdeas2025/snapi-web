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
    console.log("res?", res);

    dispatch(successGetRecommendation(res));
  } catch (error) {
    dispatch(
      errorGetRecommendation(error.response?.data?.message || error.message)
    );
  }
};

export { getRecommendationProduct };
