import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
// import "../../styles/NutrientSpecialistHomePage.css";

const NutritionalGuidance = () => {
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
      <main className="nutrient-specialist-content" style={{ marginLeft: "0" }}>
        <motion.section
          className="nutrient-specialist-banner"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="nutrient-specialist-banner-content">
            <h1 className="nutrient-specialist-banner-title">
              Nutritional Guidance
            </h1>
            <p className="nutrient-specialist-banner-subtitle">
              Discover essential tips and information to maintain a balanced diet and support a healthy pregnancy.
            </p>
            <div className="nutrient-specialist-banner-buttons">
              <Link
                to="/consultation"
                className="nutrient-specialist-banner-button primary"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
          <motion.div
            className="nutrient-specialist-banner-image"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg
              width="200"
              height="200"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Nutrition icon"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                fill="var(--nutrient-specialist-highlight)"
                stroke="var(--nutrient-specialist-primary)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        </motion.section>
        <motion.section
          className="nutrient-specialist-features"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h2 className="nutrient-specialist-features-title">
            Key Nutritional Guidance
          </h2>
          <p className="nutrient-specialist-features-description">
            Learn about essential nutrients and dietary practices to support your health and well-being.
          </p>
          <div className="nutrient-specialist-features-grid">
            <motion.div
              variants={cardVariants}
              className="nutrient-specialist-feature-card"
            >
              <h3>Folic Acid</h3>
              <p>
                Essential for fetal development, folic acid helps prevent neural tube defects. Include leafy greens, fortified cereals, and supplements as recommended.
              </p>
              <Link to="/blog" className="nutrient-specialist-feature-link">
                Learn More
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="nutrient-specialist-feature-card"
            >
              <h3>Iron</h3>
              <p>
                Supports increased blood volume during pregnancy. Consume red meat, spinach, and lentils, paired with vitamin C for better absorption.
              </p>
              <Link to="/blog" className="nutrient-specialist-feature-link">
                Learn More
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="nutrient-specialist-feature-card"
            >
              <h3>Calcium</h3>
              <p>
                Vital for strong bones and teeth for both mother and baby. Include dairy, fortified plant-based milk, and green vegetables in your diet.
              </p>
              <Link to="/blog" className="nutrient-specialist-feature-link">
                Learn More
              </Link>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="nutrient-specialist-feature-card"
            >
              <h3>Balanced Diet Tips</h3>
              <p>
                Aim for a variety of food groups, including fruits, vegetables, whole grains, lean proteins, and healthy fats to meet nutritional needs.
              </p>
              <Link to="/consultation" className="nutrient-specialist-feature-link">
                Get Personalized Advice
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default NutritionalGuidance;