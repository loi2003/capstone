import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import HomePage from '../pages/HomePage';
import SignIn from '../pages/authentication/SignIn';
import SignUp from '../pages/authentication/SignUp';
import AboutPage from '../pages/AboutPage';
import ConsultationPage from '../pages/ConsultationPage';
import CommunityPage from '../pages/CommunityPage';
import DonationPage from '../pages/DonationPage';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermOfService';
import ContactUs from '../pages/ContactUs';
import AdminHomePage from '../pages/admin/AdminHomePage';
import StaffHomePage from '../pages/staff/StaffHomePage';

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/donation" element={<DonationPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/staff" element={<StaffHomePage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default AppRoutes;