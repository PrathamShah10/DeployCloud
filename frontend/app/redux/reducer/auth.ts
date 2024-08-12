
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

 interface AuthState {
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeAuthStatus: (state, action: PayloadAction<boolean>) => {
      console.log('hua kya bhai', action.payload)
      state.isAuthenticated = action.payload;
    },
  },
});

export const { changeAuthStatus } = authSlice.actions;
export const authReducer = authSlice.reducer;
