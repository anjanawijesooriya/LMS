import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  payments: [],
  loading: false,
  error: null,
  available: false,
  newPayment: null,
};

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
    },
    paymentsAddingStart: (state) => {
      state.loading = true;
    },
    paymentsAddingSuccess: (state, action) => {
      state.loading = false;
      if (action.payload.message) {
        // Extract actual payment data (excluding message)
        const { message, ...newPayment } = action.payload;
        state.payments.push(newPayment);
      } else {
        state.payments.push(action.payload);
      }
    },
    paymentsAddingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchPaymentsStart,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
  paymentsAddingStart,
  paymentsAddingSuccess,
  paymentsAddingFailure,
} = paymentSlice.actions;
export default paymentSlice.reducer;
