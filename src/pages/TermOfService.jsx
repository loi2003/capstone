import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';

const TermsOfService = () => {
  React.useEffect(() => {
    console.log('TermsOfService rendered');
  }, []);

  return (
    <MainLayout>
      <div className="secondary-page">
        <section className="secondary-hero-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="secondary-hero-content"
          >
            <h1 className="secondary-hero-title">Terms of Service</h1>
            <p className="secondary-hero-subtitle">
              Agreement, Usage Rules, Responsibility, Fairness
            </p>
          </motion.div>
        </section>

        <section className="secondary-content-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} // Changed from whileInView
            transition={{ duration: 0.6 }}
            className="secondary-content"
          >
            <h2 className="secondary-section-title">Using Our Services</h2>
            <p className="secondary-section-description">
              These Terms of Service outline the <strong>agreement</strong> between you and GenderHealthWeb, ensuring <strong>fairness</strong> and clear <strong>usage rules</strong>. By using our platform, you accept these terms and take <strong>responsibility</strong> for your actions.
            </p>
            <h3 className="secondary-section-subtitle">Account Responsibilities</h3>
            <p className="secondary-section-description">
              You are responsible for maintaining the confidentiality of your account and ensuring accurate information.
            </p>
            <h3 className="secondary-section-subtitle">Acceptable Use</h3>
            <p className="secondary-section-description">
              Use our services respectfully, avoiding any illegal or harmful activities. Violation may result in account suspension.
            </p>
            <h3 className="secondary-section-subtitle">Changes to Terms</h3>
            <p className="secondary-section-description">
              We may update these terms periodically. Continued use of the platform constitutes acceptance of the updated terms.
            </p>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
};

export default TermsOfService;