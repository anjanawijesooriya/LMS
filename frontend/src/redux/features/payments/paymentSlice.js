import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    payments: [],
    loading: false,
    error: null,
    available: false,
}

const paymentSlice = createSlice({
    name: "payments",
    initialState,
    reducers: {
        fetchPaymentsStart: (state) => {
            state.loading = true;
        },
        fetchPaymentsSuccess: (state, action) => {
            state.loading = false;
            state.payments = action.payload;
            state.available = action.payload.length > 0;
        },
        fetchPaymentsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.available = false;
        }
    },
})

export const { fetchPaymentsStart, fetchPaymentsSuccess, fetchPaymentsFailure } = paymentSlice.actions;
export default paymentSlice.reducer;