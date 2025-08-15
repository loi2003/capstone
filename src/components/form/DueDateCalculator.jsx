"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import "./DueDateCalculator.css";
import Header from "../header/Header";
import Footer from "../footer/Footer";

const DueDateCalculator = () => {
  const [lmpDate, setLmpDate] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setLmpDate(e.target.value);
    setError("");
    setDueDate(null);
  };

  const calculateDueDate = () => {
    if (!lmpDate) {
      setError("Please select the first day of your last menstrual period");
      return;
    }

    const selectedDate = new Date(lmpDate);
    const today = new Date();

    if (selectedDate > today) {
      setError("Date cannot be in the future");
      return;
    }

    // Add 280 days (40 weeks) to LMP for estimated due date
    const calculatedDueDate = addDays(selectedDate, 280);
    setDueDate(calculatedDueDate);
  };

  const formatDisplayDate = (date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <div className="due-date-calculator">
      {/* <div className="page-wrapper">
        <Header /> */}
        <a href="/" className="due-date-back-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Homepage
        </a>

        <div className="due-date-form-header">
          <div className="due-date-form-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                fill="#04668D"
              />
            </svg>
          </div>
          <h2>Due Date Calculator</h2>
          <p>
            Enter the first day of your last menstrual period to estimate your
            due date
          </p>
        </div>

        <div className="due-date-form-group">
          <label htmlFor="lmp-date">Last Menstrual Period Date *</label>
          <input
            type="date"
            id="lmp-date"
            value={lmpDate}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className={error ? "error" : ""}
          />
          {error && <span className="error-message">{error}</span>}
        </div>

        <button onClick={calculateDueDate} className="calculate-btn">
          Calculate Due Date
        </button>

        {dueDate && (
          <div className="result">
            <h3>Estimated Due Date</h3>
            <p className="due-date">{formatDisplayDate(dueDate)}</p>
            <p>
              Your baby is expected around this date, based on a 28-day cycle
              and 40 weeks of gestation.
            </p>
          </div>
        )}

        <div className="login-prompt">
          <p>
            Want to unlock the full potential of pregnancy tracking?{" "}
            <a href="/signin" className="login-link">
              Log in
            </a>{" "}
            to access personalized insights, journal entries, and more!
          </p>
        </div>
      {/* </div>
      <Footer /> */}
    </div>
  );
};

export default DueDateCalculator;
