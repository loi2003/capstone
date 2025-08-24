import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import '../styles/AdvicePage.css';

const AdvicePage = () => {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for submitting the question to an API or backend
    // For now, simulate submission by setting submitted state
    setSubmitted(true);
  };

  return (
    <MainLayout>
      <div className="advice-page">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="advice-section"
        >
          <h1 className="advice-section-title">Quick Advice</h1>
          <p className="advice-section-description">
            Get quick, reliable advice for your pregnancy-related questions. Submit your query below, and our team of experts will provide guidance tailored to your needs.
          </p>

          {!submitted ? (
            <div className="advice-form-container">
              <form onSubmit={handleSubmit} className="advice-form">
                <label htmlFor="question" className="advice-form-label">
                  Your Question
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your pregnancy-related question here..."
                  className="advice-form-textarea"
                  rows="5"
                  required
                />
                <motion.button
                  type="submit"
                  className="advice-submit-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit Question
                </motion.button>
              </form>
              <p className="advice-form-note">
                For immediate or detailed consultations, visit our{' '}
                <Link to="/consultation" className="advice-consultation-link">
                  Consultant Chat
                </Link>{' '}
                page.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="advice-submission-message"
            >
              <h2 className="advice-submission-title">Thank You!</h2>
              <p className="advice-submission-text">
                Your question has been submitted. Our team will respond soon with tailored advice. Check your email or return to this page for updates.
              </p>
              <Link to="/" className="advice-back-home-button">
                Back to Home
              </Link>
            </motion.div>
          )}
        </motion.section>
      </div>
    </MainLayout>
  );
};

export default AdvicePage;