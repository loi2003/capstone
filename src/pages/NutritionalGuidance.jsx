import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { FaTint } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { AiFillApple } from "react-icons/ai";
import { AiOutlineCheck } from 'react-icons/ai';
import { BsCloud } from 'react-icons/bs';
import ChatBoxPage from "../components/chatbox/ChatBoxPage";
import "../styles/NutritionalGuidance.css";

const NutritionalGuidance = () => {
  const [selectedTrimester, setSelectedTrimester] = useState('first');
  const navigate = useNavigate();

  // Framer Motion variants for enhanced animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const nutritionData = {
    first: {
      title: 'First Trimester',
      subtitle: 'Building the Foundation (Weeks 1-12)',
      nutrients: [
        {
          name: 'Folic Acid',
          description: 'Critical for neural tube development and preventing birth defects. Essential during the first few weeks of pregnancy.',
          sources: 'Leafy greens, fortified cereals, citrus fruits, legumes, asparagus',
          icon: <BsCloud className="nutrient-icon" />
        },
        {
          name: 'Iron',
          description: 'Supports increased blood volume and prevents anemia. Important for oxygen transport to your baby.',
          sources: 'Lean meats, poultry, fish, dried beans, fortified cereals, spinach',
          icon: <FaTint className="nutrient-icon" />
        },
        {
          name: 'Calcium',
          description: 'Essential for developing strong bones and teeth. If you don\'t get enough, your baby will take calcium from your bones.',
          sources: 'Dairy products, fortified plant milks, leafy greens, canned fish with bones',
          icon: <FaCheckCircle className="nutrient-icon" />
        },
        {
          name: 'Protein',
          description: 'Building blocks for your baby\'s cells, especially important for brain development.',
          sources: 'Lean meats, eggs, dairy, legumes, nuts, quinoa, tofu',
          icon: <AiFillApple className="nutrient-icon" />
        }
      ],
      embrace: [
        'Whole grain breads and cereals',
        'Fresh fruits and vegetables',
        'Lean proteins (chicken, fish, eggs)',
        'Dairy products or fortified alternatives',
        'Prenatal vitamins with folic acid',
        'Plenty of water (8-10 glasses daily)'
      ],
      avoid: [
        'Raw or undercooked meats and eggs',
        'High-mercury fish (shark, swordfish)',
        'Unpasteurized dairy products',
        'Alcohol and smoking',
        'Excessive caffeine (limit to 200mg/day)',
        'Raw sprouts and unwashed produce'
      ],
      tips: [
        'Take prenatal vitamins daily, even before conception if possible',
        'Eat small, frequent meals to combat morning sickness',
        'Stay hydrated - dehydration can worsen nausea',
        'Choose nutrient-dense foods when appetite is limited',
        'Cook foods thoroughly to prevent foodborne illness',
        'Listen to your body and rest when needed'
      ]
    },
    second: {
      title: 'Second Trimester',
      subtitle: 'The Golden Period (Weeks 13-26)',
      nutrients: [
        {
          name: 'Iron',
          description: 'Your iron needs increase significantly as blood volume expands. Iron deficiency can lead to fatigue and complications.',
          sources: 'Red meat, poultry, fish, fortified cereals, spinach, lentils',
          icon: <FaTint className="nutrient-icon" />
        },
        {
          name: 'Calcium',
          description: 'Your baby\'s bones are hardening, requiring more calcium. This is crucial for skeletal development.',
          sources: 'Milk, yogurt, cheese, fortified foods, sardines, broccoli',
          icon: <FaCheckCircle className="nutrient-icon" />
        },
        {
          name: 'Omega-3 Fatty Acids',
          description: 'Critical for brain and eye development. DHA is especially important during this period.',
          sources: 'Fatty fish (salmon, sardines), walnuts, flaxseeds, chia seeds',
          icon: <BsCloud className="nutrient-icon" />
        },
        {
          name: 'Vitamin D',
          description: 'Works with calcium for bone development and immune system support.',
          sources: 'Fortified milk, fatty fish, egg yolks, sunlight exposure',
          icon: <AiFillApple className="nutrient-icon" />
        }
      ],
      embrace: [
        'Colorful fruits and vegetables (5-9 servings daily)',
        'Whole grains for sustained energy',
        'Lean proteins at every meal',
        'Healthy fats (avocados, nuts, olive oil)',
        'Iron-rich foods with vitamin C',
        'Regular, balanced meals'
      ],
      avoid: [
        'High-mercury fish and raw seafood',
        'Processed and high-sodium foods',
        'Excessive sugar and refined carbs',
        'Large amounts of caffeine',
        'Alcohol and tobacco products',
        'Foods high in trans fats'
      ],
      tips: [
        'Your appetite should return - focus on quality nutrition',
        'Combine iron-rich foods with vitamin C for better absorption',
        'Start gentle exercise as approved by your doctor',
        'Monitor weight gain - aim for 1-2 pounds per week',
        'Stay active but avoid overheating',
        'Continue prenatal vitamins consistently'
      ]
    },
    third: {
      title: 'Third Trimester',
      subtitle: 'Final Preparations (Weeks 27-40)',
      nutrients: [
        {
          name: 'Iron',
          description: 'Iron needs peak during the third trimester. Your baby is storing iron for the first 6 months of life.',
          sources: 'Lean red meat, poultry, fish, fortified cereals, dried fruits',
          icon: <FaTint className="nutrient-icon" />
        },
        {
          name: 'Calcium',
          description: 'Final bone mineralization occurs. Your baby needs calcium for strong bones and teeth.',
          sources: 'Dairy products, leafy greens, fortified foods, almonds',
          icon: <FaCheckCircle className="nutrient-icon" />
        },
        {
          name: 'Fiber',
          description: 'Helps prevent constipation, which is common in late pregnancy due to hormonal changes.',
          sources: 'Whole grains, fruits, vegetables, legumes, nuts and seeds',
          icon: <AiFillApple className="nutrient-icon" />
        },
        {
          name: 'Protein',
          description: 'Supports rapid fetal growth and prepares your body for breastfeeding.',
          sources: 'Lean meats, fish, eggs, dairy, legumes, nuts, quinoa',
          icon: <BsCloud className="nutrient-icon" />
        }
      ],
      embrace: [
        'Small, frequent meals to avoid heartburn',
        'High-fiber foods for digestive health',
        'Adequate protein for fetal growth',
        'Healthy snacks (fruits, nuts, yogurt)',
        'Foods rich in vitamins K and C',
        'Plenty of fluids for hydration'
      ],
      avoid: [
        'Large meals that can cause discomfort',
        'Spicy or acidic foods if experiencing heartburn',
        'Excessive sweets and empty calories',
        'Raw or undercooked foods',
        'High-sodium processed foods',
        'Lying down immediately after eating'
      ],
      tips: [
        'Eat smaller, more frequent meals to manage heartburn',
        'Include fiber-rich foods to prevent constipation',
        'Stay hydrated but limit fluids before bedtime',
        'Prepare freezer meals for after baby arrives',
        'Continue moderate exercise as tolerated',
        'Get adequate rest and prepare for breastfeeding'
      ]
    }
  };

  const trimesterOptions = [
    { key: 'first', label: 'First Trimester', weeks: '1-12 weeks' },
    { key: 'second', label: 'Second Trimester', weeks: '13-26 weeks' },
    { key: 'third', label: 'Third Trimester', weeks: '27-40 weeks' }
  ];

  const currentData = nutritionData[selectedTrimester];

  return (
    <>
      <Header />
      <div className="nutrition-page-wrapper">
        <motion.div 
          className="nutrition-heading"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1>Nutritional Guidance During Pregnancy</h1>
          <p>
            Proper nutrition during pregnancy is essential for both you and your baby's health. 
            Each trimester brings unique nutritional needs to support your growing baby's development.
          </p>
        </motion.div>

        <motion.div 
          className="nutritional-guidance-layout"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="nutrition-sidebar" variants={itemVariants}>
            <h3>
              {/* <BsCloud style={{ marginRight: '0.5rem', color: 'var(--co-2)' }} /> */}
              Select Trimester
            </h3>
            
            {trimesterOptions.map((option) => (
              <motion.button
                key={option.key}
                className={`trimester-btn ${selectedTrimester === option.key ? 'active' : ''}`}
                onClick={() => setSelectedTrimester(option.key)}
                aria-pressed={selectedTrimester === option.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div>
                  <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                    {option.weeks}
                  </div>
                </div>
              </motion.button>
            ))}

            <motion.div 
              className="consult-card"
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* <FaCircleInfo size={32} style={{ color: 'var(--co-2)', marginBottom: '1rem' }} /> */}
              <h4 style={{ color: 'var(--co-1)', marginBottom: '0.5rem' }}>
                Need Personalized Advice?
              </h4>
              <p>
                Connect with our certified nutritionists for personalized meal plans 
                and dietary recommendations tailored to your specific needs.
              </p>
              <motion.button 
                className="consult-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/consultation')}
              >
                <FaCircleInfo style={{ marginRight: '0.5rem' }} />
                Consult Expert
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div className="nutrition-main-content" variants={itemVariants}>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {currentData.title} Nutrition Guide
            </motion.h2>
            
            <motion.div 
              className="highlight-box"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* <FaCircleInfo className="icon-info" />   */}
              <strong>{currentData.subtitle}:</strong> {currentData.title === 'First Trimester' ? 
                'Focus on foundational nutrients like folic acid and managing morning sickness.' :
                currentData.title === 'Second Trimester' ?
                'Your energy returns - focus on balanced nutrition and steady weight gain.' :
                'Support rapid growth and prepare for breastfeeding with increased nutrients.'
              }
            </motion.div>

            <h3>Key Nutrients</h3>
            <motion.div 
              className="nutrient-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentData.nutrients.map((nutrient, index) => (
                <motion.div 
                  key={index} 
                  className="nutrient-card"
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="nutrient-header">
                    {nutrient.icon}
                    <h4>{nutrient.name}</h4>
                  </div>
                  <p>{nutrient.description}</p>
                  <div className="nutrient-card-source">
                    <strong>Best Sources:</strong> {nutrient.sources}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <h3>Foods to Embrace</h3>
            <motion.ul 
              className="food-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentData.embrace.map((food, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <FaCheckCircle className="icon-embrace" />
                  <span>{food}</span>
                </motion.li>
              ))}
            </motion.ul>

            <h3>Foods to Avoid</h3>
            <motion.ul 
              className="food-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentData.avoid.map((food, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <MdCancel className="icon-avoid" />
                  <span>{food}</span>
                </motion.li>
              ))}
            </motion.ul>

            <h3>Helpful Tips</h3>
            <motion.ul 
              className="food-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentData.tips.map((tip, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <AiOutlineCheck className="icon-check" />
                  <span>{tip}</span>
                </motion.li >
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>

        <motion.div 
          className="contact-icon" 
          role="button" 
          tabIndex={0} 
          aria-label="Contact nutritionist"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onClick={() => navigate('/consultation')}
        >
          <FaCircleInfo size={24} />
        </motion.div>

        <ChatBoxPage />
      </div>
      <Footer />
    </>
  );
};

export default NutritionalGuidance;