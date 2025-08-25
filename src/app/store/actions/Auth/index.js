import api from "../../../lib/axios";
import {
  errorLogin,
  errorSignup,
  startLogin,
  startSignup,
  successLogin,
  successSignup,
} from "../../slices/Auth";

const signupAuth = (payload, router) => async (dispatch) => {
  dispatch(startSignup());
  try {
    const res = await api.post("auth/api/auth/signup", payload);
    console.log("data=====>", res?.data);
    dispatch(successSignup(res?.data));
    localStorage.setItem("userId", res?.data?.userid);
    localStorage.setItem("token", res?.data?.token);
    router.push("/dashboard");
  } catch (error) {
    dispatch(errorSignup(error.response?.data?.message || error.message));
  }
};

const loginAuth = (payload) => async (dispatch) => {
  dispatch(startLogin());
  try {
    const res = await api.post("auth/api/auth/login", payload);
    console.log("data=====>", res?.data);
    dispatch(successLogin(res?.data));
    localStorage.setItem("userId", res?.data?.userid);
    localStorage.setItem("token", res?.data?.token);
  } catch (error) {
    dispatch(errorLogin(error.response?.data?.message || error.message));
  }
};

export { signupAuth, loginAuth };
