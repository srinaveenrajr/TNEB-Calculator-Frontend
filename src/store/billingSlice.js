import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { computeSlabBill } from "../utils/billHelpers";

export const computeBillPreview = createAsyncThunk(
  "billing/computeBillPreview",
  async ({ units }, { getState }) => {
    const slabs = getState().slabs.items;
    const u = Number(units);
    if (!Number.isFinite(u) || u <= 0) {
      return {
        unitsConsumed: 0,
        totalBill: 0,
        category: null,
        breakdown: [],
      };
    }
    const { totalBill, category, breakdown } = computeSlabBill(u, slabs);
    return {
      unitsConsumed: u,
      totalBill,
      category,
      breakdown,
    };
  },
);

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    unitsConsumed: 0,
    totalBill: 0,
    category: null,
    breakdown: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(computeBillPreview.fulfilled, (state, action) => {
      state.unitsConsumed = action.payload.unitsConsumed;
      state.totalBill = action.payload.totalBill;
      state.category = action.payload.category;
      state.breakdown = action.payload.breakdown;
    });
  },
});

export default billingSlice.reducer;

