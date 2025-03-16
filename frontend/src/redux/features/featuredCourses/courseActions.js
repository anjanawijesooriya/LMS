import axios from "axios";
import {
  fetchFeaturedCoursesStart,
  fetchFeaturedCoursesSuccess,
  fetchFeaturedCoursesFailure,
  fetchFeaturedCourseStart,
  fetchFeaturedCourseSuccess,
  fetchFeaturedCourseFailure,
} from "./courseSlice";

export const fetchFeaturedCourses = () => async (dispatch) => {
  dispatch(fetchFeaturedCoursesStart());
  try {
    const response = await axios.get("/courses/");
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
