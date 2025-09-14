import React from "react";
import "./LoadingOverlay.css";
import RollingLoading from "../../assets/RollingLoading.gif";

const LoadingOverlay = ({ show }) => {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <img src={RollingLoading} alt="Loading..." className="loading-gif" />
    </div>
  );
};

export default LoadingOverlay;
