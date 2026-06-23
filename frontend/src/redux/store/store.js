import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import loggerMiddleware from "../middlewares/loggerMiddleware";
import { persistStore } from "redux-persist";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }).concat(loggerMiddleware),
});

// Persistor (to be used in index.js)
export const persistor = persistStore(store);

export default store;
