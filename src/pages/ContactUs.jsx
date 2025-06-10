import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

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
            <h1 className="secondary-hero-title">Contact Us</h1>
            <p className="secondary-hero-subtitle">
              Support, Communication, Assistance, Accessibility
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
            <h2 className="secondary-section-title">Get in Touch</h2>
            <p className="secondary-section-description">
              We're here to provide <strong>support</strong> and <strong>assistance</strong>. Reach out to us for any inquiries, and we'll respond with clear <strong>communication</strong> to ensure <strong>accessibility</strong>.
            </p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="contact-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="contact-input"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="contact-textarea"
              ></textarea>
              <button type="submit" className="contact-button">Send Message</button>
            </form>
            {isSubmitted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="contact-success"
              >
                Message sent successfully!
              </motion.p>
            )}
            <p className="secondary-section-description">
              Email: support@genderhealthweb.com | Phone: (123) 456-7890
            </p>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ContactUs;