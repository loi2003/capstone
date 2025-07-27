import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../../styles/NutrientSpecialistHomePage.css";

const NutrientManagement = () => {
  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="nutrient-specialist-homepage">
      <main className="nutrient-specialist-content" style={{ marginLeft: "260px" }}>
        <motion.section
          className="nutrient-specialist-features"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="nutrient-specialist-features-title">
            Nutrient Management
          </h2>
          <p className="nutrient-specialist-features-description">
            Manage nutrient details and nutritional information for consultations.
          </p>
          <div className="nutrient-specialist-features-grid">
            <motion.div
              variants={cardVariants}
              className="nutrient-specialist-feature-card"
            >
              <h3>Add Nutrient</h3>
              <p>Add new nutrients to the database for use in consultations.</p>
              <Link
                to="/nutrient-specialist/nutrient-management/add"
                className="nutrient-specialist-feature-link"
              >
                Add New
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="nutrient-specialist-feature-card"
            >
              <h3>View Nutrients</h3>
              <p>Review and update nutrient information.</p>
              <Link
                to="/nutrient-specialist/nutrient-management/list"
                className="nutrient-specialist-feature-link"
              >
                View List
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default NutrientManagement;