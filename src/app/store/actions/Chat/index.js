import api from "../../../lib/axios";
import {
  errorGetChatHistory,
  startGetChatHistory,
  successGetChatHistory,
} from "../../slices/Chat";

const getChatHistory = () => async (dispatch) => {
  dispatch(startGetChatHistory());
  let userid = localStorage.getItem("userId");
  try {
    const res = await api.get(`chat/api/shopping/getChatHistory/${userid}`);
    console.log("res?", res);

    dispatch(successGetChatHistory(res));
  } catch (error) {
    dispatch(
      errorGetChatHistory(error.response?.data?.message || error.message)
    );
  }
};

export { getChatHistory };
