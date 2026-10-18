import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // remove toast
  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  // show toast
  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Date.now() + Math.random();

      const newToast = { id, message, type };

      setToasts((previous) => [...previous, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  // success
  const success = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "success", duration);
    },
    [showToast]
  );

  // error
  const error = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "error", duration);
    },
    [showToast]
  );

  // warning
  const warning = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "warning", duration);
    },
    [showToast]
  );

  // info
  const info = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "info", duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, success, error, warning, info, removeToast }}
    >
      {children}
    </ToastContext.Provider>
  );
}

// use toast
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}