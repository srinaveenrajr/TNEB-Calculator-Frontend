import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/client";
import { normalizeSlabRow } from "../utils/billHelpers";
import { sortSlabsForDisplay } from "../utils/sortSlabs";

export const fetchUserSlabs = createAsyncThunk(
  "slabs/fetchUserSlabs",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/tables/user/${userId}`);
      const sorted = sortSlabsForDisplay(data);
      return sorted.map(normalizeSlabRow);
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || e.message || "Failed");
    }
  },
);

export const initUserSlabs = createAsyncThunk(
  "slabs/initUserSlabs",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/tables/user/init");
      return await dispatch(fetchUserSlabs(userId)).unwrap();
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.error || e.message || "Init failed",
      );
    }
  },
);

export const saveUserSlabs = createAsyncThunk(
  "slabs/saveUserSlabs",
  async ({ userId, tables }, { dispatch, rejectWithValue }) => {
    try {
      const payload = {
        tables: (tables || []).map((r) => ({
          from: r.from,
          to: r.to,
          rate: r.rate,
          maxUnits: r.maxUnits,
        })),
      };
      await api.post("/tables/save", payload);
      return await dispatch(fetchUserSlabs(userId)).unwrap();
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.error || e.message || "Save failed",
      );
    }
  },
);

export const deleteUserSlabRow = createAsyncThunk(
  "slabs/deleteUserSlabRow",
  async ({ userId, id }, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/tables/${id}`);
      return await dispatch(fetchUserSlabs(userId)).unwrap();
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.error || e.message || "Delete failed",
      );
    }
  },
);

const slabsSlice = createSlice({
  name: "slabs",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSlabs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSlabs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchUserSlabs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(initUserSlabs.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(saveUserSlabs.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteUserSlabRow.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default slabsSlice.reducer;
