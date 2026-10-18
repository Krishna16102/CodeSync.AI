import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProjectById } from "../../services/projectService";

import "./WorkspaceHeader.css";

function WorkspaceHeader({
  projectId,
  projectName,
  members = [],
  onMembersClick,
}) {
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // load project
  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      setLoading(true);

      const data = await getProjectById(projectId);
      console.log("Workspace project:", data);

      setProject(data);
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  }

  // project name — supplied by Workspace so it updates immediately
  // after the owner renames the project
  const displayProjectName =
    projectName || project?.name || "Untitled Project";

  // member display
  const visibleMembers = Array.isArray(members) ? members.slice(0, 3) : [];
  const remainingMembers = Math.max(0, members.length - visibleMembers.length);

  // dashboard
  function handleDashboardClick() {
    navigate("/dashboard");
  }

  return (
    <header className="workspace-header">
      {/* left side */}
      <div className="workspace-header-left">
        <button
          type="button"
          className="back-dashboard-btn"
          onClick={handleDashboardClick}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <span className="back-dashboard-arrow">←</span>
        </button>

        <div className="workspace-project-info">
          <div className="workspace-project-icon">✦</div>

          <div className="workspace-project-details">
            <h1>
              {loading && !projectName ? "Loading..." : displayProjectName}
            </h1>

            {/* {project && <p>Project #{project.id}</p>} */}
          </div>
        </div>
      </div>

      {/* right side */}
      <div className="workspace-header-right">
        {/* member avatars */}
        {visibleMembers.length > 0 && (
          <div className="member-preview" title="Project members">
            {visibleMembers.map((member, index) => {
              const name = member?.user?.name || member?.name || "User";

              return (
                <div
                  key={member?.id || member?.user?.id || index}
                  className="member-avatar"
                  title={name}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              );
            })}

            {remainingMembers > 0 && (
              <div
                className="member-more"
                title={`${remainingMembers} more member${
                  remainingMembers === 1 ? "" : "s"
                }`}
              >
                +{remainingMembers}
              </div>
            )}
          </div>
        )}

        {/* members button */}
        <button
          type="button"
          className="members-btn"
          onClick={onMembersClick}
          title="Project members"
        >
          <span className="members-btn-icon">👥</span>
          <span>Members</span>
        </button>
      </div>
    </header>
  );
}

export default WorkspaceHeader;