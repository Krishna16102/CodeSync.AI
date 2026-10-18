import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createProject } from "../../services/projectService";

import "./CreateProject.css";

function CreateProject({ onProjectCreated }) {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const name = projectName.trim();

    if (!name) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);

      const newProject = await createProject({ name: name });
      console.log("Project created:", newProject);

      // tell Dashboard that a new project was successfully created
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }

      // clear input
      setProjectName("");

      // open the newly created project
      navigate(`/workspace/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);

      setError(
        error.response?.data?.message || "Unable to create project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-project-container">
      <div className="create-project-card">
        <div className="create-project-icon">✨</div>

        <h2>Create a new project</h2>

        <p className="create-project-description">
          Start building something amazing with AI.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="project-input-group">
            <label>Project name</label>

            <input
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="My AI Website"
              disabled={loading}
            />
          </div>

          {error && <p className="create-project-error">{error}</p>}

          <button
            type="submit"
            className="create-project-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;