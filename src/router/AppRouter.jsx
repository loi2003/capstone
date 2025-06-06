import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SignIn from '../pages/authentication/SignIn';
import SignUp from '../pages/authentication/SignUp';
import AboutPage from '../pages/AboutPage';
// import PregnancyPage from '../pages/PregnancyPage';
// import NutritionalGuidancePage from '../pages/NutritionalGuidancePage';
import ConsultationPage from '../pages/ConsultationPage';
import CommunityPage from '../pages/CommunityPage';
import DonationPage from '../pages/DonationPage';
// import FindProviderPage from '../pages/FindProviderPage';
// import HealthAssessmentPage from '../pages/HealthAssessmentPage';
// import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
// import TermsOfServicePage from '../pages/TermsOfServicePage';
// import ContactUsPage from '../pages/ContactUsPage';
// import AssessmentPage from '../pages/AssessmentPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/about" element={<AboutPage />} />
    {/* <Route path="/pregnancy" element={<PregnancyPage />} />
    <Route path="/nutritional-guidance" element={<NutritionalGuidancePage />} /> */}
    <Route path="/consultation" element={<ConsultationPage />} />
    <Route path="/community" element={<CommunityPage />} />
    <Route path="/donation" element={<DonationPage />} />
    {/* <Route path="/find-provider" element={<FindProviderPage />} />
    <Route path="/health-assessment" element={<HealthAssessmentPage />} />
    <Route path="/privacy" element={<PrivacyPolicyPage />} />
    <Route path="/terms" element={<TermsOfServicePage />} />
    <Route path="/contact" element={<ContactUsPage />} />
    <Route path="/assessment" element={<AssessmentPage />} /> */}
  </Routes>
);

export default AppRoutes;