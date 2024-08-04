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
    <div className="flex w-1/4 bg-white p-4 border-r border-gray-500">
      <div className="flex flex-col w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Deployments</h2>
        <button
          className="mt-4 w-full mb-2 py-2 bg-green-400 text-white rounded-full hover:bg-green-600 transition duration-300"
          onClick={() =>
            handleAddingDeployment({ projectId, dispatch, setDeploymentId })
          }
        >
          Create Deployment
        </button>
        <ul className="flex-1 space-y-2">
          {deployments.map((deployment, i) => (
            <li
              key={deployment.id}
              className={`px-4 py-3 cursor-pointer rounded-md transition duration-300 ${
                selectedDeploymentId === deployment.id
                  ? "bg-black text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => dispatch(setDeploymentId(deployment.id))}
            >
              Deployment {i + 1}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DeploymentList;
