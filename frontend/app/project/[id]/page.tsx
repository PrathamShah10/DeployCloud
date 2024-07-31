"use client";
import { useState, useEffect } from "react";
import DeploymentList from "../../components/DeploymentList";
import DeploymentLogs from "../../components/DeploymentLogs";
import { usePathname } from "next/navigation";

interface Deployment {
  id: string;
}

const DeploymentPage = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<
    string | null
  >(null);
  const [logs, setLogs] = useState<string[]>([]);
  const projectId = usePathname().split("/")[2];

  useEffect(() => {
    // Fetch deployments
    const fetchDeployments = async () => {
      try {
        const response = await fetch(
          `http://localhost:9000/deployments/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDeployments(data);
        } else {
          console.error("Error fetching deployments");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchDeployments();
  }, []);

  useEffect(() => {
    if (selectedDeploymentId) {
      // Fetch logs for the selected deployment
      const fetchLogs = async () => {
        try {
          const response = await fetch(
            `http://localhost:9000/logs/${selectedDeploymentId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setLogs(data.logs);
          } else {
            console.error("Error fetching logs");
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchLogs();
    }
  }, [selectedDeploymentId]);

  return (
    <div className="h-screen flex">
      <DeploymentList
        deployments={deployments}
        onSelect={setSelectedDeploymentId}
        selectedId={selectedDeploymentId}
        projectId={projectId}
      />
      {/* <DeploymentLogs logs={logs} />  */}
    </div>
  );
};

export default DeploymentPage;
