import axios from "../api/axios";

/* ---------------- LOGIN ---------------- */
export const loginUser = async (data) => {
  try {
    const response = await axios.post("/auth/login", data);
    return response.data; // { message, token }
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

/* ---------------- SIGNUP ---------------- */
export const signupUser = async (data) => {
  try {
    const response = await axios.post("/auth/signup", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Signup failed");
  }
};

/* ---------------- GET CURRENT USER ---------------- */
export const getCurrentUser = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { userId, iat, exp }
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
};

/* ---------------- LOGOUT ---------------- */
export const logout = () => {
  localStorage.removeItem("token");
};
