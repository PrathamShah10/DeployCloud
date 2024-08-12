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
      // return { ...state, deployments: action.payload }; // Return a new state object
      state.deployments = action.payload;
    },
    addDeployment: (state, action: PayloadAction<Deployment>) => {
      // return {
      //   ...state,
      //   deployments: [...state.deployments, action.payload],
      // };
      state.deployments.push(action.payload);
    },
    setDeploymentId: (state, action: PayloadAction<string>) => {
      // return {
      //   ...state,
      //   selectedDeploymentId: action.payload,
      // };
      state.selectedDeploymentId = action.payload;
    },
  },
});

export const { setDeployments, addDeployment, setDeploymentId } =
  deploymentSlice.actions;
export const deploymentReducer = deploymentSlice.reducer;
