import { useEffect, useMemo, useState } from "react";

import {
  getProjectFiles,
  deleteFile,
  renameFile,
} from "../../services/fileService";

import {
  getProjectById,
  updateProject,
  deleteProject,
} from "../../services/projectService";

import { useToast } from "../../context/ToastContext";

import "./FileExplorer.css";

function FileExplorer({
  projectId,
  refreshKey,
  onFileSelect,
  selectedFile,
  projectRole,
  onProjectDeleted,
  onProjectRenamed,
}) {
  const { success, error: showError } = useToast();

  // project
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);

  // files
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // search
  const [search, setSearch] = useState("");

  // folders
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // file delete
  const [deleting, setDeleting] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  // file rename
  const [fileToRename, setFileToRename] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState("");

  // project rename
  const [projectRenameOpen, setProjectRenameOpen] = useState(false);
  const [projectRenameValue, setProjectRenameValue] = useState("");
  const [projectRenaming, setProjectRenaming] = useState(false);
  const [projectRenameError, setProjectRenameError] = useState("");

  // project delete
  const [projectDeleteOpen, setProjectDeleteOpen] = useState(false);
  const [projectDeleting, setProjectDeleting] = useState(false);
  const [projectDeleteError, setProjectDeleteError] = useState("");

  // permissions
  const canManageProject = projectRole === "OWNER";
  const canEditFiles = projectRole === "OWNER";

  // load project
  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setProjectLoading(false);
      return;
    }
    loadProject();
  }, [projectId, refreshKey]);

  async function loadProject() {
    try {
      setProjectLoading(true);
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setProjectLoading(false);
    }
  }

  // load files
  useEffect(() => {
    if (!projectId) return;
    loadFiles();
  }, [projectId, refreshKey]);

  async function loadFiles() {
    try {
      setLoading(true);
      const data = await getProjectFiles(projectId);
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load project files:", error);
      showError("Failed to load project files.");
    } finally {
      setLoading(false);
    }
  }

  // file select
  function handleFileClick(path) {
    if (onFileSelect) {
      onFileSelect(path);
    }
  }

  // folder toggle
  function toggleFolder(path) {
    setExpandedFolders((previous) => {
      const next = new Set(previous);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  // file paths
  const filePaths = useMemo(() => {
    return files.map((file) => file.path || file.name).filter(Boolean);
  }, [files]);

  // build file tree
  const tree = useMemo(() => {
    const root = { folders: {}, files: [] };

    filePaths.forEach((path) => {
      const parts = path.split("/").filter(Boolean);
      let current = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;

        if (isFile) {
          current.files.push({ name: part, path });
          return;
        }

        if (!current.folders[part]) {
          current.folders[part] = {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
            folders: {},
            files: [],
          };
        }

        current = current.folders[part];
      });
    });

    return root;
  }, [filePaths]);

  // search
  function matchesSearch(path) {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return path.toLowerCase().includes(query);
  }

  function folderContainsMatch(folder) {
    if (matchesSearch(folder.path)) return true;

    if (folder.files.some((file) => matchesSearch(file.path))) return true;

    return Object.values(folder.folders).some((child) =>
      folderContainsMatch(child)
    );
  }

  // project rename
  function openProjectRename() {
    if (!canManageProject) return;

    setProjectRenameValue(project?.name || "");
    setProjectRenameError("");
    setProjectRenameOpen(true);
  }

  function closeProjectRename() {
    if (projectRenaming) return;

    setProjectRenameOpen(false);
    setProjectRenameValue("");
    setProjectRenameError("");
  }

  async function confirmProjectRename() {
    if (!canManageProject) return;

    const newName = projectRenameValue.trim();

    if (!newName) {
      setProjectRenameError("Project name cannot be empty.");
      return;
    }

    if (newName.length > 100) {
      setProjectRenameError("Project name cannot exceed 100 characters.");
      return;
    }

    if (newName === project?.name) {
      closeProjectRename();
      return;
    }

    try {
      setProjectRenaming(true);
      setProjectRenameError("");

      const updatedProject = await updateProject(projectId, { name: newName });

      setProject(updatedProject);

      if (onProjectRenamed) {
        onProjectRenamed(updatedProject);
      }

      setProjectRenameOpen(false);
      setProjectRenameValue("");

      success("Project renamed successfully.");
    } catch (error) {
      console.error("Failed to rename project:", error);

      const message =
        error?.response?.data?.message || "Failed to rename project.";

      setProjectRenameError(message);
      showError(message);
    } finally {
      setProjectRenaming(false);
    }
  }

  // project delete
  function openProjectDelete() {
    if (!canManageProject) return;

    setProjectDeleteError("");
    setProjectDeleteOpen(true);
  }

  function closeProjectDelete() {
    if (projectDeleting) return;

    setProjectDeleteOpen(false);
    setProjectDeleteError("");
  }

  async function confirmProjectDelete() {
    if (!canManageProject) return;

    try {
      setProjectDeleting(true);
      setProjectDeleteError("");

      await deleteProject(projectId);

      setProjectDeleteOpen(false);

      success("Project deleted successfully.");

      if (onProjectDeleted) {
        onProjectDeleted();
      }
    } catch (error) {
      console.error("Failed to delete project:", error);

      const message =
        error?.response?.data?.message || "Failed to delete project.";

      setProjectDeleteError(message);
      showError(message);
    } finally {
      setProjectDeleting(false);
    }
  }

  // file rename
  function openRenameModal(event, path) {
    event.stopPropagation();
    if (!canEditFiles) return;

    setFileToRename(path);
    setRenameValue(path);
    setRenameError("");
  }

  function closeRenameModal() {
    if (renaming) return;

    setFileToRename(null);
    setRenameValue("");
    setRenameError("");
  }

  async function confirmRename() {
    if (!canEditFiles) return;

    const newPath = renameValue.trim();

    if (!newPath) {
      setRenameError("File name cannot be empty.");
      return;
    }

    if (newPath === fileToRename) {
      closeRenameModal();
      return;
    }

    const exists = files.some(
      (file) => (file.path || file.name) === newPath
    );

    if (exists) {
      setRenameError("A file with this name already exists.");
      return;
    }

    try {
      setRenaming(true);
      setRenameError("");

      await renameFile(projectId, fileToRename, newPath);

      if (selectedFile === fileToRename && onFileSelect) {
        onFileSelect(newPath);
      }

      setFileToRename(null);
      setRenameValue("");

      await loadFiles();

      success("File renamed successfully.");
    } catch (error) {
      console.error("Failed to rename file:", error);

      const message =
        error?.response?.data?.message || "Failed to rename file.";

      setRenameError(message);
      showError(message);
    } finally {
      setRenaming(false);
    }
  }

  // file delete
  function openDeleteModal(event, path) {
    event.stopPropagation();
    if (!canEditFiles) return;

    setDeleteError("");
    setFileToDelete(path);
  }

  function closeDeleteModal() {
    if (deleting) return;

    setFileToDelete(null);
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!canEditFiles) return;
    if (!fileToDelete) return;

    try {
      setDeleting(fileToDelete);
      setDeleteError("");

      await deleteFile(projectId, fileToDelete);

      if (selectedFile === fileToDelete && onFileSelect) {
        onFileSelect(null);
      }

      setFileToDelete(null);

      await loadFiles();

      success("File deleted successfully.");
    } catch (error) {
      console.error("Failed to delete file:", error);

      const message =
        error?.response?.data?.message || "Failed to delete file.";

      setDeleteError(message);
      showError(message);
    } finally {
      setDeleting(null);
    }
  }

  // render folder
  function renderFolder(folder, level = 0) {
    const isExpanded = search.trim()
      ? true
      : expandedFolders.has(folder.path);

    const visibleFolders = Object.values(folder.folders).filter(
      (child) => !search.trim() || folderContainsMatch(child)
    );

    const visibleFiles = folder.files.filter((file) =>
      matchesSearch(file.path)
    );

    if (
      search.trim() &&
      visibleFolders.length === 0 &&
      visibleFiles.length === 0
    ) {
      return null;
    }

    return (
      <div key={folder.path} className="tree-folder">
        <button
          type="button"
          className="folder-item"
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => toggleFolder(folder.path)}
        >
          <span className="folder-arrow">{isExpanded ? "▼" : "▶"}</span>
          <span className="folder-icon">{isExpanded ? "📂" : "📁"}</span>
          <span className="folder-name">{folder.name}</span>
        </button>

        {isExpanded && (
          <div className="folder-children">
            {visibleFolders.map((child) => renderFolder(child, level + 1))}
            {visibleFiles.map((file) => renderFile(file, level + 1))}
          </div>
        )}
      </div>
    );
  }

  // render file
  function renderFile(file, level = 0) {
    const isSelected = selectedFile === file.path;
    const isDeleting = deleting === file.path;

    return (
      <div
        key={file.path}
        className={`file-item ${isSelected ? "active" : ""}`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <button
          type="button"
          className="file-select-btn"
          onClick={() => handleFileClick(file.path)}
          disabled={isDeleting}
        >
          <span className="file-icon">📄</span>
          <span className="file-name">{file.name}</span>
        </button>

        {canEditFiles && (
          <div className="file-actions">
            <button
              type="button"
              className="rename-file-btn"
              onClick={(event) => openRenameModal(event, file.path)}
              disabled={isDeleting}
              title="Rename file"
            >
              ✎
            </button>

            <button
              type="button"
              className="delete-file-btn"
              onClick={(event) => openDeleteModal(event, file.path)}
              disabled={isDeleting}
              title="Delete file"
            >
              {isDeleting ? "..." : "🗑"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <aside className="file-explorer">
        {/* header */}
        <div className="file-explorer-header">
          <div className="file-explorer-project">
            <span className="file-explorer-project-name">
              {projectLoading
                ? "Loading..."
                : project?.name || "Untitled Project"}
            </span>
          </div>

          <div className="file-explorer-header-actions">
            <button
              type="button"
              className="refresh-files-btn"
              onClick={() => {
                loadProject();
                loadFiles();
              }}
              title="Refresh"
            >
              ↻
            </button>

            {canManageProject && (
              <>
                <button
                  type="button"
                  className="project-rename-btn"
                  onClick={openProjectRename}
                  title="Rename project"
                >
                  ✎
                </button>

                <button
                  type="button"
                  className="project-delete-btn"
                  onClick={openProjectDelete}
                  title="Delete project"
                >
                  🗑
                </button>
              </>
            )}
          </div>
        </div>

        {/* search */}
        <div className="file-search">
          <span className="file-search-icon">🔍</span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search files..."
          />

          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* file list */}
        <div className="file-list">
          {loading ? (
            <p className="file-status">Loading files...</p>
          ) : files.length === 0 ? (
            <p className="file-status">No files yet</p>
          ) : (
            <>
              {Object.values(tree.folders).map((folder) =>
                renderFolder(folder)
              )}

              {tree.files
                .filter((file) => matchesSearch(file.path))
                .map((file) => renderFile(file))}
            </>
          )}
        </div>
      </aside>

      {/* project rename modal */}
      {projectRenameOpen && canManageProject && (
        <div className="project-modal-overlay" onClick={closeProjectRename}>
          <div
            className="project-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Rename project</h3>

            <p className="project-modal-description">
              Change the project name for all members.
            </p>

            <input
              type="text"
              value={projectRenameValue}
              onChange={(event) =>
                setProjectRenameValue(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  confirmProjectRename();
                }
                if (event.key === "Escape") {
                  closeProjectRename();
                }
              }}
              autoFocus
              disabled={projectRenaming}
            />

            {projectRenameError && (
              <div className="project-modal-error">
                {projectRenameError}
              </div>
            )}

            <div className="project-modal-actions">
              <button
                type="button"
                className="cancel-project-btn"
                onClick={closeProjectRename}
                disabled={projectRenaming}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-project-btn"
                onClick={confirmProjectRename}
                disabled={projectRenaming}
              >
                {projectRenaming ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* project delete modal */}
      {projectDeleteOpen && canManageProject && (
        <div className="project-modal-overlay" onClick={closeProjectDelete}>
          <div
            className="project-delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="project-delete-icon">🗑</div>

            <h3>Delete project?</h3>

            <p>
              Are you sure you want to delete
              <strong> {project?.name}</strong>?
            </p>

            <p className="project-delete-warning">
              This project will no longer be accessible to you or its
              members.
            </p>

            {projectDeleteError && (
              <div className="project-delete-error">
                {projectDeleteError}
              </div>
            )}

            <div className="project-delete-actions">
              <button
                type="button"
                className="cancel-project-delete-btn"
                onClick={closeProjectDelete}
                disabled={projectDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-project-delete-btn"
                onClick={confirmProjectDelete}
                disabled={projectDeleting}
              >
                {projectDeleting ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* file rename modal */}
      {fileToRename && canEditFiles && (
        <div className="file-modal-overlay" onClick={closeRenameModal}>
          <div
            className="file-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Rename file</h3>

            <input
              type="text"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  confirmRename();
                }
                if (event.key === "Escape") {
                  closeRenameModal();
                }
              }}
              autoFocus
              disabled={renaming}
            />

            {renameError && (
              <div className="file-modal-error">{renameError}</div>
            )}

            <div className="file-modal-actions">
              <button
                type="button"
                className="cancel-file-btn"
                onClick={closeRenameModal}
                disabled={renaming}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-file-btn"
                onClick={confirmRename}
                disabled={renaming}
              >
                {renaming ? "Renaming..." : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* file delete modal */}
      {fileToDelete && canEditFiles && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">🗑</div>

            <h3>Delete file?</h3>

            <p>
              Are you sure you want to delete
              <strong> {fileToDelete}</strong>?
            </p>

            <p className="delete-warning">This action cannot be undone.</p>

            {deleteError && <div className="delete-error">{deleteError}</div>}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="cancel-delete-btn"
                onClick={closeDeleteModal}
                disabled={!!deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={!!deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FileExplorer;