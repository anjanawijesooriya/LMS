import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import classReducer from "../features/classes/classSlice";
import paymentReducer from "../features/payments/paymentSlice";
import featuredCoursesReducer from "../features/featuredCourses/courseSlice";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage

// Persist Configuration
const persistConfig = {
  key: "root",
  storage,
  // whitelist: ["auth", "user"], // Only persist these reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  classes: classReducer,
  payments: paymentReducer,
  featuredCourses: featuredCoursesReducer,
});

// Wrap rootReducer with persistReducer
export default persistReducer(persistConfig, rootReducer);
