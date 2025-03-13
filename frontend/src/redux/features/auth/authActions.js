import { loginStart, loginSuccess, loginFailure, logout } from "./authSlice";
import axios from "axios";

// The loginUser action to make the real API call
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());

    // Making the actual API call using axios
    const { data } = await axios.post("/api/auth/login", credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Dispatching the loginSuccess action with the response data
    dispatch(loginSuccess(data));

    // Saving user data and token in localStorage
    // localStorage.setItem("authToken", data.token);
    // localStorage.setItem("firstname", data.user.firstName);
    // localStorage.setItem("lastname", data.user.lastName);
    // localStorage.setItem("email", data.user.email);
    // localStorage.setItem("role", data.user.role);
    // localStorage.setItem("id", data.user.id);

    // if (data.user.role === "student") {
    //   localStorage.setItem("status", data.user.membership?.status);
    //   localStorage.setItem("studentID", data.user.studentId);
    //   localStorage.setItem("grade", data.user.grade);
    //   localStorage.setItem("telephone", data.user.telephoneNumber);
    // }
  } catch (error) {
    dispatch(loginFailure("Login failed"));

    // Optionally handle more error details here
    if (error.response) {
      // Handle known error responses (e.g., status codes)
      console.error(error.response.data);
    } else if (error.request) {
      // Handle request errors (e.g., no response from the server)
      console.error("No response from server:", error.request);
    } else {
      // General error
      console.error("Error:", error.message);
    }
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    dispatch(logout());
  } catch (error) {
    console.error("Error:", error.message);
  }
}
