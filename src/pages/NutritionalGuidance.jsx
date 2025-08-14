import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { FaTint } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { AiFillApple } from "react-icons/ai";
import { AiOutlineCheck } from 'react-icons/ai';
import { BsCloud } from 'react-icons/bs';
import "../styles/NutritionalGuidance.css";

const NutritionalGuidance = () => {
  const navigate = useNavigate();
  const trimesters = [
    {
      id: 1,
      title: "First Trimester (Weeks 1–12)",
      highlight:
        "During the first trimester, focus on nutrients that support embryonic development and help manage morning sickness. Small, frequent meals can help with nausea.",
      nutrients: [
        {
          name: "Folic Acid",
          description:
            "Essential for preventing neural tube defects. Aim for 600–800 mcg daily.",
          sources: "Leafy greens, fortified cereals, beans, citrus fruits",
        },
        {
          name: "Iron",
          description:
            "Supports increased blood volume and prevents anemia. Aim for 27mg daily.",
          sources: "Lean red meat, beans, spinach, fortified cereals",
        },
        {
          name: "Vitamin B6",
          description:
            "Helps reduce nausea and supports brain development. Aim for 1.9mg daily.",
          sources: "Chicken, fish, potatoes, bananas, chickpeas",
        },
        {
          name: "Calcium",
          description: "Develops bones and teeth. Aim for 1,000mg daily.",
          sources: "Dairy products, fortified plant milks, leafy greens",
        },
      ],
      embrace: [
        "Whole grains (brown rice, oatmeal) for energy and fiber",
        "Lean proteins (chicken, fish, tofu) for tissue development",
        "Fruits and vegetables for vitamins and minerals",
        "Dairy or fortified plant alternatives for calcium",
        "Ginger tea or crackers to help with morning sickness",
      ],
      avoid: [
        "Alcohol (no safe amount during pregnancy)",
        "High-mercury fish (shark, swordfish, king mackerel)",
        "Raw/undercooked meat, fish, and eggs",
        "Unpasteurized dairy products and juices",
        "Excessive caffeine (limit to 200mg per day)",
      ],
      tips: [
        "Eat small, frequent meals",
        "Keep crackers nearby and eat before getting up",
        "Try ginger tea, ginger candies, or supplements",
        "Stay hydrated with small sips of water",
        "Avoid strong smells and foods that trigger nausea",
      ],
    },
    {
      id: 2,
      title: "Second Trimester (Weeks 13–27)",
      highlight:
        "In the second trimester, focus on calcium and protein to support rapid fetal growth and bone development.",
      nutrients: [
        {
          name: "Protein",
          description:
            "Essential for growth of fetal tissue, including the brain. Aim for ~75–100g daily.",
          sources: "Lean meats, poultry, eggs, legumes, dairy",
        },
        {
          name: "Calcium",
          description: "Strengthens bones and teeth. Aim for 1,000mg daily.",
          sources: "Milk, yogurt, cheese, fortified plant milks",
        },
        {
          name: "Iron",
          description: "Supports oxygen transport and prevents anemia.",
          sources: "Lean red meat, lentils, spinach, fortified cereals",
        },
        {
          name: "Vitamin D",
          description: "Helps absorb calcium and supports immune function.",
          sources: "Sunlight, fatty fish, fortified dairy",
        },
      ],
      embrace: [
        "Dairy or fortified plant-based alternatives",
        "Lean proteins for growth",
        "Iron-rich foods paired with vitamin C for absorption",
        "Fruits and vegetables for fiber and nutrients",
        "Healthy fats like avocado and olive oil",
      ],
      avoid: [
        "Alcohol",
        "High-mercury fish",
        "Unpasteurized dairy",
        "Highly processed junk foods",
      ],
      tips: [
        "Keep snacks like nuts and fruit on hand",
        "Include a variety of colorful vegetables daily",
        "Stay hydrated throughout the day",
      ],
    },
    {
      id: 3,
      title: "Third Trimester (Weeks 28–40)",
      highlight:
        "In the final trimester, your baby's brain is rapidly developing, and weight gain increases. Focus on omega-3s, energy-rich foods, and hydration.",
      nutrients: [
        {
          name: "Omega-3 Fatty Acids",
          description: "Supports brain and eye development.",
          sources: "Salmon, walnuts, chia seeds, flaxseeds",
        },
        {
          name: "Iron",
          description: "Prevents anemia and supports increased blood volume.",
          sources: "Lean meats, beans, spinach",
        },
        {
          name: "Calcium",
          description: "Supports skeletal development.",
          sources: "Dairy products, leafy greens, fortified plant milks",
        },
        {
          name: "Fiber",
          description: "Helps with digestion and prevents constipation.",
          sources: "Whole grains, fruits, vegetables",
        },
      ],
      embrace: [
        "Whole grains for sustained energy",
        "Omega-3 rich foods for brain development",
        "Fruits and vegetables for vitamins and minerals",
        "High-protein snacks",
        "Plenty of water",
      ],
      avoid: [
        "Alcohol",
        "Excessive caffeine",
        "Unpasteurized foods",
        "Raw seafood",
      ],
      tips: [
        "Eat smaller, more frequent meals to avoid heartburn",
        "Include omega-3 sources several times per week",
        "Stay physically active with gentle exercise",
      ],
    },
  ];

  const [selectedTrimester, setSelectedTrimester] = useState(trimesters[0]);
  return (
    <div className="nutrition-page-wrapper">
      <Header />

      {/* Page Heading */}
      <div className="nutrition-heading">
        <h1>Pregnancy Nutrition Guide</h1>
        <p>
          Discover the essential nutrients you need during each stage of your
          pregnancy journey. Our trimester-specific guidance helps ensure you
          and your baby get optimal nutrition.
        </p>
      </div>

      <div className="nutritional-guidance-layout">
        {/* Sidebar */}
        <aside className="nutrition-sidebar">
          <h3>Select Your Trimester</h3>
          {trimesters.map((t) => (
            <button
              key={t.id}
              className={`trimester-btn ${
                selectedTrimester.id === t.id ? "active" : ""
              }`}
              onClick={() => setSelectedTrimester(t)}
            >
              {t.title}
            </button>
          ))}

          <div className="consult-card">
            <h4>Need personalized advice?</h4>
            <p>
              Connect with our nutrition experts for a customized meal plan
              tailored to your needs.
            </p>
            <button className="consult-btn" onClick={() => navigate("/signin")}>
              Sign in now!
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="nutrition-main-content">
          <h2>{selectedTrimester.title} Nutrition Guide</h2>
          <div className="highlight-box">{selectedTrimester.highlight}</div>

          <h3>Key Nutrients</h3>
          <div className="nutrient-grid">
            {selectedTrimester.nutrients.map((n, i) => (
              <div key={i} className="nutrient-card">
                <div className="nutrient-header">
                  <BsCloud className="nutrient-icon" />
                  <h4>{n.name}</h4>
                </div>
                <p>{n.description}</p>
                <small className="nutrient-card-source">
                  <strong>Sources:</strong> {n.sources}
                </small>
              </div>
            ))}
          </div>
          <div className="nutrition-warning-card">
            <h3>Foods to Embrace</h3>
            <ul className="food-list embrace">
              {selectedTrimester.embrace.map((f, i) => (
                <li key={i}>
                  <FaCheckCircle className="icon-embrace" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="nutrition-warning-card">
            <h3>Foods to Avoid</h3>
            <ul className="food-list avoid">
              {selectedTrimester.avoid.map((f, i) => (
                <li key={i}>
                  <MdCancel className="icon-avoid" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <h3>Tips</h3>
          <ul className="food-list tips">
            {selectedTrimester.tips.map((t, i) => (
              <li key={i}>
                <AiOutlineCheck className="icon-check" /> {t}
              </li>
            ))}
          </ul>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default NutritionalGuidance;
