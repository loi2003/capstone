import React from "react";
import { useNavigate } from "react-router-dom";
import { MdCancel } from 'react-icons/md';
import "./PaymentCancel.css";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-cancel">
      <div className="payment-cancel-container">
        <div className="cancel-icon-container">
          <div className="cancel-icon-div">
            <MdCancel className="cancel-icon"/>
          </div>
        </div>
        
        <h1 className="payment-cancel-header">Payment Cancelled</h1>
        
        <div className="payment-cancel-details">
          <p className="payment-cancel-message">
            Your payment was cancelled. No charges were made to your account.
          </p>
          
          {/* <div className="help-info">
            <div className="info-box">
              <h3>Need help?</h3>
              <p>If you're experiencing issues with payment, please contact our support team or try a different payment method.</p>
            </div>
          </div> */}
        </div>

        <div className="payment-cancel-action-buttons">
          <button 
            className="payment-cancel-btn primary"
            onClick={() => navigate("/subscriptionplan")}
          >
            Try Again
          </button>
          <button 
            className="payment-cancel-btn secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
