import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import "./DueDateCalculator.css";

const DueDateCalculator = () => {
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateDueDate = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!lastPeriodDate) {
      setError("Please enter the first day of your last menstrual period.");
      return;
    }

    const inputDate = new Date(lastPeriodDate);
    const currentDate = new Date();
    
    if (inputDate > currentDate) {
      setError("The date cannot be in the future.");
      return;
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    
    if (inputDate < oneYearAgo) {
      setError("Please enter a date within the last year.");
      return;
    }

    setIsCalculating(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      // Calculate due date (280 days from LMP)
      const calculatedDueDate = new Date(inputDate);
      calculatedDueDate.setDate(calculatedDueDate.getDate() + 280);
      
      setDueDate(calculatedDueDate);
      setIsCalculating(false);
    }, 800);
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    return getTodayDate();
  };

  const getMinDate = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return oneYearAgo.toISOString().split('T')[0];
  };

  return (
    <div className="page-wrapper">\
    <Header />
      <div className="page-content">
        <div className="due-date-calculator">

          <div className="due-date-form-header">
            {/* <FaCalendarAlt size={48} color="#04668d" /> */}
            <h2>Due Date Calculator</h2>
            <p>
              Enter the first day of your last menstrual period to estimate your due date
            </p>
          </div>

          <form onSubmit={calculateDueDate}>
            <div className="due-date-form-group">
              <label htmlFor="lastPeriodDate">
                First Day of Last Menstrual Period (LMP)
              </label>
              <input
                type="date"
                id="lastPeriodDate"
                value={lastPeriodDate}
                onChange={(e) => {
                  setLastPeriodDate(e.target.value);
                  setError("");
                  setDueDate(null);
                }}
                min={getMinDate()}
                max={getMaxDate()}
                className={error && !lastPeriodDate ? "error" : ""}
                placeholder="Select date..."
                aria-describedby={error ? "error-message" : undefined}
              />
              {error && (
                <span id="error-message" className="error-message" role="alert">
                  {error}
                </span>
              )}
            </div>

            <button 
              type="submit" 
              className="calculate-btn"
              disabled={isCalculating}
              aria-label={isCalculating ? "Calculating due date..." : "Calculate due date"}
            >
              {isCalculating ? "Calculating..." : "Calculate Due Date"}
            </button>
          </form>

          {dueDate && (
            <div className="result" role="region" aria-label="Due date result">
              <h3>Estimated Due Date</h3>
              <div className="due-date" aria-label={`Due date is ${formatDisplayDate(dueDate)}`}>
                {formatDisplayDate(dueDate)}
              </div>
              <p>
                Your baby is expected around this date, based on a 28-day cycle and 40 weeks of gestation.
              </p>
              
              <div className="login-prompt">
                Want to unlock the full potential of pregnancy tracking?{" "}
                <Link to="/signin" className="login-link">
                  Log in to access personalized insights, journal entries, and more!
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DueDateCalculator;
