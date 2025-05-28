import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import SignIn from '../components/authentication/SignIn';
import SignUp from '../components/authentication/SignUp';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/health-a-z" element={<div>Health A-Z Page</div>} />
    <Route path="/gender-care" element={<div>Gender Care Page</div>} />
    <Route path="/conditions" element={<div>Conditions Page</div>} />
    <Route path="/treatments" element={<div>Treatments Page</div>} />
    <Route path="/resources" element={<div>Resources Page</div>} />
    <Route path="/find-provider" element={<div>Find a Provider Page</div>} />
    <Route path="/health-assessment" element={<div>Health Assessment Page</div>} />
    <Route path="/about" element={<div>About Us Page</div>} />
    <Route path="/privacy" element={<div>Privacy Policy Page</div>} />
    <Route path="/terms" element={<div>Terms of Service Page</div>} />
    <Route path="/contact" element={<div>Contact Us Page</div>} />
    <Route path="/assessment" element={<div>Assessment Page</div>} />
  </Routes>
);

export default AppRoutes;