/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((title, text, variant = "good") => {
    const id = nextToastId++;
    setToasts((current) => [...current, { id, title, text, variant }]);
    window.setTimeout(() => dismissToast(id), 4200);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toastViewport">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toastCard ${toast.variant}`}>
            <div className="toastCardTitle">{toast.title}</div>
            <div className="toastCardText">{toast.text}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
