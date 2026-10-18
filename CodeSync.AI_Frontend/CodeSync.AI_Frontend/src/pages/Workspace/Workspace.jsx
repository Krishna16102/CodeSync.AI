import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ChatWindow from "../../components/ChatWindow/ChatWindow";
import ChatInput from "../../components/ChatInput/ChatInput";
import FileExplorer from "../../components/FileExplorer/FileExplorer";
import FileViewer from "../../components/FileViewer/FileViewer";
import GenerationProgress from "../../components/GenerationProgress/GenerationProgress";
import WorkspaceHeader from "../../components/WorkspaceHeader/WorkspaceHeader";
import ProjectMembers from "../../components/ProjectMembers/ProjectMembers";

import { getMyProjectRole } from "../../services/memberService";
import { getChatMessages } from "../../services/chatService";
import { getProjectById } from "../../services/projectService";

import "./Workspace.css";

function Workspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // refresh trigger for file explorer / chat reloads
  const [refreshKey, setRefreshKey] = useState(0);

  // currently open file in the viewer
  const [selectedFile, setSelectedFile] = useState(null);

  // files changed by the last AI generation
  const [filesChanged, setFilesChanged] = useState([]);

  // whether the AI is currently "thinking"
  const [thinking, setThinking] = useState(false);

  // current user's role on this project
  const [projectRole, setProjectRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // project name, kept in sync with FileExplorer after a rename
  const [projectName, setProjectName] = useState("");

  // members modal visibility
  const [showMembers, setShowMembers] = useState(false);

  // chat messages
  const [messages, setMessages] = useState([]);

  // id of the message currently being streamed
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  // load project name
  useEffect(() => {
    if (!projectId) {
      setProjectName("");
      return;
    }
    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      const project = await getProjectById(projectId);
      console.log("Workspace project:", project);
      setProjectName(project?.name || "");
    } catch (error) {
      console.error("Failed to load workspace project:", error);
    }
  }

  // load project role
  useEffect(() => {
    if (!projectId) {
      setProjectRole(null);
      setRoleLoading(false);
      return;
    }
    loadProjectRole();
  }, [projectId]);

  async function loadProjectRole() {
    try {
      setRoleLoading(true);
      const role = await getMyProjectRole(projectId);
      console.log("Current project role:", role);
      setProjectRole(String(role || "").toUpperCase());
    } catch (error) {
      console.error("Failed to load project role:", error);
      setProjectRole(null);
    } finally {
      setRoleLoading(false);
    }
  }

  // load chat history
  useEffect(() => {
    if (!projectId) return;
    loadChatMessages();
  }, [projectId]);

  async function loadChatMessages() {
    try {
      const data = await getChatMessages(projectId);
      console.log("Workspace chat messages:", data);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load chat messages:", error);
    }
  }

  // permissions
  const canUseAI = projectRole === "OWNER" || projectRole === "EDITOR";
  const canManageMembers = projectRole === "OWNER";
  const canManageFiles = projectRole === "OWNER";

  // user message
  function handleUserMessage(content) {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "USER",
      content: content,
    };

    setMessages((previous) => [...previous, userMessage]);
  }

  // AI stream start
  function handleStreamingStart() {
    setThinking(true);

    const aiMessage = {
      id: `ai-${Date.now()}`,
      role: "ASSISTANT",
      content: "",
      streaming: true,
    };

    setStreamingMessageId(aiMessage.id);
    setMessages((previous) => [...previous, aiMessage]);
  }

  // AI token
  function handleToken(token) {
    if (!token) return;

    setMessages((previous) =>
      previous.map((message) => {
        if (message.id !== streamingMessageId) return message;

        return {
          ...message,
          content: message.content + token,
          streaming: true,
        };
      })
    );
  }

  // stream complete
  function handleStreamComplete() {
    setMessages((previous) =>
      previous.map((message) => {
        if (message.id !== streamingMessageId) return message;
        return { ...message, streaming: false };
      })
    );

    setStreamingMessageId(null);
    setThinking(false);

    setTimeout(() => {
      loadChatMessages();
    }, 300);

    setRefreshKey((previous) => previous + 1);
  }

  // streaming error
  function handleStreamingError() {
    setMessages((previous) =>
      previous.filter((message) => message.id !== streamingMessageId)
    );

    setStreamingMessageId(null);
    setThinking(false);
  }

  // message sent
  function handleMessageSent() {
    setRefreshKey((previous) => previous + 1);
  }

  // files changed by AI
  function handleFilesChanged(changedFiles) {
    console.log("AI files changed:", changedFiles);

    setFilesChanged(Array.isArray(changedFiles) ? changedFiles : []);
    setRefreshKey((previous) => previous + 1);
  }

  // file select
  function handleFileSelect(path) {
    console.log("Selected file:", path);
    setSelectedFile(path);
  }

  // close file
  function handleCloseFile() {
    setSelectedFile(null);
  }

  // open members modal
  function handleMembersClick() {
    setShowMembers(true);
  }

  // close members modal
  function handleMembersClose() {
    setShowMembers(false);
  }

  // project renamed — FileExplorer calls this after a successful rename,
  // so we update projectName and WorkspaceHeader gets the new name immediately
  function handleProjectRenamed(updatedProject) {
    console.log("Project renamed:", updatedProject);

    if (updatedProject?.name) {
      setProjectName(updatedProject.name);
    }
  }

  // project deleted — FileExplorer calls this after the OWNER deletes the project
  function handleProjectDeleted() {
    console.log("Project deleted. Redirecting to dashboard...");
    navigate("/dashboard");
  }

  return (
    <div className="workspace">
      <WorkspaceHeader
        projectId={projectId}
        projectName={projectName}
        onMembersClick={handleMembersClick}
      />

      <div className="workspace-body">
        <FileExplorer
          projectId={projectId}
          refreshKey={refreshKey}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          projectRole={projectRole}
          onProjectDeleted={handleProjectDeleted}
          onProjectRenamed={handleProjectRenamed}
        />

        <div className="workspace-main">
          <div className="chat-area">
            <ChatWindow
              projectId={projectId}
              messages={messages}
              filesChanged={filesChanged}
              streamingMessageId={streamingMessageId}
              onFileClick={handleFileSelect}
            />

            {canUseAI && <GenerationProgress visible={thinking} />}

            {!roleLoading && canUseAI && (
              <ChatInput
                projectId={projectId}
                onUserMessage={handleUserMessage}
                onToken={handleToken}
                onMessageSent={handleMessageSent}
                onFilesChanged={handleFilesChanged}
                onStreamingStart={handleStreamingStart}
                onStreamingEnd={handleStreamComplete}
                onStreamingError={handleStreamingError}
              />
            )}

            {!roleLoading && projectRole === "VIEWER" && (
              <div className="viewer-chat-disabled">
                <span>👁</span>
                <span>
                  View-only mode — AI chat is available only to project
                  owners and editors.
                </span>
              </div>
            )}

            {roleLoading && (
              <div className="workspace-role-loading">
                Loading permissions...
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="workspace-file-viewer">
              <FileViewer
                projectId={projectId}
                selectedFile={selectedFile}
                onClose={handleCloseFile}
                projectRole={projectRole}
              />
            </div>
          )}
        </div>
      </div>

      {showMembers && (
        <ProjectMembers projectId={projectId} onClose={handleMembersClose} />
      )}
    </div>
  );
}

export default Workspace;