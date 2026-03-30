import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import slabsReducer from "./slabsSlice";
import billingReducer from "./billingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    slabs: slabsReducer,
    billing: billingReducer,
  },
});

