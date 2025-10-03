import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentSuccess.css";
import { FaCheckCircle } from "react-icons/fa";
import { activateUserSubscription } from "../../apis/payment-api";
import { viewUserSubscriptionByUserId } from "../../apis/user-subscription-api";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isActivating, setIsActivating] = useState(true);
  const [activationError, setActivationError] = useState(null);

  // Define plan tier priority
  const planTierPriority = {
    Free: 1,
    free: 1,
    Plus: 2,
    plus: 2,
    Pro: 3,
    pro: 3,
  };

  useEffect(() => {
    const activateSubscription = async () => {
      try {
        // Step 1: Get userId from localStorage
        const userId = localStorage.getItem("userId");

        if (!userId) {
          setActivationError("User not authenticated");
          setIsActivating(false);
          return;
        }

        // Step 2: Fetch user's subscription records
        console.log("Fetching user subscriptions for userId:", userId);
        const userSubscriptions = await viewUserSubscriptionByUserId(userId);

        if (!userSubscriptions || userSubscriptions.length === 0) {
          setActivationError("No subscription found for this user");
          setIsActivating(false);
          return;
        }

        // Step 3: Convert to array and filter subscriptions with status = 0 (pending activation)
        const subscriptions = Array.isArray(userSubscriptions)
          ? userSubscriptions
          : [userSubscriptions];

        const pendingSubscriptions = subscriptions.filter(
          (sub) => sub.status === 0
        );

        if (pendingSubscriptions.length === 0) {
          setActivationError("No pending subscription found to activate");
          setIsActivating(false);
          return;
        }

        // Step 4: Determine the highest-tier PENDING subscription to activate
        // Sort by tier priority (highest tier first)
        const sortedByTier = pendingSubscriptions.sort((a, b) => {
          // Access plan name from nested subscriptionPlan object
          const planNameA = a.subscriptionPlan?.subscriptionName || "";
          const planNameB = b.subscriptionPlan?.subscriptionName || "";

          const tierA = planTierPriority[planNameA] || 0;
          const tierB = planTierPriority[planNameB] || 0;

          return tierB - tierA; // Descending order (highest tier first)
        });

        // Get the highest tier pending subscription
        const targetSubscription = sortedByTier[0];
        const userSubscriptionId = targetSubscription.id;
        const planName =
          targetSubscription.subscriptionPlan?.subscriptionName || "Unknown";

        console.log("Activating subscription:", {
          userSubscriptionId,
          planName: planName,
          tier: planTierPriority[planName],
          previousStatus: targetSubscription.status,
        });

        // Step 5: Activate the subscription (change status from 0 to 1)
        await activateUserSubscription(userSubscriptionId);

        console.log("Subscription activated successfully");
        setIsActivating(false);
      } catch (error) {
        console.error("Failed to activate subscription:", error);
        setActivationError(
          error.response?.data?.message ||
            error.message ||
            "Failed to activate subscription. Please contact support."
        );
        setIsActivating(false);
      }
    };

    activateSubscription();
  }, [searchParams]);
  
  if (isActivating) {
    return (
      <div className="payment-success">
        <div className="payment-success-container">
          <p>Activating your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="payment-success-container">
        <div className="success-icon-container">
          <div className="success-icon-div">
            <FaCheckCircle className="success-icon" />
          </div>
        </div>

        <h1 className="payment-success-header">Payment Successful!</h1>

        <div className="payment-success-details">
          <p className="payment-success-message">
            Thank you! Your payment has been processed successfully.
          </p>
          {/* {activationError && (
            <p
              className="activation-error"
              style={{
                color: "var(--error-color, #dc3545)",
                marginTop: "10px",
              }}
            >
              {activationError}
            </p>
          )} */}
          <div className="transaction-info">
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value success">
                {/* {activationError ? "Completed" : "Completed"} */}
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="payment-success-action-buttons">
          <button
            className="payment-success-btn primary"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
          <button
            className="payment-success-btn secondary"
            onClick={() => navigate("/subscriptionplan")}
          >
            View your Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
