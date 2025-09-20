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
        <div className="checkout-container">
          <div className="checkout-header">
            {/* <h1>Upgrade your subscription</h1> */}
            {/* <div className="step-indicator"> */}
              {/* <span className="step active">1</span>
              <span className="step-text">Payment Information</span> */}
            {/* </div> */}
            <button 
            className="subscription-checkout-back-btn"
            onClick={() => navigate(`/subscriptionplan`)}
          >
            <FaArrowLeft className="btn-icon" />
            <span> Change your Plan</span>
          </button>
          </div>

          <div className="checkout-content">
            {/* Left Side - Plan Summary (moved to left) */}
            <div className="plan-summary">
              <div className="plan-card">
                <div className="plan-header">
                  <h3>{selectedPlan.name} Plan</h3>
                  <div className="plan-price">
                    <span className="price">${selectedPlan.price}</span>
                    <span className="period">{selectedPlan.period}</span>
                  </div>
                </div>

                <div className="plan-features">
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
                    <span>1 NestlyCare {selectedPlan.name} monthly license plan</span>
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
                  <div className="toggle-switch">
                    {/* <span>Annually</span> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Payment Information (moved to right) */}
            <div className="payment-section">
              <div className="payment-header">
                <h2>Payment Information</h2>
                {/* <p>Step 1 of 2</p> */}
              </div>

              <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">
                    Card Number <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <FaCreditCard className="input-icon" />
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1111 1111 1111 1111"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expirationDate">
                      Expiration Date <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="expirationDate"
                      name="expirationDate"
                      placeholder="MM/YY"
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">
                      CVV <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="3 digits"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country">
                      Country <span className="required">*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">
                      ZIP/Postal Code <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      placeholder="90210"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="confirm-payment-btn">
                  <FaLock className="btn-icon" />
                  Next: Confirm Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default SubscriptionCheckout;
