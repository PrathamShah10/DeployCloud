"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Deployment {
  id: string;
  status: string;
}

interface DeploymentState {
  deployments: Deployment[];
}

const initialState: DeploymentState = {
  deployments: [],
};

const deploymentSlice = createSlice({
  name: "deployment",
  initialState,
  reducers: {
    setDeployments: (state, action: PayloadAction<Deployment[]>) => {
      console.log("here after dispatching");
      state.deployments = action.payload;
    },
    addDeployment: (state, action: PayloadAction<Deployment>) => {
      state.deployments.push(action.payload);
    },
  },
});

export const { setDeployments, addDeployment } = deploymentSlice.actions;
export default deploymentSlice.reducer;
