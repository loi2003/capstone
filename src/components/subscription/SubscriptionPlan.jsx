import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SubscriptionPlan.css";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import { FaCheck, FaStar, FaArrowRight } from "react-icons/fa";
// import { plans } from "./Plan";

const SubscriptionPlan = () => {
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const handleCheckout = (planId) => {
    navigate(`/checkout/${planId}`);
  };
  const plans = [
    {
      id: "1",
      name: "Free",
      price: "$0",
      period: "USD/month",
      features: [
        { text: "Access to community", icon: <FaCheck /> },
        { text: "Pregnancy Tracking", icon: <FaCheck /> },
        { text: "Access Most Of Nutritional Guidance", icon: <FaCheck /> },
        { text: "Access AI Assistant", icon: <FaCheck /> },
        { text: "Basic Support", icon: <FaCheck /> },
      ],
      current: true,
      popular: false,
      color: "green",
    },
    {
      id: "2",
      name: "Plus",
      price: "$5",
      period: "USD/month",
      features: [
        { text: "Everything in Free", icon: <FaCheck /> },
        { text: "Consultation Booking", icon: <FaCheck /> },
        { text: "Custom Meal Planner", icon: <FaCheck /> },
      ],
      current: false,
      popular: true,
      color: "blue",
    },
    {
      id: "3",
      name: "Pro",
      price: "$55",
      period: "USD/year",
      features: [
        { text: "Everything in Plus", icon: <FaCheck /> },
        { text: "Billed annually", icon: <FaCheck /> },
      ],
      current: false,
      popular: false,
      color: "purple",
    },
  ];
  return (
    <div className="subscription-wrapper">
      <Header />

      {/* Hero Section */}
      <section className="subscription-hero">
        <div className="hero-content">
          <h1 className="hero-title">Choose Your  <span>Perfect Plan</span></h1>
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
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
              </div>
              <button
                className={`subscribe-btn ${
                  plan.current ? "current-btn" : ""
                } ${plan.popular ? "popular-btn" : ""}`}
                disabled={plan.current}
                onClick={() => !plan.current && handleCheckout(plan.id)}
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

              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="feature-icon">{feature.icon}</span>
                    <span className="feature-text">{feature.text}</span>
                  </li>
                ))}
              </ul>

              
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionPlan;
