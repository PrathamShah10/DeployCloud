"use client";
import { combineReducers } from "@reduxjs/toolkit";
import deploymentReducer from "./deployment";

const rootReducer = combineReducers({
  deployment: deploymentReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
