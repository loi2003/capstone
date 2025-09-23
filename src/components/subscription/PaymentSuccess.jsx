import React from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentSuccess.css";
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success">
      <div className="payment-success-container">
        <div className="success-icon-container">
          <div className="success-icon-div">
            <FaCheckCircle className="success-icon"/>
          </div>
        </div>
        
        <h1 className="payment-success-header">Payment Successful!</h1>
        
        <div className="payment-success-details">
          <p className="payment-success-message">
            Thank you! Your payment has been processed successfully.
          </p>
          <div className="transaction-info">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value success">Completed</span>
            </div>
            <div className="info-item">
              <span className="info-label">Transaction ID:</span>
              <span className="info-value">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="payment-success-action-buttons">
          <button 
            className="payment-success-btn primary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
          <button 
            className="payment-success-btn secondary"
            onClick={() => navigate('/subscriptionplan')}
          >
            View your Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
