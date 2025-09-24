import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import "./SubscriptionCheckout.css";
import { FaCheck, FaCreditCard, FaLock, FaArrowLeft } from "react-icons/fa";

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const { planId } = useParams();

  const [formData, setFormData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    country: "United States",
    zipCode: "",
  });

  // Example plan data
  const plans = [
    {
      id: "1",
      name: "Free",
      price: 0,
      period: "/month",
      features: [
        { text: "Access to community", icon: FaCheck },
        { text: "Pregnancy Tracking", icon: FaCheck },
        { text: "Access Most Of Nutritional Guidance", icon: FaCheck },
        { text: "Access AI Assistant", icon: FaCheck },
        { text: "Basic Support", icon: FaCheck },
      ],
    },
    {
      id: "2",
      name: "Plus",
      price: 5,
      period: "/month",
      features: [
        { text: "Everything in Free", icon: FaCheck },
        { text: "Consultation Booking", icon: FaCheck },
        { text: "Custom Meal Planner", icon: FaCheck },
      ],
    },
    {
      id: "3",
      name: "Pro",
      price: 55,
      period: "/year",
      features: [
        { text: "Everything in Plus", icon: FaCheck },
        { text: "Billed annually", icon: FaCheck },
      ],
    },
  ];

  const selectedPlan = plans.find((plan) => plan.id === planId);

  if (!selectedPlan) {
    return <div>Plan not found</div>;
  }

  //   const salesTax = selectedPlan.price * 0.1;
  const salesTax = selectedPlan.price * 0;
  const total = selectedPlan.price + salesTax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle payment processing here
    console.log("Processing payment...", formData);
  };

  return (
    <div>
      {/* <Header /> */}
      <main className="subscription-checkout">
        <div className="checkout-header">
            <button
              className="subscription-checkout-back-btn"
              onClick={() => navigate(`/subscriptionplan`)}
            >
              <FaArrowLeft className="btn-icon" />
              <span> Change your Plan</span>
            </button>
          </div>
        <div className="checkout-content">
          
          <div className="plan-summary">
            <div className="subscription-plan-card">
              <div className="subscription-plan-header">
                <h3>{selectedPlan.name} Plan</h3>
                <div className="price">
                  <span className="subscription-plan-price">${selectedPlan.price}</span>
                  <span className="period">USD{selectedPlan.period}</span>
                </div>
              </div>

              <div className="subscription-plan-features">
                <h4>What's included:</h4>
                <ul>
                  {selectedPlan.features.map((feature, index) => (
                    <li key={index}>
                      <FaCheck className="feature-icon" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="billing-summary">
                <h4>Billing Summary</h4>
                <div className="billing-row">
                  <span>
                    1 NestlyCare {selectedPlan.name} monthly license plan
                  </span>
                  <span>${selectedPlan.price}.00 USD</span>
                </div>
                <div className="billing-row">
                  <span>Sales Tax</span>
                  <span>${salesTax.toFixed(2)} USD</span>
                </div>
                <hr />
                <div className="billing-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="billing-cycle">
                <span>Billing Cycle: Monthly</span>
                <div className="toggle-switch"></div>
                <button type="submit" className="confirm-payment-btn">
                  Next: Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionCheckout;
