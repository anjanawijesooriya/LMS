import axios from "axios";
import {
  fetchFeaturedCoursesStart,
  fetchFeaturedCoursesSuccess,
  fetchFeaturedCoursesFailure,
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
