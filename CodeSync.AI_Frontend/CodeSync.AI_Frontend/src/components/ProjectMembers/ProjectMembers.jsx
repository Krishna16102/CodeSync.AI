import { useEffect, useState } from "react";

import {
  getProjectMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  getMyProjectRole,
} from "../../services/memberService";

import { useToast } from "../../context/ToastContext";

import "./ProjectMembers.css";

function ProjectMembers({ projectId, onClose }) {
  const { success, error: showError } = useToast();

  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // add member form
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("EDITOR");
  const [inviting, setInviting] = useState(false);

  // remove confirmation
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);

  // load members
  useEffect(() => {
    if (!projectId) return;
    loadMembers();
  }, [projectId]);

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      const [membersData, roleData] = await Promise.all([
        getProjectMembers(projectId),
        getMyProjectRole(projectId),
      ]);

      setMembers(Array.isArray(membersData) ? membersData : []);
      setMyRole(roleData);
    } catch (err) {
      console.error("Failed to load project members:", err);
      setError("Failed to load project members.");
    } finally {
      setLoading(false);
    }
  }

  // owner permission
  const isOwner = String(myRole || "").toUpperCase() === "OWNER";

  // role helpers
  function getRoleClass(role) {
    const value = String(role || "").toLowerCase();
    if (value === "owner") return "role-owner";
    if (value === "editor") return "role-editor";
    return "role-viewer";
  }

  function getInitial(member) {
    const name = member.name || member.username || member.email || "U";
    return name.charAt(0).toUpperCase();
  }

  function getMemberName(member) {
    return (
      member.name || member.username || member.email || "Unknown user"
    );
  }

  // add / invite member
  async function handleInvite(event) {
    event.preventDefault();
    if (!isOwner) return;

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      showError("Please enter a username.");
      return;
    }

    try {
      setInviting(true);

      const newMember = await inviteMember(
        projectId,
        cleanUsername,
        selectedRole
      );

      setMembers((previous) => [...previous, newMember]);
      setUsername("");
      setSelectedRole("EDITOR");

      success("Member added successfully.");
    } catch (err) {
      console.error("Failed to add member:", err);

      const message =
        err?.response?.data?.message || "Failed to add member.";

      showError(message);
    } finally {
      setInviting(false);
    }
  }

  // update role
  async function handleRoleChange(memberId, role) {
    if (!isOwner) return;

    try {
      setUpdatingRole(memberId);

      await updateMemberRole(projectId, memberId, role);
      await loadMembers();

      success("Member role updated.");
    } catch (err) {
      console.error("Failed to update member role:", err);

      showError(
        err?.response?.data?.message || "Failed to update member role."
      );
    } finally {
      setUpdatingRole(null);
    }
  }

  // open remove confirmation
  function handleRemoveClick(member) {
    if (!isOwner) return;
    if (String(member.projectRole).toUpperCase() === "OWNER") return;

    setMemberToRemove(member);
  }

  // confirm remove
  async function confirmRemove() {
    if (!memberToRemove) return;

    try {
      setRemoving(true);

      await removeMember(projectId, memberToRemove.userId);

      setMembers((previous) =>
        previous.filter((member) => member.userId !== memberToRemove.userId)
      );

      success("Member removed successfully.");
      setMemberToRemove(null);
    } catch (err) {
      console.error("Failed to remove member:", err);

      showError(
        err?.response?.data?.message || "Failed to remove member."
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="members-overlay" onClick={onClose}>
      <div
        className="members-panel"
        onClick={(event) => event.stopPropagation()}
      >
        {/* header */}
        <div className="members-header">
          <div>
            <h2>Project Members</h2>
            <p>People who have access to this project</p>
          </div>

          <button
            type="button"
            className="members-close-btn"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* summary */}
        <div className="members-summary">
          <div className="summary-item">
            <span className="summary-label">Your role</span>
            <span className={`summary-role ${getRoleClass(myRole)}`}>
              {myRole || "Loading..."}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Members</span>
            <span className="summary-count">{members.length}</span>
          </div>
        </div>

        {/* add member — owner only */}
        {isOwner && (
          <form className="invite-member-form" onSubmit={handleInvite}>
            <div className="invite-form-title">Add member</div>

            <div className="invite-form-row">
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                disabled={inviting}
              />

              <select
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                disabled={inviting}
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>

              <button
                type="submit"
                disabled={inviting || !username.trim()}
              >
                {inviting ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        )}

        {/* error */}
        {error && <div className="members-error">{error}</div>}

        {/* member list */}
        <div className="members-list">
          {loading ? (
            <div className="members-loading">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="members-empty">No members found.</div>
          ) : (
            members.map((member) => {
              const memberRole = member.projectRole || member.role || "VIEWER";
              const memberId = member.userId || member.id;
              const isMemberOwner =
                String(memberRole).toUpperCase() === "OWNER";

              return (
                <div className="member-row" key={memberId}>
                  {/* avatar */}
                  <div className="member-avatar">{getInitial(member)}</div>

                  {/* user info */}
                  <div className="member-info">
                    <div className="member-name">{getMemberName(member)}</div>

                    {member.email && (
                      <div className="member-email">{member.email}</div>
                    )}
                  </div>

                  {/* role */}
                  <div className="member-role">
                    {isOwner ? (
                      <select
                        value={memberRole}
                        onChange={(event) =>
                          handleRoleChange(memberId, event.target.value)
                        }
                        className={`role-select ${getRoleClass(memberRole)}`}
                        disabled={isMemberOwner || updatingRole === memberId}
                      >
                        <option value="OWNER">Owner</option>
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${getRoleClass(memberRole)}`}>
                        {memberRole}
                      </span>
                    )}
                  </div>

                  {/* remove */}
                  {isOwner && !isMemberOwner && (
                    <button
                      type="button"
                      className="remove-member-btn"
                      onClick={() => handleRemoveClick(member)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* footer */}
        <div className="members-footer">
          {isOwner ? (
            <p>
              You are the project owner. You can manage member roles and
              access.
            </p>
          ) : (
            <p>
              You can view project members, but only the owner can manage
              access.
            </p>
          )}
        </div>
      </div>

      {/* remove confirmation modal */}
      {memberToRemove && (
        <div
          className="remove-confirm-overlay"
          onClick={() => setMemberToRemove(null)}
        >
          <div
            className="remove-confirm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="remove-confirm-icon">!</div>

            <h3>Remove member?</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>{getMemberName(memberToRemove)}</strong> from this
              project?
            </p>

            <div className="remove-confirm-actions">
              <button
                type="button"
                className="cancel-remove-btn"
                onClick={() => setMemberToRemove(null)}
                disabled={removing}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-remove-btn"
                onClick={confirmRemove}
                disabled={removing}
              >
                {removing ? "Removing..." : "Remove member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectMembers;