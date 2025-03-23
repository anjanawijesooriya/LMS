import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  editProfileStart,
  editProfileSuccess,
  editProfileFailure,
  deleteProfileStart,
  deleteProfileSuccess,
  deleteProfileFailure,
  logout,
} from "./authSlice";
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
    return { success: true };
  } catch (error) {
    let errorMessage =
      error?.response?.data?.error ||
      (error?.status === 401
        ? "Invalid credentials. Please try again."
        : error?.status === 404
        ? "User does not exist. Please register first."
        : "Something went wrong. Please try again.");

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
    dispatch(loginFailure(errorMessage));
    setTimeout(() => {
      dispatch(loginFailure(null));
    }, 3000);
    return { success: false, message: errorMessage };
  }
};

export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(registerStart());

    const { data } = await axios.post("/api/auth/register", userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch(registerSuccess(data));
    return { success: true };
  } catch (error) {
    let errorMessage =
      error?.response?.data?.error ||
      (error?.status === 401
        ? "Invalid Email. Please try again."
        : error?.status === 400
        ? "Email already exists"
        : "Something went wrong. Please try again.");

    if (error.response) {
      console.error(error.response.data);
    } else if (error.request) {
      console.error("No response from server:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    dispatch(registerFailure(errorMessage));
    setTimeout(() => {
      dispatch(registerFailure(null));
    }, 3000);
    return { success: false, message: errorMessage };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    dispatch(logout());
  } catch (error) {
    console.error("Error:", error.message);
  }
};

export const editUser = (userData) => async (dispatch) => {
  try {
    dispatch(editProfileStart());
    const id = userData.id;
    const { data } = await axios.put(`/api/auth/update/${id}`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch(editProfileSuccess(data));
    return { success: true };
  } catch (error) {
    let errorMessage =
      error?.response?.data?.error ||
      (error?.status === 401
        ? "Invalid Email. Please try again."
        : error?.status === 400
        ? "Email already exists"
        : "Something went wrong. Please try again.");

    if (error.response) {
      console.error(error.response.data);
    } else if (error.request) {
      console.error("No response from server:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    dispatch(editProfileFailure(errorMessage));
    setTimeout(() => {
      dispatch(editProfileFailure(null));
    }, 3000);
    return { success: false, message: errorMessage };
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  try {
    dispatch(deleteProfileStart());
    await axios.delete(`/api/auth/delete/${userId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    dispatch(deleteProfileSuccess());
    return { success: true };
  } catch (error) {
    let errorMessage =
      error?.response?.data?.error ||
      (error?.status === 404
        ? "User not found."
        : "Something went wrong. Please try again.");

    if (error.response) {
      console.error(error.response.data);
    } else if (error.request) {
      console.error("No response from server:", error.request);
    } else {
      console.error("Error:", error.message);
    }

    dispatch(deleteProfileFailure(errorMessage));
    setTimeout(() => {
      dispatch(deleteProfileFailure(null));
    }, 3000);

    return { success: false, message: errorMessage };
  }
};
