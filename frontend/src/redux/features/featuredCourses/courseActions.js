import {
  fetchFeaturedCoursesStart,
  fetchFeaturedCoursesSuccess,
  fetchFeaturedCoursesFailure,
  fetchFeaturedCourseStart,
  fetchFeaturedCourseSuccess,
  fetchFeaturedCourseFailure,
} from "./courseSlice";
import axiosInstance from "../../../utils/axiosInstance";
const axios = axiosInstance;

export const fetchFeaturedCourses = () => async (dispatch) => {
  dispatch(fetchFeaturedCoursesStart());
  try {
    const response = await axios.get("/courses/");
    console.log(response.data);
    dispatch(fetchFeaturedCoursesSuccess(response.data));
  } catch (error) {
    dispatch(fetchFeaturedCoursesFailure(error.message));
  }
};

export const getFeaturedCourse = (id) => async (dispatch) => {
  dispatch(fetchFeaturedCourseStart());
  try {
    const response = await axios.get(`/courses/${id}`);
    dispatch(fetchFeaturedCourseSuccess(response.data));
  } catch (error) {
    dispatch(fetchFeaturedCourseFailure(error.message));
  }
};
