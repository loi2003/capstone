import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';

const PrivacyPolicy = () => {
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
            <h1 className="secondary-hero-title">Privacy Policy</h1>
            <p className="secondary-hero-subtitle">
              Confidentiality, Data Protection, User Trust, Transparency
            </p>
          </motion.div>
        </section>

        <section className="secondary-content-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="secondary-content"
          >
            <h2 className="secondary-section-title">Our Commitment to Your Privacy</h2>
            <p className="secondary-section-description">
              At GenderHealthWeb, we prioritize <strong>confidentiality</strong> and <strong>data protection</strong> to ensure <strong>user trust</strong>. This Privacy Policy outlines how we collect, use, and safeguard your personal information with <strong>transparency</strong>.
            </p>
            <h3 className="secondary-section-subtitle">Data Collection</h3>
            <p className="secondary-section-description">
              We collect information you provide, such as email addresses and health data, to enhance your experience. All data is encrypted and stored securely.
            </p>
            <h3 className="secondary-section-subtitle">Data Usage</h3>
            <p className="secondary-section-description">
              Your information is used to personalize services, improve our platform, and communicate updates. We do not share your data without consent.
            </p>
            <h3 className="secondary-section-subtitle">Your Rights</h3>
            <p className="secondary-section-description">
              You have the right to access, modify, or delete your data. Contact us at support@genderhealthweb.com to exercise these rights.
            </p>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;