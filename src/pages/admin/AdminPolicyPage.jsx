import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../styles/AdminPolicyPage.css';

const AdminPolicyPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin');
  };

  return (
    <motion.div
      className="admin-policy"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <header className="policy-header">
        <motion.button
          className="policy-back-button"
          onClick={handleBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back to admin dashboard"
        />
        <h1 className="policy-title">Admin Policies</h1>
      </header>
      <motion.section
        className="policy-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        role="region"
        aria-label="Admin policy content"
      >
        <h2>Admin Policy Guidelines</h2>
        <p>
          As an admin, you are responsible for maintaining the integrity and functionality of the blog platform. These policies outline your responsibilities and guidelines.
        </p>
        <h3>1. User Management</h3>
        <p>
          - Only users with <code>roleId: 1</code> are granted admin access.<br />
          - Monitor user activity to prevent unauthorized actions.<br />
          - Suspend or revoke access for users violating platform rules.
        </p>
        <h3>2. Content Management</h3>
        <p>
          - Ensure all blog categories comply with platform standards.<br />
          - Deactivate categories that are outdated or irrelevant.<br />
          - Review content flagged via the Reports page.
        </p>
        <h3>3. Data Privacy</h3>
        <p>
          - Protect user data per the <Link to="/privacy">Privacy Policy</Link>.<br />
          - Do not share sensitive information outside the platform.<br />
          - Use reports to identify and address privacy concerns.
        </p>
        <h3>4. Reporting Issues</h3>
        <p>
          - Use the Reports page (<code>/admin/reports</code>) to submit issues or bugs.<br />
          - Respond promptly to user-reported issues.<br />
          - Escalate critical issues to platform support.
        </p>
        <p>
          For a tutorial on using the admin panel, visit the <Link to="/admin/tutorial">Tutorial</Link> page.
        </p>
      </motion.section>
    </motion.div>
  );
};

export default AdminPolicyPage;