import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    classes: [],
    loading: false,
    error: null,
    available: false,
}

const classSlice = createSlice({
    name: "classes",
    initialState,
    reducers: {
        fetchClassesStart: (state) => {
            state.loading = true;
        },
        fetchClassesSuccess: (state, action) => {
            state.loading = false;
            state.classes = action.payload;
            state.available =action.payload.length > 0;
        },
        fetchClassesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.available = false;
        }
    }
})

export const { fetchClassesStart, fetchClassesSuccess, fetchClassesFailure } = classSlice.actions;
export default classSlice.reducer;