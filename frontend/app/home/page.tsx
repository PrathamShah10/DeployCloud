"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Project {
  id?: string;
  subDomain: string;
  gitURL: string;
  name: string;
}
interface ProjectInput {
  gitURL: string;
  name: string;
}

const HomePage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<ProjectInput>({
    name: "",
    gitURL: "",
  });
  const [selectedScreen, setSelectedScreen] = useState<string>("ALL_PROJECTS");

  const getAllProjects = async () => {
    try {
      const response = await fetch("http://localhost:9000/project", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      if (response.ok) {
        const data = await response.json();
        // console.log("data", data);
        setProjects(data);
      } else {
        console.error("error occured");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  const addProject = async () => {
    if (newProject.name && newProject.gitURL) {
      try {
        const response = await fetch("http://localhost:9000/project", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify(newProject),
        });

        if (response.ok) {
          const data = await response.json();
          setProjects([...projects, data]);
          setNewProject({ name: "", gitURL: "" });
        } else {
          console.error("Error adding project:", response.statusText);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <div className="w-[75%] container mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          Your Dashboard
        </h1>

        <div className="mb-12">
          <div className="text-xl flex items-center font-semibold mb-4 text-black">
            <h3
              className={`${
                selectedScreen === "ALL_PROJECTS"
                  ? "px-4 py-2 bg-black text-white rounded-lg"
                  : ""
              } cursor-pointer transition duration-300`}
              onClick={() => setSelectedScreen("ALL_PROJECTS")}
            >
              All Projects
            </h3>
            <span className="mx-2 text-gray-700">|</span>
            <h3
              className={`${
                selectedScreen === "NEW_PROJECT"
                  ? "px-4 py-2 bg-black text-white rounded-lg"
                  : ""
              } cursor-pointer transition duration-300`}
              onClick={() => setSelectedScreen("NEW_PROJECT")}
            >
              Add New Project
            </h3>
          </div>

          {selectedScreen === "ALL_PROJECTS" ? (
            <ul className="space-y-4">
              {projects.map((project, index) => (
                <Link href={`/project/${project?.id}`} key={index}>
                  <div className="flex items-center p-4 rounded-lg shadow-sm bg-white border border-gray-300 hover:bg-gray-100 transition duration-300 mb-4">
                    <div className="flex-1 flex flex-col">
                      <p className="text-xl font-semibold mb-2">
                        {project.name}
                      </p>
                      <p className="text-gray-600 mb-2">
                        Domain: {project.subDomain}
                      </p>
                      <p className="text-gray-600 mb-1">
                        Project URL: {project.gitURL}
                      </p>
                    </div>
                    <span className="text-gray-600 ml-4">→</span>
                  </div>
                </Link>
              ))}
            </ul>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Create New Project
              </h2>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                  className="w-full border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Project Git URL"
                  value={newProject.gitURL}
                  onChange={(e) =>
                    setNewProject({ ...newProject, gitURL: e.target.value })
                  }
                  required
                  className="w-full border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
                />
                <button
                  onClick={addProject}
                  className="w-full py-3 bg-black text-white rounded-lg hover:bg-white hover:text-black border border-black transition duration-300"
                >
                  Create Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
