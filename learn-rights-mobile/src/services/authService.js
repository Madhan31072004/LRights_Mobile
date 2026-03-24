import axios from "../api/axios";

/* ---------------- LOGIN ---------------- */
export const loginUser = async (data) => {
  try {
    const response = await axios.post("/auth/login", data);
    return response.data; // { message, token }
  } catch (error) {
    const resData = error.response?.data;
    let msg = "Login failed";
    if (resData) {
      if (typeof resData.message === "string") msg = resData.message;
      else if (Array.isArray(resData.detail)) msg = resData.detail[0]?.msg || resData.detail[0]?.loc?.join?.(" ") || msg;
      else if (typeof resData.detail === "string") msg = resData.detail;
    }
    throw new Error(msg);
  }
};

/* ---------------- SIGNUP ---------------- */
export const signupUser = async (data) => {
  try {
    const response = await axios.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    const resData = error.response?.data;
    let msg = "Signup failed";
    if (resData) {
      if (typeof resData.message === "string") msg = resData.message;
      else if (Array.isArray(resData.detail)) msg = resData.detail[0]?.msg || resData.detail[0]?.loc?.join?.(" ") || msg;
      else if (typeof resData.detail === "string") msg = resData.detail;
    }
    throw new Error(msg);
  }
};

/* ---------------- GOOGLE LOGIN ---------------- */
export const googleLoginUser = async (accessToken) => {
  try {
    const response = await axios.post("/auth/google", { access_token: accessToken });
    return response.data; // { message, token, user }
  } catch (error) {
    const resData = error.response?.data;
    let msg = "Google login failed";
    if (resData) {
      if (typeof resData.message === "string") msg = resData.message;
      else if (Array.isArray(resData.detail)) msg = resData.detail[0]?.msg || resData.detail[0]?.loc?.join?.(" ") || msg;
      else if (typeof resData.detail === "string") msg = resData.detail;
    }
    throw new Error(msg);
  }
};
