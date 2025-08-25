import api from "../../../lib/axios";
import {
  errorUpdatePrefernace,
  startUpdatePreferance,
  successUpdatePreferance,
} from "../../slices/Profile";

const updatePreferance = (payload) => async (dispatch) => {
  dispatch(startUpdatePreferance());
  try {
    const res = await api.post("user/api/user/setPreferences", payload);

    dispatch(successUpdatePreferance(res?.data));
    localStorage.setItem("userId", res?.data?.userid);
    localStorage.setItem("token", res?.data?.token);
  } catch (error) {
    dispatch(
      errorUpdatePrefernace(error.response?.data?.message || error.message)
    );
  }
};

export { updatePreferance };
