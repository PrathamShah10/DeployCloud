"use client";
import { combineReducers } from "@reduxjs/toolkit";
import {deploymentReducer} from "./deployment";
import {authReducer} from "./auth";

const rootReducer = combineReducers({
  deployment: deploymentReducer,
  auth: authReducer,
});
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
