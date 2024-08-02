import React from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { addDeployment, setDeploymentId } from "../redux/reducer/deployment";

interface DeploymentListProps {
  projectId: string;
}
interface IhandleAddingDeploymentProps {
  dispatch: any;
  setDeploymentId: any;
  projectId: string;
}
const handleAddingDeployment = async ({
  projectId,
  dispatch,
  setDeploymentId,
}: IhandleAddingDeploymentProps) => {
  try {
    const response = await fetch(`http://localhost:9000/deploy`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        projectId,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      dispatch(
        addDeployment({ id: data.data.deploymentId, status: data.status })
      );
      dispatch(setDeploymentId(data.data.deploymentId));
    } else {
      console.error("Error fetching deployments");
    }
  } catch (error) {
    console.log(error);
  }
};
const DeploymentList: React.FC<DeploymentListProps> = ({ projectId }) => {
  const { deployments, selectedDeploymentId } = useAppSelector(
    (state) => state.deployment
  );
  const dispatch = useAppDispatch();
  return (
    <div className="flex w-1/4 bg-gray-100 p-4 border-r border-gray-300">
      <div>
        <h2 className="text-xl font-semibold mb-4">Deployments</h2>
        <ul>
          {deployments.map((deployment, i) => (
            <li
              key={deployment.id}
              className={`p-2 cursor-pointer rounded-md mb-2 ${
                selectedDeploymentId === deployment.id
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
              onClick={() => dispatch(setDeploymentId(deployment.id))}
            >
              deployment {i + 1}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <button
          className="ml-4 px-4 py-2 bg-green-400 rounded-lg"
          onClick={() =>
            handleAddingDeployment({ projectId, dispatch, setDeploymentId })
          }
        >
          Create Deployment
        </button>
      </div>
    </div>
  );
};

export default DeploymentList;
