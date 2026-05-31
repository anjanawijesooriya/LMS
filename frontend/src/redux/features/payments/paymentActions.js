import {
  fetchPaymentsStart,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
  paymentsAddingStart,
  paymentsAddingSuccess,
  paymentsAddingFailure,
} from "./paymentSlice";
import axios from "axios";

export const fetchPayments = () => async (dispatch) => {
  dispatch(fetchPaymentsStart());
  try {
    const response = await axios.get("/payments/");
    console.log(response.data);
    if (response.data) {
      dispatch(fetchPaymentsSuccess(response.data));
    } else {
      dispatch(fetchPaymentsFailure("No payments available"));
    }
  } catch (error) {
    let errorMessage = "Error fethcing payments";
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
      console.error("Server Error:", error.response.data);
    } else if (error.request) {
      errorMessage = "No response from server";
      console.error(errorMessage, error.request);
    } else {
      console.error("Error:", error.message);
    }
    dispatch(fetchPaymentsFailure(errorMessage));
  }
};

export const addPayment = (paymentData) => async (dispatch) => {
  dispatch(paymentsAddingStart());
  try {
    const response = await axios.post("/payments/add", paymentData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.data) {
      dispatch(paymentsAddingSuccess(response.data));
      return { success: true };
    } else {
      dispatch(paymentsAddingFailure("Failed to add payment"));
    }
  } catch (error) {
    let errorMessage = "Error adding payment";
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
      console.error("Server Error:", error.response.data);
    } else if (error.request) {
      errorMessage = "No response from server";
      console.error(errorMessage, error.request);
    } else {
      console.error("Error:", error.message);
    }
    dispatch(paymentsAddingFailure(errorMessage));
    return { success: false, message: errorMessage };
  }
};
