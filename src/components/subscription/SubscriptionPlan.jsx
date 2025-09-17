import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SubscriptionPlan.css";
import Footer from "../footer/Footer";
import Header from "../header/Header";
// React Icons imports
import {
  FaCheck,
  FaCrown,
  FaRocket,
  FaUsers,
  FaHeadset,
  FaDatabase,
  FaStar,
  FaInfinity,
  FaUserTie,
  FaArrowRight,
  FaGift,
} from "react-icons/fa";
import { MdWorkspacePremium } from "react-icons/md";
import { BiSupport } from "react-icons/bi";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      { text: "Access to community", icon: <FaCheck /> },
      { text: "Basic support", icon: <FaCheck /> },
      { text: "Limited storage (5GB)", icon: <FaCheck /> },
    ],
    current: true,
    popular: false,
    color: "green",
  },
  {
    name: "Plus",
    price: "$5",
    period: "/month",
    features: [
      { text: "Everything in Free", icon: <FaCheck /> },
      { text: "Priority support", icon: <FaCheck /> },
      { text: "Extra storage (50GB)", icon: <FaCheck /> },
      { text: "Premium templates", icon: <FaCheck /> },
    ],
    current: false,
    popular: true,
    color: "blue",
  },
  {
    name: "Pro",
    price: "$10",
    period: "/month",
    features: [
      { text: "Everything in Plus", icon: <FaCheck /> },
      { text: "1-on-1 consultation", icon: <FaCheck /> },
      { text: "Unlimited storage", icon: <FaCheck /> },
      { text: "Custom integrations", icon: <FaCheck /> },
      { text: "White-label options", icon: <FaCheck /> },
    ],
    current: false,
    popular: false,
    color: "purple",
  },
];

const SubscriptionPlan = () => {
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (planName) => {
    // Simulate API call
    setTimeout(() => {
      navigate(`/checkout/${planName.toLowerCase()}`);
    },);
  };

  return (
    <div className="subscription-wrapper">
      <Header />

      {/* Hero Section */}
      <section className="subscription-hero">
        <div className="hero-content">
          <h1 className="hero-title">Choose Your Perfect Plan</h1>
          <p className="hero-subtitle">
            Unlock powerful features and take your experience to the next level
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="subscriptionplan-container">
        <div className="plans-wrapper">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`plan-card ${plan.current ? "current" : ""} ${
                plan.popular ? "popular" : ""
              } ${hoveredPlan === plan.name ? "hovered" : ""} plan-${
                plan.color
              }`}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <FaStar className="crown-icon" />
                  <span>Most Popular</span>
                </div>
              )}

              {plan.current && (
                <div className="current-badge">
                  <FaCheck className="check-icon" />
                  <span>Current Plan</span>
                </div>
              )}

              <div className="plan-header">
                {/* <div className="plan-icon-wrapper">
                  {plan.icon}
                </div> */}
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`subscribe-btn ${
                  plan.current ? "current-btn" : ""
                } ${plan.popular ? "popular-btn" : ""}`}
                disabled={plan.current}
                onClick={() => !plan.current && handleCheckout(plan.name)}
              >
                {plan.current ? (
                  <>
                    <FaCheck className="btn-icon" />
                    Current Plan
                  </>
                ) : (
                  <>
                    Choose {plan.name}
                    <FaArrowRight className="btn-icon" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* <div className="subscription-footer-info">
          <p className="footer-note">
            <FaCheck className="info-icon" />
            14-day free trial • Cancel anytime • No setup fees
          </p>
        </div> */}
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionPlan;
