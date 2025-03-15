import {
  fetchPaymentsStart,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
} from "./paymentSlice";
import axios from "axios";

export const fetchPayments = () => async (dispatch) => {
  dispatch(fetchPaymentsStart());
  try {
    const response = await axios.get("/payments/");
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
