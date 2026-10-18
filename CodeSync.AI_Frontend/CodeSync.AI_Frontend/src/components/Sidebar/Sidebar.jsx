import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyProjects } from "../../services/projectService";

import "./Sidebar.css";

function Sidebar() {

    const [projects, setProjects] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {

        loadProjects();

    }, []);

    async function loadProjects() {

        try {

            const projectData = await getMyProjects();

            setProjects(projectData);

        } catch (error) {

            console.error(
                "Failed to load projects:",
                error
            );

        }

    }

    function openDashboard() {

        navigate("/dashboard");

    }

    function openWorkspace(projectId) {

        navigate(`/workspace/${projectId}`);

    }

    return (

        <aside className="sidebar">

            {/* Logo */}

            <h2 className="sidebar-logo">
                CodeSync.AI
            </h2>


            {/* Dashboard */}

            <button
                className="sidebar-home"
                type="button"
                onClick={openDashboard}
            >

                <span>
                    🏠
                </span>

                <span>
                    Dashboard
                </span>

            </button>


            {/* Recent Projects */}

            <div className="recent-workspaces">

                <h4>
                    Recent Projects
                </h4>

                {
                    projects.length === 0 ? (

                        <p className="no-workspaces">
                            No projects yet
                        </p>

                    ) : (

                        projects
                            .slice(0, 5)
                            .map((project) => (

                                <button
                                    key={project.id}
                                    className="workspace-item"
                                    type="button"
                                    onClick={() =>
                                        openWorkspace(project.id)
                                    }
                                >

                                    <span className="workspace-icon">
                                        📁
                                    </span>

                                    <span className="workspace-name">
                                        {project.projectName}
                                    </span>

                                </button>

                            ))

                    )
                }

            </div>

        </aside>

    );

}

export default Sidebar;