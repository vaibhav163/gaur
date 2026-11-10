import { createContext, useCallback, useContext, useRef, useState } from "react";

// Toast notifications — ported from the static site's toast().
const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((msg, kind) => {
    const id = ++idRef.current;
    setToasts((list) => [...list, { id, msg, kind }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismiss = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={"toast" + (t.kind ? " " + t.kind : "")} role="status">
            <span>{t.msg}</span>
            <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
