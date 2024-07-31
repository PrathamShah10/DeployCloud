
import React from 'react';

interface DeploymentLogsProps {
  logs: string[];
}

const DeploymentLogs: React.FC<DeploymentLogsProps> = ({ logs }) => {
  return (
    <div className="w-3/4 p-4">
      <h2 className="text-xl font-semibold mb-4">Deployment Logs</h2>
      <pre className=" text-white p-4 rounded-md overflow-auto">{logs.join('\n')}</pre>
    </div>
  );
};

export default DeploymentLogs;
