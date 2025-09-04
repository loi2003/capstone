import React from "react";
import { motion } from "framer-motion";
import "./DeletePopup.css"; 

const DeletePopup = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-overlay">
      <motion.div
        className="delete-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <h2 className="delete-title">Confirm Deletion</h2>
        <p className="delete-message">{message || "Are you sure you want to delete this item?"}</p>
        <div className="delete-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeletePopup;
