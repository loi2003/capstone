import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SubscriptionPlan.css";
import Footer from "../footer/Footer";
import Header from "../header/Header";
import { FaCheck, FaStar, FaArrowRight } from "react-icons/fa";
import { getAllSubscriptionPlans } from "../../apis/subscriptionplan-api";
import { viewUserSubscriptionByUserId } from "../../apis/user-subscription-api";
import LoadingOverlay from "../popup/LoadingOverlay";

const SubscriptionPlan = () => {
  const navigate = useNavigate();
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Define plan tier priority (same as PaymentSuccess)
  const planTierPriority = {
    'Free': 1,
    'free': 1,
    'Plus': 2,
    'plus': 2,
    'Pro': 3,
    'pro': 3
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all subscription plans using the proper API function
      const plansData = await getAllSubscriptionPlans();
      // Filter only active plans
      const activePlans = plansData.filter((plan) => plan.isActive);
      setSubscriptionPlans(activePlans);

      // Fetch user subscription using the proper API function
      // Only attempt if userId exists and is valid
      if (userId && userId !== "null" && userId.trim() !== "") {
        try {
          console.log("Fetching user subscription for userId:", userId);
          const userSubData = await viewUserSubscriptionByUserId(userId);
          console.log("User subscription data:", userSubData);

          // Apply tier priority logic to determine the correct active subscription
          if (userSubData && userSubData.length > 0) {
            // Filter active subscriptions (status = 1 or status = "Active")
            const activeSubscriptions = Array.isArray(userSubData)
              ? userSubData.filter((sub) => sub.status === 1 || sub.status === "Active")
              : [];

            if (activeSubscriptions.length > 0) {
              // Sort by tier priority (highest tier first)
              const sortedByTier = activeSubscriptions.sort((a, b) => {
                // Access plan name from nested subscriptionPlan object
                const planNameA = a.subscriptionPlan?.subscriptionName || '';
                const planNameB = b.subscriptionPlan?.subscriptionName || '';

                const tierA = planTierPriority[planNameA] || 0;
                const tierB = planTierPriority[planNameB] || 0;

                return tierB - tierA; // Descending order (highest tier first)
              });

              // Set the highest tier subscription as the user's current subscription
              const highestTierSubscription = sortedByTier[0];
              const planName = highestTierSubscription.subscriptionPlan?.subscriptionName || 'Unknown';

              console.log("Selected highest tier subscription:", {
                id: highestTierSubscription.id,
                planName: planName,
                tier: planTierPriority[planName]
              });

              setUserSubscription(highestTierSubscription);
            } else {
              setUserSubscription(null);
            }
          } else {
            setUserSubscription(null);
          }
        } catch (userSubError) {
          // Handle different types of errors
          console.warn("Error fetching user subscription:", userSubError);

          if (userSubError.response) {
            // API returned an error response
            const status = userSubError.response.status;
            if (status === 400) {
              console.warn("Bad request - possibly invalid userId format");
            } else if (status === 404) {
              console.warn("User subscription not found");
            } else {
              console.warn(`API error with status ${status}`);
            }
          }

          // Default to no subscription regardless of error type
          setUserSubscription(null);
        }
      } else {
        console.warn("No valid userId found, defaulting to Free plan");
        setUserSubscription(null);
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError(err.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = (planId) => {
    navigate(`/checkout/${planId}`);
  };

  const isUserCurrentPlan = (planId) => {
    // Check if this is the user's exact current plan
    if (userSubscription && userSubscription.subscriptionPlanId) {
      return userSubscription.subscriptionPlanId === planId;
    }

    // If no user subscription, only Free plan is current
    const freePlan = subscriptionPlans.find(
      (plan) =>
        plan.subscriptionName.toLowerCase() === "free" || plan.price === 0
    );
    return freePlan && freePlan.id === planId;
  };

  const formatDescription = (description) => {
    if (!description) return [];
    return description
      .split(";")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const formatDuration = (plan) => {
    if (plan.subscriptionType === "Lifetime") {
      return "/Lifetime";
    }
    if (plan.durationInDays) {
      if (plan.durationInDays === 30) return "/Month";
      if (plan.durationInDays === 365) return "/Year";
      return `/${plan.durationInDays} days`;
    }
    return plan.subscriptionType
      ? `/${plan.subscriptionType.toLowerCase()}`
      : "/Month";
  };

  const formatPrice = (price) => {
    if (price === 0) return "0₫";

    const vndPrice = price;
    // Format VND with thousand separators
    return vndPrice.toLocaleString("vi-VN") + "₫";
  };

  const getPlanColor = (plan) => {
    // Assign colors based on plan name for consistency
    const planName = plan.subscriptionName.toLowerCase();
    if (planName === "free") return "green";
    if (planName === "plus") return "blue";
    if (planName === "pro") return "purple";
    return "orange"; // fallback for other plans
  };

  const isPlanPopular = (plan) => {
    // Mark the Plus plan as popular
    return plan.subscriptionName.toLowerCase() === "plus";
  };

  // Sort plans to ensure Free plan is first
  const sortedPlans = [...subscriptionPlans].sort((a, b) => {
    const aIsFree =
      a.subscriptionName.toLowerCase() === "free" || a.price === 0;
    const bIsFree =
      b.subscriptionName.toLowerCase() === "free" || b.price === 0;

    if (aIsFree && !bIsFree) return -1; // Free plan first
    if (!aIsFree && bIsFree) return 1;

    // For non-free plans, sort by price (ascending)
    return a.price - b.price;
  });

  const hasAccessToPlan = (planId) => {
    // If user has a subscription, check plan hierarchy
    if (userSubscription && userSubscription.subscriptionPlan) {
      const userPlanName =
        userSubscription.subscriptionPlan.subscriptionName.toLowerCase();
      const targetPlan = subscriptionPlans.find((plan) => plan.id === planId);

      if (!targetPlan) return false;

      const targetPlanName = targetPlan.subscriptionName.toLowerCase();

      // Define plan hierarchy (higher plans include lower plan benefits)
      const planHierarchy = ["free", "plus", "pro"];
      const userPlanIndex = planHierarchy.indexOf(userPlanName);
      const targetPlanIndex = planHierarchy.indexOf(targetPlanName);

      // User has access if their plan is equal or higher in hierarchy
      return userPlanIndex >= targetPlanIndex;
    }

    // If no subscription, only has access to free plan
    const targetPlan = subscriptionPlans.find((plan) => plan.id === planId);
    return (
      targetPlan &&
      (targetPlan.subscriptionName.toLowerCase() === "free" ||
        targetPlan.price === 0)
    );
  };

  if (loading) {
    return (
      <div className="subscription-wrapper">
        <Header />
        <LoadingOverlay show={loading} />
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-wrapper">
        <Header />
        <p>Error loading subscription plans: {error}</p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="subscription-wrapper">
      <Header />

      {/* Hero Section */}
      <section className="subscription-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Choose Your <span>Perfect Plan</span>
          </h1>
          <p className="hero-subtitle">
            Unlock powerful features and take your experience to the next level
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="subscriptionplan-container">
        <div className="plans-wrapper">
          {sortedPlans.map((plan, index) => {
            const isCurrentPlan = isUserCurrentPlan(plan.id);
            const isPopular = isPlanPopular(plan);
            const planColor = getPlanColor(plan);
            const descriptionItems = formatDescription(plan.description);

            return (
              <div
                key={plan.id}
                className={`plan-card ${isCurrentPlan ? "current" : ""} ${
                  isPopular ? "popular" : ""
                } ${
                  hoveredPlan === plan.id ? "hovered" : ""
                } plan-${planColor}`}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {isPopular && (
                  <div className="popular-badge">
                    <FaStar className="crown-icon" />
                    <span>Most Popular</span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="current-badge">
                    <FaCheck className="check-icon" />
                    <span>Current Plan</span>
                  </div>
                )}

                <div className="plan-header">
                  <h3 className="plan-name">{plan.subscriptionName}</h3>
                  <div className="plan-price">
                    <span className="price-amount">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="price-period">{formatDuration(plan)}</span>
                  </div>
                </div>

                <button
                  className={`subscribe-btn ${
                    isCurrentPlan
                      ? "current-btn"
                      : hasAccessToPlan(plan.id)
                      ? "included-btn"
                      : isPopular
                      ? "popular-btn"
                      : ""
                  }`}
                  disabled={isCurrentPlan || hasAccessToPlan(plan.id)}
                  onClick={() => {
                    if (!isCurrentPlan && !hasAccessToPlan(plan.id)) {
                      handleCheckout(plan.id);
                    }
                  }}
                >
                  {isCurrentPlan ? (
                    <>
                      <FaCheck className="btn-icon" />
                      Current Plan
                    </>
                  ) : hasAccessToPlan(plan.id) ? (
                    <>
                      <FaCheck className="btn-icon" />
                      Included
                    </>
                  ) : (
                    <>
                      Choose {plan.subscriptionName}
                      <FaArrowRight className="btn-icon" />
                    </>
                  )}
                </button>

                <ul className="plan-features">
                  {descriptionItems.map((feature, idx) => (
                    <li key={idx} className="feature-item">
                      <span className="feature-icon">
                        <FaCheck />
                      </span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {subscriptionPlans.length === 0 && (
          <div className="no-plans-message">
            <p>No subscription plans available at this time.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionPlan;