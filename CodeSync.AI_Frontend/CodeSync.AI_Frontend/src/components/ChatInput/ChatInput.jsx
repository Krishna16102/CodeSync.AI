import { useRef, useState } from "react";
import { streamChatMessage } from "../../services/chatService";
import { useToast } from "../../context/ToastContext";
import "./ChatInput.css";

function ChatInput({
  projectId,
  onUserMessage,
  onToken,
  onMessageSent,
  onFilesChanged,
  onStreamingStart,
  onStreamingEnd,
  onStreamingError,
}) {
  const { success, error: showError } = useToast();

  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);

  // holds the current streaming request
  const abortControllerRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const currentPrompt = String(prompt || "").trim();

    if (!currentPrompt) {
      showError("Please enter a message.");
      return;
    }

    if (sending) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setSending(true);
      setPrompt("");

      // show user message immediately
      if (onUserMessage) {
        onUserMessage(currentPrompt);
      }

      // start AI message
      if (onStreamingStart) {
        onStreamingStart();
      }

      await streamChatMessage(
        projectId,
        currentPrompt,

        // token
        (token) => {
          if (onToken) onToken(token);
        },

        // done
        (doneData) => {
          const changedFiles = Array.isArray(doneData?.filesChanged)
            ? doneData.filesChanged
            : [];

          // tells Workspace that AI changed/generated files —
          // works for both OWNER and EDITOR
          if (onFilesChanged) {
            onFilesChanged(changedFiles);
          }

          if (onMessageSent) {
            onMessageSent();
          }

          success("Generation completed.");
        },

        controller.signal
      );
    } catch (error) {
      // stop button causes AbortError — not an application error
      if (error?.name === "AbortError") {
        console.log("Generation cancelled.");
        return;
      }

      console.error("Failed to send prompt:", error);

      // restore prompt when generation genuinely fails
      setPrompt(currentPrompt);

      if (onStreamingError) {
        onStreamingError(error);
      }

      showError(error?.message || "Failed to generate project.");
    } finally {
      abortControllerRef.current = null;
      setSending(false);

      if (onStreamingEnd) {
        onStreamingEnd();
      }
    }
  }

  function handleStop() {
    const controller = abortControllerRef.current;
    if (!controller) return;

    console.log("Stopping AI generation...");
    controller.abort();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          sending ? "AI is generating..." : "Ask CodeSync to build something..."
        }
        disabled={sending}
        rows={1}
      />

      {sending ? (
        <button
          type="button"
          className="stop-generation-btn"
          onClick={handleStop}
          title="Stop generation"
        >
          <span className="stop-icon">■</span>
          <span className="stop-text">Stop</span>
        </button>
      ) : (
        <button type="submit" disabled={!prompt.trim()} title="Send message">
          ➤
        </button>
      )}
    </form>
  );
}

export default ChatInput;