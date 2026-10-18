import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import FileChangeCard from "../FileChangeCard/FileChangeCard";

import "./ChatWindow.css";

function ChatWindow({
  // projectId,
  messages = [],
  filesChanged = [],
  streamingMessageId,
  onFileClick,
}) {
  const bottomRef = useRef(null);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // copy code
  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  }

  // empty chat
  if (!messages.length) {
    return (
      <div className="chat-window">
        <div className="empty-chat">
          <div className="empty-chat-icon">✦</div>
          <h2>What do you want to build?</h2>
          <p>Ask CodeSync AI to create or modify your project.</p>
        </div>

        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((message, index) => {
        const isUser = message.role === "USER";
        const isStreaming = message.id === streamingMessageId;
        const isLastMessage = index === messages.length - 1;

        return (
          <div
            key={message.id}
            className={`message ${isUser ? "user-message" : "ai-message"} ${
              isStreaming ? "streaming-message" : ""
            }`}
          >
            {/* role */}
            <div className="message-role">
              <span
                className={`message-role-dot ${isUser ? "user-dot" : "ai-dot"}`}
              />
              <span>{isUser ? "You" : "CodeSync AI"}</span>
            </div>

            {/* content */}
            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // code blocks
                  pre({ children }) {
                    return <div className="code-block-wrapper">{children}</div>;
                  },

                  code({ inline, className, children }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "code";
                    const code = String(children).replace(/\n$/, "");

                    // inline code
                    if (inline) {
                      return <code className="inline-code">{children}</code>;
                    }

                    return (
                      <div className="code-block">
                        <div className="code-block-header">
                          <span className="code-language">{language}</span>

                          <button
                            type="button"
                            className="copy-code-btn"
                            onClick={() => copyCode(code)}
                          >
                            Copy
                          </button>
                        </div>

                        <pre>
                          <code className={className || ""}>{code}</code>
                        </pre>
                      </div>
                    );
                  },

                  // links
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-link"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content || ""}
              </ReactMarkdown>

              {isStreaming && (
                <span className="typing-cursor" aria-hidden="true">
                  ▌
                </span>
              )}
            </div>

            {/* file changes */}
            {!isUser && !isStreaming && isLastMessage && filesChanged.length > 0 && (
              <FileChangeCard files={filesChanged} onFileClick={onFileClick} />
            )}
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;