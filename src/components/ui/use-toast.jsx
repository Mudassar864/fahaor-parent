"use client";

import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, duration = 5000, variant }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, title, description, duration, variant },
    ]);

    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  return { toasts, addToast };
}
export default toast ; // Default export
