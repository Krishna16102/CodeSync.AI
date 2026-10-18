import { useEffect, useState } from "react";

import { getFileContent, saveFile } from "../../services/fileService";

import { useToast } from "../../context/ToastContext";

import HtmlPreview from "../HtmlPreview/HtmlPreview";

import "./FileViewer.css";

function FileViewer({ projectId, selectedFile, onClose, projectRole }) {
  const { success, error: showError } = useToast();

  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // OWNER and EDITOR can save
  // const canEdit =
  //     projectRole === "OWNER" ||
  //     projectRole === "EDITOR";
  const canEdit = projectRole === "OWNER";

  // load file
  useEffect(() => {
    if (!projectId || !selectedFile) {
      setFileData(null);
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    loadFile();
  }, [projectId, selectedFile]);

  async function loadFile() {
    try {
      setLoading(true);
      setError("");

      const data = await getFileContent(projectId, selectedFile);

      setFileData(data);
    } catch (error) {
      console.error("Failed to load file:", error);

      setError("Failed to load file.");
      showError("Failed to load file.");
    } finally {
      setLoading(false);
    }
  }

  // copy
  async function handleCopy() {
    if (!fileData?.content) {
      showError("There is no code to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(fileData.content);

      setCopied(true);
      success("Code copied successfully.");

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
      showError("Failed to copy code.");
    }
  }

  // save
  async function handleSave() {
    if (!canEdit) {
      showError("You only have view permission.");
      return;
    }

    if (!fileData || !selectedFile) {
      showError("No file selected.");
      return;
    }

    try {
      setSaving(true);

      await saveFile(projectId, selectedFile, fileData.content || "");

      success("File saved successfully.");
    } catch (error) {
      console.error("Failed to save file:", error);

      showError(
        error?.response?.data?.message || "Failed to save file."
      );
    } finally {
      setSaving(false);
    }
  }

  // html check
  const isHtml = Boolean(
    selectedFile && selectedFile.toLowerCase().endsWith(".html")
  );

  // preview
  if (showPreview && isHtml) {
    return (
      <HtmlPreview
        projectId={projectId}
        htmlPath={selectedFile}
        htmlContent={fileData?.content || ""}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="file-viewer">
      <div className="file-viewer-header">
        <div className="file-viewer-title">
          <span className="file-icon">&lt;/&gt;</span>
          <span className="file-name">{selectedFile}</span>
        </div>

        <div className="file-viewer-actions">
          {/* copy */}
          <button
            className="file-action-btn"
            onClick={handleCopy}
            title="Copy code"
            disabled={loading}
          >
            <span className="action-icon">{copied ? "✓" : "⧉"}</span>
            <span className="action-label">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* save — only OWNER / EDITOR */}
          {canEdit && (
            <button
              className="file-action-btn"
              onClick={handleSave}
              title="Save file"
              disabled={loading || saving}
            >
              <span className="action-icon save-icon">
                {saving ? "..." : "▣"}
              </span>
              <span className="action-label">
                {saving ? "Saving" : "Save"}
              </span>
            </button>
          )}

          {/* preview */}
          {isHtml && (
            <button
              className="file-action-btn preview-file-btn"
              onClick={() => setShowPreview(true)}
              title="Preview HTML"
              disabled={loading}
            >
              <span className="action-icon">▶</span>
              <span className="action-label">Preview</span>
            </button>
          )}

          {/* close */}
          <button className="close-file-btn" onClick={onClose} title="Close file">
            ×
          </button>
        </div>
      </div>

      <div className="file-viewer-content">
        {loading && (
          <div className="file-viewer-loading">Loading file...</div>
        )}

        {error && <div className="file-viewer-error">{error}</div>}

        {!loading && !error && fileData && (
          <pre className="source-code">
            <code>{fileData.content || ""}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

export default FileViewer;