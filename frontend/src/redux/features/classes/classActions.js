import {
  fetchClassesStart,
  fetchClassesSuccess,
  fetchClassesFailure,
} from "./classSlice";
import axiosInstance from "../../../utils/axiosInstance";
const axios = axiosInstance;

export const fetchClasses = () => async (dispatch) => {
  try {
    dispatch(fetchClassesStart());
    const response = await axios.get("/classes/");

    if (response.data && response.data.data) {
      dispatch(fetchClassesSuccess(response.data.data));
    } else {
      dispatch(fetchClassesFailure("No classes available"));
    }
  } catch (error) {
    let errorMessage = "Error fetching classes";

    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
      console.error("Server Error:", error.response.data);
    } else if (error.request) {
      errorMessage = "No response from server";
      console.error(errorMessage, error.request);
    } else {
      console.error("Error:", error.message);
    }

    dispatch(fetchClassesFailure(errorMessage));
  }
};
