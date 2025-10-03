import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "../contexts/ThemeContext";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import SignIn from "../pages/authentication/SignIn";
import SignUp from "../pages/authentication/SignUp";
import AboutPage from "../pages/AboutPage";
import ConsultationPage from "../pages/ConsultationPage";
import CommunityPage from "../pages/CommunityPage";
import DonationPage from "../pages/DonationPage";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermOfService";
import ContactUs from "../pages/ContactUs";
import AdminHomePage from "../pages/admin/AdminHomePage";
import HealthExpertHomePage from "../pages/healthexpert/HealthExpertHomePage";
import HealthExpertTutorial from "../pages/healthexpert/HealthExpertTutorial";
import HealthExpertPolicy from "../pages/healthexpert/HealthExpertPolicy";
import NutrientSpecialistHomePage from "../pages/nutrientspecialist/NutrientSpecialistHomepage";
import NutrientPolicy from "../pages/nutrientspecialist/NutrientPolicy";
import ClinicHomePage from "../pages/clinic/ClinicHomePage";
import BlogManagement from "../pages/BlogManagement";
import AddingBlog from "../pages/AddingBlog";
import ConsultantHomePage from "../pages/consultant/ConsultantHomePage";
import ForgotPassword from "../pages/ForgotPassword";
import BlogCategoryManagement from "../pages/admin/BlogCategoryManagement";
import NotFound from "../pages/error/404NotFound";
import AdminTutorialPage from "../pages/admin/AdminTutorialPage";
import AdminPolicyPage from "../pages/admin/AdminPolicyPage";
import PregnancyTrackingPage from "../pages/PregnancyTrackingPage";
import DueDateCalculator from "../components/form/DueDateCalculator";
import BlogPage from "../pages/BlogPage";
import BlogDetailPage from "../pages/BlogDetailPage";
import AdminAccountManagement from "../pages/admin/AdminAccountManagement";
import JournalSection from "../components/journal/JournalSection";
import JournalEntryDetail from "../components/journal/JournalEntryDetail";
import JournalEntryForm from "../components/form/JournalEntryForm";
import NutrientCategoryManagement from "../pages/nutrientspecialist/NutrientCategoryManagement";
import NutrientManagement from "../pages/nutrientspecialist/NutrientManagement";
import FoodCategoryManagement from "../pages/nutrientspecialist/FoodCategoryManagement";
import FoodManagement from "../pages/nutrientspecialist/FoodManagement";
import AgeGroupManagement from "../pages/nutrientspecialist/AgeGroupManagement";
import AllergyCategoryManagement from "../pages/nutrientspecialist/AllergyCategoryManagement";
import AllergyManagement from "../pages/nutrientspecialist/AllergyManagement";
import NutritionalGuidance from "../pages/NutritionalGuidance";
import ProfilePage from "../pages/ProfilePage";
import SupportPage from "../pages/SupportPage";
import ClinicList from "../pages/clinic/ClinicList";
import ClinicDetail from "../pages/clinic/ClinicDetail";
import OnlineConsultationManagement from "../pages/consultation/OnlineConsultationManagement";
import EditJournalEntryForm from "../components/form/EditJournalEntryForm";
import DishManagement from "../pages/nutrientspecialist/DishManagement";
import SystemMealPlanner from "../components/form/SystemMealPlanner";
import NutrientInFoodManagement from "../pages/nutrientspecialist/NutrientInFoodManagement";
import OfflineConsultationManagement from "../pages/consultation/OfflineConsultationManagement";
import AdvicePage from "../pages/AdvicePage";
import RecommendedNutritionalNeeds from "../components/form/RecommendedNutritionalNeeds";
import NotificationPage from "../pages/NotificationPage";
import FoodWarning from "../components/form/FoodWarning";
import DiseaseManagement from "../pages/nutrientspecialist/DiseaseManagement";
import MealManagement from "../pages/nutrientspecialist/MealManagement";
import WarningManagement from "../pages/nutrientspecialist/WarningManagement";
import EnergySuggestion from "../pages/nutrientspecialist/EnergySuggestion";
import NutrientSuggestion from "../pages/nutrientspecialist/NutrientSuggestion"; // Added import
import ClinicManagement from "../pages/clinic/ClinicManagement";
import SubscriptionPlan from "../components/subscription/SubscriptionPlan";
import SubscriptionCheckout from "../components/subscription/SubscriptionCheckout";
import ConsultationChat from "../components/consultationchat/ConsultationChat";
import MessengerManagement from "../pages/nutrientspecialist/MessengerManagement"; 
import SystemConfigurationManagement from "../pages/admin/SystemConfigurationManagement";
import PaymentManagement from "../pages/admin/PaymentManagement";
import ConsultationManagement from "../components/consultationchat/ConsultationManagement";
import PaymentCancel from "../components/subscription/PaymentCancel";
import PaymentSuccess from "../components/subscription/PaymentSuccess";
import OfflineConsultationDetail from "../pages/consultation/OfflineConsultationDetail";
import OnlineConsultationDetail from "../pages/consultation/OnlineConsultationDetail";
import HealthExpertConsultation from "../pages/healthexpert/HealthExpertConsultation";


const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
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
        <Route path="/admin/tutorial" element={<AdminTutorialPage />} />
        <Route path="/admin/policy" element={<AdminPolicyPage />} />
        <Route path="/admin/system-configuration" element={<SystemConfigurationManagement />} />
        <Route path="/admin/payment-management" element={<PaymentManagement />} />
        <Route path="/health-expert" element={<HealthExpertHomePage />} />
        <Route path="/health-expert/tutorial" element={<HealthExpertTutorial />} />
        <Route path="/health-expert/policy" element={<HealthExpertPolicy />} />
        <Route path="/nutrient-specialist" element={<NutrientSpecialistHomePage />} />
        <Route path="/nutrient-specialist/nutrient-policy" element={<NutrientPolicy />} />
        <Route path="/nutrient-specialist/nutrient-category-management" element={<NutrientCategoryManagement />} />
        <Route path="/nutrient-specialist/nutrient-management" element={<NutrientManagement />} />
        <Route path="/nutrient-specialist/food-category-management" element={<FoodCategoryManagement />} />
        <Route path="/nutrient-specialist/food-management" element={<FoodManagement />} />
        <Route path="/nutrient-specialist/age-group-management" element={<AgeGroupManagement />} />
        <Route path="/nutrient-specialist/allergy-category-management" element={<AllergyCategoryManagement />} />
        <Route path="/nutrient-specialist/allergy-management" element={<AllergyManagement />} />
        <Route path="/nutrient-specialist/dish-management" element={<DishManagement />} />
        <Route path="/nutrient-specialist/disease-management" element={<DiseaseManagement />} />
        <Route path="/nutrient-specialist/meal-management" element={<MealManagement />} />
        <Route path="/nutrient-specialist/nutrient-in-food-management" element={<NutrientInFoodManagement />} />
        <Route path="/nutrient-specialist/warning-management" element={<WarningManagement />} />
        <Route path="/nutrient-specialist/energy-suggestion" element={<EnergySuggestion />} />
        <Route path="/nutrient-specialist/nutrient-suggestion" element={<NutrientSuggestion />} /> 
        <Route path="/nutrient-specialist/messenger-management" element={<MessengerManagement />} /> 
        <Route path="/health-expert/consultation" element={<HealthExpertConsultation />} /> 
        <Route path="/clinic" element={<ClinicHomePage />} />
        <Route path="/duedate-calculator" element={<DueDateCalculator />} />
        <Route path="/pregnancy-tracking" element={<PregnancyTrackingPage />} />
        <Route
          path="/pregnancy-tracking/journal-section"
          element={<JournalSection />}
        />
        <Route
          path="/pregnancy-tracking/journal-section/journal-detail"
          element={<JournalEntryDetail />}
        />
        <Route
          path="/pregnancy-tracking/journal-section/journal-form"
          element={<JournalEntryForm />}
        />
        <Route
          path="/pregnancy-tracking/journal-section/edit-journal-form"
          element={<EditJournalEntryForm />}
        />
        <Route path="/pregnancy-tracking/system-meal-planner" element={<SystemMealPlanner />} />
        <Route path="/pregnancy-tracking/recommended-nutritional-needs" element={<RecommendedNutritionalNeeds />} />
        <Route path="/pregnancy-tracking/nutritional-guidance-foodwarning" element={<FoodWarning />} />
        <Route path="/subscriptionplan" element={<SubscriptionPlan />} />
        <Route path="/checkout/:planId" element={<SubscriptionCheckout />} />

        <Route path="/blog-management" element={<BlogManagement />} />
        <Route path="/blog-management/add" element={<AddingBlog />} />
        <Route path="/consultant" element={<ConsultantHomePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/categories" element={<BlogCategoryManagement />} />
        <Route path="/nutritional-guidance" element={<NutritionalGuidance />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/admin/account-management" element={<AdminAccountManagement />} />
        <Route path="/advice" element={<AdvicePage />} />
        <Route
          path="/blog"
          element={
            <MainLayout>
              <BlogPage />
            </MainLayout>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <MainLayout>
              <BlogDetailPage />
            </MainLayout>
          }
        />
        <Route path="/clinic/list" element={<ClinicList />} />
        <Route path="/clinic/:id" element={<ClinicDetail />} />
        <Route path="/consultation/online-consultation-management" element={<OnlineConsultationManagement />} />
        <Route path="/consultation/offline-consultation-management" element={<OfflineConsultationManagement />} />
        <Route path="/clinic/clinic-management" element={<ClinicManagement />} />
        <Route path="/consultation/consultation-management" element={<ConsultationManagement />} />
        <Route path="/consultation-chat" element={<ConsultationChat />} />
        <Route path="/offline-consultation/:id" element={<OfflineConsultationDetail />} />
        <Route path="/online-consultation/:id" element={<OnlineConsultationDetail />} />

        <Route path="/payment-cancel" element={<PaymentCancel />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </ThemeProvider>
  );
};

export default AppRoutes;