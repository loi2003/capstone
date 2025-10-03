import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import "./SubscriptionCheckout.css";
import { FaCheck, FaCreditCard, FaLock, FaArrowLeft } from "react-icons/fa";
import { getAllSubscriptionPlans } from "../../apis/subscriptionplan-api";
import { createUserSubscription } from "../../apis/user-subscription-api";
import { createCheckoutSession } from "../../apis/payment-api"; // Add this import
import LoadingOverlay from "../popup/LoadingOverlay";

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPlanData();
  }, [planId]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const plansData = await getAllSubscriptionPlans();
      const plan = plansData.find(p => p.id === planId);
      
      if (!plan) {
        setError('Selected subscription plan not found');
        return;
      }
      
      setSelectedPlan(plan);
    } catch (err) {
      console.error('Error fetching plan data:', err);
      setError('Failed to load subscription plan details');
    } finally {
      setLoading(false);
    }
  };

  const formatDescription = (description) => {
    if (!description) return [];
    return description.split(';').map(item => item.trim()).filter(item => item.length > 0);
  };

  const formatDuration = (plan) => {
    if (plan.subscriptionType === 'Lifetime') {
      return '/Lifetime';
    }
    if (plan.durationInDays) {
      if (plan.durationInDays === 30) return '/Month';
      if (plan.durationInDays === 365) return '/Year';
      return `/${plan.durationInDays} days`;
    }
    return plan.subscriptionType ? `/${plan.subscriptionType.toLowerCase()}` : '/Month';
  };

  const formatPrice = (price) => {
    if (price === 0) return '0';
    return price.toLocaleString('vi-VN') + '₫';
  };

  const handleConfirmPayment = async () => {
    if (!token || !selectedPlan) {
      setError('User not authenticated or no plan selected');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Step 1: Create user subscription
      console.log('Creating user subscription...');
      const userSubscriptionResponse = await createUserSubscription(selectedPlan.id, token);
      
      // Extract userSubscriptionId from the response
      const userSubscriptionId = userSubscriptionResponse.id;
      const subscriptionPlanId = userSubscriptionResponse.subscriptionPlanId;
      
      console.log('User subscription created:', {
        userSubscriptionId,
        subscriptionPlanId
      });

      // Step 2: Create checkout session
      console.log('Creating checkout session...');
      const checkoutSessionResponse = await createCheckoutSession(
        subscriptionPlanId,
        userSubscriptionId,
        5, // Default payment method (you can make this configurable)
        token
      );

      // Step 3: Navigate to checkout URL
      const checkoutUrl = checkoutSessionResponse.checkoutUrl;
      
      if (checkoutUrl) {
        console.log('Navigating to checkout URL:', checkoutUrl);
        // Navigate to the external checkout URL
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Checkout URL not provided by payment service');
      }

    } catch (err) {
      console.error('Error in payment flow:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to process payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!selectedPlan) {
    return (
      <div>
        {error ? `Error: ${error}` : 'Plan not found'}
      </div>
    );
  }

  const descriptionItems = formatDescription(selectedPlan.description);
  const salesTax = selectedPlan.price * 0;
  const total = selectedPlan.price + salesTax;

  return (
    <div>
      {/* <Header /> */}
      <main className="subscription-checkout">
        {processing && <LoadingOverlay />}
        
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
          {error && (
            <div className="error-message" style={{ 
              color: '#c33', 
              background: '#fee', 
              padding: '12px', 
              marginBottom: '20px', 
              borderRadius: '4px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <div className="plan-summary">
            <div className="subscription-plan-card">
              <div className="subscription-plan-header">
                <h3>{selectedPlan.subscriptionName} Plan</h3>
                <div className="price">
                  <span className="subscription-plan-price">{formatPrice(selectedPlan.price)}</span>
                  <span className="period">{formatDuration(selectedPlan)}</span>
                </div>
              </div>

              <div className="subscription-plan-features">
                <h4>What's included:</h4>
                <ul>
                  {descriptionItems.map((feature, index) => (
                    <li key={index}>
                      <FaCheck className="feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="billing-summary">
                <h4>Billing Summary</h4>
                <div className="billing-row">
                  <span>
                    1 NestlyCare {selectedPlan.subscriptionName} license plan
                  </span>
                  <span>{formatPrice(selectedPlan.price)}</span>
                </div>
                <div className="billing-row">
                  <span>Sales Tax</span>
                  <span>{formatPrice(salesTax)}₫</span>
                </div>
                <hr />
                <div className="billing-row total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="billing-cycle">
                <span>Billing Cycle: {selectedPlan.subscriptionType || 'Monthly'}</span>
                <div className="toggle-switch"></div>
                <button 
                  type="button" 
                  className="confirm-payment-btn"
                  onClick={handleConfirmPayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Next: Confirm Payment'}
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
