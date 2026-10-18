import { useEffect } from "react";

import "./Toast.css";

function Toast({ toast, onClose }) {
  useEffect(() => {
    // nothing needed here currently — ToastProvider handles the timer
  }, []);

  function getIcon() {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "×";
      case "warning":
        return "!";
      case "info":
      default:
        return "i";
    }
  }

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">{getIcon()}</div>

      <div className="toast-message">{toast.message}</div>

      <button
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;