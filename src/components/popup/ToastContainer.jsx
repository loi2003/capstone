import React, { useContext, useEffect } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import "./ToastContainer.css";

const ToastContainer = () => {
  const { toasts } = useContext(NotificationContext);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
