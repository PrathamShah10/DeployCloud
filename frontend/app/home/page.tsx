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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Projects</h1>

      <div className="mb-8 p-6 border rounded-lg shadow-md bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Project Name"
            className="border p-2 rounded-md flex-1"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Project Git URL"
            className="border p-2 rounded-md flex-1"
            value={newProject.gitURL}
            onChange={(e) =>
              setNewProject({ ...newProject, gitURL: e.target.value })
            }
          />
        </div>
        <button
          onClick={addProject}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Create Project
        </button>
      </div>

      <ul>
        {projects.map((project) => (
          <li
            key={project?.id}
            className="border p-4 mb-4 rounded-lg shadow-sm"
          >
            <Link href={`/project/${project?.id}`}>
              <p className="text-xl font-semibold">{project.name}</p>
            </Link>
            <p className="text-blue-600">{project.gitURL}</p>
            <p className="text-blue-600">{project.subDomain}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
