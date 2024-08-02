"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { setDeployments } from "@/app/redux/reducer/deployment";
import DeploymentList from "../../components/DeploymentList";
import DeploymentLogs from "../../components/DeploymentLogs";
import { usePathname } from "next/navigation";


const DeploymentPage = () => {
  const { selectedDeploymentId } = useAppSelector((state) => state.deployment);
  const dispatch = useAppDispatch();
  const [logs, setLogs] = useState<string[]>([]);
  const projectId = usePathname().split("/")[2];
  useEffect(() => {
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
          dispatch(setDeployments(data));
        } else {
          console.error("Error fetching deployments");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchDeployments();
  }, [dispatch, projectId]);

  useEffect(() => {
    if (selectedDeploymentId) {
      const fetchLogs = async () => {
        try {
          console.log('hore logs fetch')
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
        projectId={projectId}
      />
      <DeploymentLogs logs={logs} /> 
    </div>
  );
};

export default DeploymentPage;
