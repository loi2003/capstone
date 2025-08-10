import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser } from "../../apis/authentication-api";
import "../../styles/NutrientSpecialistHomePage.css";

const FoodManagement = () => {
  const [user, setUser] = useState(null);
  const [foods, setFoods] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && Number(userData.roleId) === 4) {
          setUser(userData);
          // Placeholder: Fetch foods (API call would go here)
          setFoods([
            { id: 1, name: "Apple", category: "Fruits" },
            { id: 2, name: "Broccoli", category: "Vegetables" },
            { id: 3, name: "Rice", category: "Grains" },
          ]);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin", { replace: true });
      }
    };
    fetchUser();
  }, [navigate]);

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="nutrient-specialist-content"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <section className="nutrient-specialist-banner">
        <motion.div
          className="nutrient-specialist-banner-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="nutrient-specialist-banner-title">
            Food Management
          </h1>
          <p className="nutrient-specialist-banner-subtitle">
            Manage food items and their nutritional information.
          </p>
        </motion.div>
      </section>
      <motion.section
        className="nutrient-specialist-features"
        variants={containerVariants}
      >
        <h2 className="nutrient-specialist-features-title">
          Food Items
        </h2>
        <p className="nutrient-specialist-features-description">
          Add, edit, or remove food items to maintain nutritional data.
        </p>
        <motion.div
          className="nutrient-specialist-features-grid"
          variants={containerVariants}
        >
          {foods.map((food) => (
            <motion.div
              key={food.id}
              variants={itemVariants}
              className="nutrient-specialist-feature-card"
            >
              <h3>{food.name}</h3>
              <p>Category: {food.category}</p>
              <button className="nutrient-specialist-feature-link">
                Edit
              </button>
              <button className="nutrient-specialist-feature-link">
                Delete
              </button>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default FoodManagement;