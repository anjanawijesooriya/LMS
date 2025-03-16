import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    featuredCourses: [],
    loading: false,
    error: null,
}

const courseSlice = createSlice({
    name: "featuredCourses",
    initialState,
    reducers: {
        fetchFeaturedCoursesStart: (state) => {
            state.loading = true;
        },
        fetchFeaturedCoursesSuccess: (state, action) => {
            state.loading = false;
            state.featuredCourses = action.payload;
        },
        fetchFeaturedCoursesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
})

export const { fetchFeaturedCoursesStart, fetchFeaturedCoursesSuccess, fetchFeaturedCoursesFailure } = courseSlice.actions;
export default courseSlice.reducer;