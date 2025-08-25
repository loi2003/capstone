import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import MainLayout from "../layouts/MainLayout";
import "../styles/ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Scroll to top on component mount to ensure full content is visible
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // EmailJS configuration
    const serviceID = "service_jsmlf4m"; // Replace with your EmailJS Service ID
    const templateID = "template_8lxpzxe"; // Replace with your EmailJS Template ID
    const userID = "lZSMJD9A6TAAeHelq"; // Replace with your EmailJS User ID

    // Prepare the email parameters
    const emailParams = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      to_email: "loitntse171276@fpt.edu.vn", // Your email address
    };

    // Send email using EmailJS
    emailjs.send(serviceID, templateID, emailParams, userID)
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        setIsSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setIsSubmitted(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to send email:", err);
        setError("Failed to send message. Please try again later.");
        setTimeout(() => setError(null), 3000);
      });
  };

  return (
    <MainLayout>
      <div className="contact-page">
        {/* Hero Section */}
        <section className="contact-hero">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="contact-hero-content"
          >
            <h1 className="contact-hero-title">Contact Us</h1>
            <p className="contact-hero-subtitle">
              Support • Communication • Assistance • Accessibility
            </p>
          </motion.div>
        </section>

        {/* Form Section */}
        <section className="contact-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="contact-box"
          >
            <h2 className="contact-title">Get in Touch</h2>
            <p className="contact-description">
              We’re here to provide <strong>support</strong> and{" "}
              <strong>assistance</strong>. Reach out for any inquiries, and our
              team will reply with clear <strong>communication</strong> to ensure{" "}
              <strong>accessibility</strong>.
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
              <button type="submit" className="contact-button">
                Send Message
              </button>
            </form>

            {isSubmitted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="contact-success"
              >
                ✅ Message sent successfully!
              </motion.p>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="contact-error"
              >
                ❌ {error}
              </motion.p>
            )}

            <div className="contact-info">
              <p>Email: support@genderhealthweb.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </motion.div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ContactUs;