import api from "../../../lib/axios";
import {
  errorGetChatHistory,
  errrorGetUserQuery,
  startGetChatHistory,
  startGetUserQuery,
  successGetChatHistory,
  successGetUserQuery,
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

const handleUserQuery = (payload) => async (dispatch) => {
  dispatch(startGetUserQuery());

  try {
    const res = await api.post(`chat/api/shopping/user-query`, payload);
    console.log("res===?", res);

    dispatch(successGetUserQuery(res));
  } catch (error) {
    dispatch(
      errrorGetUserQuery(error.response?.data?.message || error.message)
    );
  }
};

export { getChatHistory, handleUserQuery };
