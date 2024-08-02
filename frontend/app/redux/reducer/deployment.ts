"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Deployment {
  id: string;
  status: string;
}

interface DeploymentState {
  deployments: Deployment[];
  selectedDeploymentId: string | undefined;
}

const initialState: DeploymentState = {
  deployments: [],
  selectedDeploymentId: undefined,
};

const deploymentSlice = createSlice({
  name: "deployment",
  initialState,
  reducers: {
    setDeployments: (state, action: PayloadAction<Deployment[]>) => {
      state.deployments = action.payload;
    },
    addDeployment: (state, action: PayloadAction<Deployment>) => {
      state.deployments.push(action.payload);
    },
    setDeploymentId: (state, action: PayloadAction<string>) => {
      state.selectedDeploymentId = action.payload;
    },
  },
});

export const { setDeployments, addDeployment, setDeploymentId } = deploymentSlice.actions;
export default deploymentSlice.reducer;
