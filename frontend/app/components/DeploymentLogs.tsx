"use client";
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { searchWithSubstring } from "../utils/search";
interface DeploymentLogsProps {
  logs: string[];
}
const DeploymentLogs: React.FC<DeploymentLogsProps> = ({ logs }) => {
  const [displayLogs, setDisplayLogs] = useState<string[]>(logs);
  const [searchString, setSearchString] = useState<string>("");
  useEffect(() => {
    if (searchString.length > 0) {
      setDisplayLogs(searchWithSubstring(logs, searchString));
    } else {
      setDisplayLogs(logs);
    }
  }, [searchString]);
  return (
    <div className="h-screen w-full bg-white flex flex-col p-4">
    <div className="flex items-center mb-4">
      <h2 className="text-lg font-bold text-gray-800 flex-grow">Deployment Logs</h2>
      <div className="relative flex items-center ml-auto">
        <FaSearch className="absolute left-3 text-gray-500" />
        <input
          type="text"
          placeholder="Search logs..."
          onChange={(e) => setSearchString(e.target.value)}
          className="pl-10 w-full max-w-xs p-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
    </div>
  
    <div className="flex-1 bg-gray-900 text-white p-4 rounded-md overflow-auto">
      {displayLogs.map((log, i) => (
        <div key={i} className="mb-2">
          <pre className="whitespace-pre-wrap">{log}</pre>
        </div>
      ))}
    </div>
  </div>
  
  );
};

export default DeploymentLogs;
