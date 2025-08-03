import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import "../styles/SupportPage.css";

const SupportPage = () => {
  return (
    <MainLayout>
      <div className="support-container">
        <h1 className="support-title">Support</h1>
        <div className="support-content">
          <div className="support-section">
            <h2>Contact Us</h2>
            <p>Email: support@nestlycare.com</p>
            <p>Phone: +1-800-123-4567</p>
            <p>Hours: Monday - Friday, 9 AM - 5 PM</p>
            <Link to="/contact" className="contact-btn">
              Contact Form
            </Link>
          </div>
          <div className="support-section">
            <h2>FAQs</h2>
            <p>Find answers to common questions in our FAQ section.</p>
            <Link to="/faqs" className="faq-link">
              View FAQs
            </Link>
          </div>
          <div className="support-section">
            <h2>Live Chat</h2>
            <p>Chat with our support team for immediate assistance.</p>
            <button className="chat-btn">Start Live Chat</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SupportPage;