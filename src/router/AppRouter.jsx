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
import HealthExpertHomePage from '../pages/healthexpert/HealthExpertHomePage';
import NutrientSpecialistHomePage from '../pages/nutrientspecialist/NutrientSpecialistHomepage';
import ClinicHomePage from '../pages/clinic/ClinicHomePage';
import BlogManagement from '../pages/BlogManagement';
import ConsultantHomePage from '../pages/consultant/ConsultantHomePage';
import ForgotPassword from '../pages/ForgotPassword';
import BlogCategoryManagement from '../pages/admin/BlogCategoryManagement';
import NotFound from '../pages/error/404NotFound';
import AdminTutorialPage from '../pages/admin/AdminTutorialPage';
import AdminPolicyPage from '../pages/admin/AdminPolicyPage';

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='*' element={<NotFound />} />
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
        <Route path="/health-expert" element={<HealthExpertHomePage />} />
        <Route path="/nutrient-specialist" element={<NutrientSpecialistHomePage />} />
        <Route path="/clinic" element={<ClinicHomePage />} />
        <Route path="/blog-management" element={<BlogManagement />} />
        <Route path="/consultant" element={<ConsultantHomePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/categories" element={<BlogCategoryManagement />} />
        <Route path="/admin/tutorial" element={<AdminTutorialPage />} />
        <Route path="/admin/policy" element={<AdminPolicyPage />} />
      </Routes>
    </ThemeProvider>
  );
};

export default AppRoutes;