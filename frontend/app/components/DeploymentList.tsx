
import React from "react";

interface Deployment {
  id: string;
}

interface DeploymentListProps {
  deployments: Deployment[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  projectId: string;
}
interface IhandleAddingDeploymentProps {
  onSelect: (id: string) => void;
  projectId: string;
}
const handleAddingDeployment = async ({
  projectId,
  onSelect,
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
      onSelect(data.data.deploymentId);
    } else {
      console.error("Error fetching deployments");
    }
  } catch (error) {
    console.log(error);
  }
};
const DeploymentList: React.FC<DeploymentListProps> = ({
  deployments,
  onSelect,
  selectedId,
  projectId,
}) => {
  return (
    <div className="flex w-1/4 bg-gray-100 p-4 border-r border-gray-300">
      <div>
        <h2 className="text-xl font-semibold mb-4">Deployments</h2>
        <ul>
          {deployments.map((deployment, i) => (
            <li
              key={deployment.id}
              className={`p-2 cursor-pointer rounded-md mb-2 ${
                selectedId === deployment.id
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
              onClick={() => onSelect(deployment.id)}
            >
              deployment ${i}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <button
          className="ml-4 px-4 py-2 bg-green-400 rounded-lg"
          onClick={() => handleAddingDeployment({ projectId, onSelect })}
        >
          Create Deployment
        </button>
      </div>
    </div>
  );
};

export default DeploymentList;
