import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
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
});

// Wrap rootReducer with persistReducer
export default persistReducer(persistConfig, rootReducer);