import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import TrackingForm from "../components/form/TrackingForm";
import PregnancyOverview from "../components/form/PregnancyOverview";
import PregnancyProgressBar from "../components/tracking/WeeklyProgessBar";
import JournalSection from "../components/journal/JournalSection";
import BabyDevelopment from "../components/tracking/BabyDevelopment";
import UpcomingAppointments from "../components/tracking/UpcomingAppointments";
import SymptomsAndMood from "../components/tracking/SymptomsAndMood";
import TrimesterChecklists from "../components/tracking/TrimesterChecklists";
import {
  getGrowthDataFromUser,
  createGrowthDataProfile,
  getCurrentWeekGrowthData,
} from "../apis/growthdata-api";
import { createBasicBioMetric } from "../apis/basic-bio-metric-api";
import { getCurrentUser } from "../apis/authentication-api";
import weightIcon from "../assets/icons/weight-hanging-svgrepo-com.svg";
import calculatorIcon from "../assets/icons/calculator-svgrepo-com.svg";
import heartRateIcon from "../assets/icons/heart-pulse-2-svgrepo-com.svg";
import { useSearchParams } from "react-router-dom";
import CheckupReminder from "../components/tracking/CheckupReminder";
import { viewAllOfflineConsultation } from "../apis/offline-consultation-api";
import "../styles/PregnancyTrackingPage.css";

const PregnancyTrackingPage = () => {
  const [selectedWeek, setSelectedWeek] = useState(null);

  const [user, setUser] = useState(null);
  const [pregnancyData, setPregnancyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const tabFromURL =
    (searchParams.get("weeklyinfo") && "weekly") ||
    (searchParams.get("reminderconsultationinfo") && "reminderconsultation") ||
    (searchParams.get("nutritioninfo") && "nutrition") ||
    (searchParams.get("journalinfo") && "journal") ||
    "weekly"; // default

  const [activeTab, setActiveTab] = useState(tabFromURL);

  const [openJournalModal, setOpenJournalModal] = useState(false);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
const [loadingAppointments, setLoadingAppointments] = useState(true);

useEffect(() => {
  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await viewAllOfflineConsultation(userId, null, token);
      const consultations = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const mappedAppointments = consultations.map((c) => {
        const start = new Date(c.startDate);
        const end = new Date(c.endDate);
        return {
          id: c.id,
          name: c.checkupName || "Unknown name",
          note: c.healthNote || "No notes available",
          type: c.consultationType?.toLowerCase(),
          doctor: c.doctor?.fullName || "Unknown Doctor",
          clinic: c.clinic?.name || "Unknown Clinic",
          address: c.clinic?.address,
          start,
          end,
          status: c.status?.toLowerCase(),
        };
      });

      setAppointments(mappedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  fetchAppointments();
}, []);

  const appointmentDates = appointments.map((a) => a.start.toISOString());

  const reminders = [
    {
      title: "Blood Pressure Check",
      startDate: "2023-05-15",
      endDate: "2023-05-15",
      note: "Recommended during week 20",
      type: "recommended",
    },
    {
      title: "Lab Work",
      startDate: "2023-05-25",
      endDate: "2023-05-25",
      note: "Urgent test results follow-up",
      type: "urgent",
    },
  ];

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (activeTab === "journal") {
      setOpenJournalModal(false);
    }
  }, [activeTab]);

  const initializePage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please sign in to access pregnancy tracking");
        navigate("/duedate-calculator");
        return;
      }

      const res = await getCurrentUser(token);
      const userData = res?.data?.data;

      if (!userData || userData.roleId !== 2 || !userData.id) {
        setError("Access denied or user ID missing.");
        setIsLoading(false);
        return;
      }

      setUser(userData);
      localStorage.setItem("userId", userData.id);

      const currentDate = new Date().toISOString().split("T")[0];
      const { data: pregRes } = await getCurrentWeekGrowthData(
        userData.id,
        currentDate,
        token
      );

      if (pregRes?.error === 0 && pregRes?.data) {
        setPregnancyData(pregRes.data);
        setSelectedWeek(pregRes.data.currentGestationalAgeInWeeks);
      } else {
        setPregnancyData(null);
      }
    } catch (err) {
      console.error("Error initializing page:", err);
      setError("Failed to load page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async (formData) => {
    setIsCreating(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const { userId, firstDayOfLastMenstrualPeriod, preWeight, preHeight } =
        formData;

      if (!userId) {
        setError("User ID is missing. Cannot create growth data profile.");
        return;
      }

      // Step 1: Create GrowthData
      const growthDataRes = await createGrowthDataProfile(
        {
          userId,
          firstDayOfLastMenstrualPeriod,
          preWeight,
        },
        token
      );

      if (growthDataRes?.data?.error !== 0) {
        setError(
          growthDataRes?.data?.message || "Failed to create pregnancy profile."
        );
        return;
      }

      let growthDataId = null;

      if (growthDataRes?.data?.data?.id) {
        growthDataId = growthDataRes.data.data.id;
      } else {
        // fallback: fetch growth data manually
        const currentDate = new Date().toISOString().split("T")[0];
        const { data: fallbackRes } = await getCurrentWeekGrowthData(
          userId,
          currentDate,
          token
        );
        if (fallbackRes?.error === 0 && fallbackRes?.data?.id) {
          growthDataId = fallbackRes.data.id;
        } else {
          setError("Could not retrieve newly created growth data profile.");
          return;
        }
      }

      // Step 2: Create BBM
      await createBasicBioMetric(
        {
          GrowthDataId: growthDataId,
          WeightKg: preWeight,
          HeightCm: preHeight,
        },
        token
      );

      // Step 3: Fetch updated pregnancy data
      const currentDate = new Date().toISOString().split("T")[0];
      const { data: pregRes } = await getCurrentWeekGrowthData(
        userId,
        currentDate,
        token
      );

      if (pregRes?.error === 0 && pregRes?.data) {
        setPregnancyData(pregRes.data);
      } else {
        setError(pregRes?.message || "Failed to fetch updated pregnancy data");
      }
    } catch (err) {
      console.error("Error creating profile and biometric:", err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddJournal = () => {
    setOpenJournalModal(true);
  };

  const hasValidPregnancyData =
    pregnancyData &&
    !!pregnancyData.firstDayOfLastMenstrualPeriod &&
    !!pregnancyData.estimatedDueDate;

  if (isLoading) {
    return (
      <div className="pregnancy-tracking-page">
        <Header />
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p>Loading your pregnancy data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pregnancy-tracking-page">
        <Header />
        <main className="main-content">
          <div className="error-container">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="#e74c3c"
                />
              </svg>
            </div>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={initializePage} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pregnancy-tracking-page">
      <Header />
      <main className="main-content">
        <div className="pregnancy-tracking-container">
          {!hasValidPregnancyData ? (
            <div className="tracking-welcome-section">
              <div className="tracking-welcome-header">
                <h1>Welcome to Pregnancy Tracking</h1>
                <p>
                  Start your beautiful journey of motherhood with personalized
                  tracking and insights
                </p>
              </div>
              <TrackingForm
                onSubmit={handleCreateProfile}
                isLoading={isCreating}
                user={user}
              />
            </div>
          ) : (
            <div className="tracking-dashboard">
              <div className="nav-tabs">
                {[
                  {
                    key: "weekly",
                    label: "Weekly Info",
                    queryKey: "weeklyinfo",
                  },
                  {
                    key: "reminderconsultation",
                    label: "Checkup Reminder",
                    queryKey: "reminderconsultationinfo",
                  },
                  {
                    key: "nutrition",
                    label: "Nutrition Tips",
                    queryKey: "nutritioninfo",
                  },
                  {
                    key: "journal",
                    label: "Journal Entries",
                    queryKey: "journalinfo",
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`tab ${activeTab === tab.key ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(tab.key);
                      navigate(
                        `?growthDataId=${pregnancyData?.id}&${tab.queryKey}=true`
                      );
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "weekly" && (
                <div className="tab-content">
                  <PregnancyOverview pregnancyData={pregnancyData} />
                  <PregnancyProgressBar
                    pregnancyData={pregnancyData}
                    selectedWeek={selectedWeek}
                    setSelectedWeek={setSelectedWeek}
                  />
                  <div className="dashboard-grid">
                    <div className="left-column">
                      <BabyDevelopment
                        pregnancyData={pregnancyData}
                        selectedWeek={selectedWeek}
                      />
                      {/* <SymptomsAndMood pregnancyData={pregnancyData} /> */}
                    </div>
                    <div className="right-column">
                      <UpcomingAppointments
                        growthDataId={pregnancyData?.id}
                        userId={localStorage.getItem("userId")}
                        token={localStorage.getItem("token")}
                      />
                      <TrimesterChecklists
                        growthDataId={pregnancyData?.id}
                        token={localStorage.getItem("token")}
                      />
                    </div>
                  </div>
                  {pregnancyData.basicBioMetric && (
                    <div className="biometric-section">
                      <div className="section-header">
                        <h3>Health Metrics</h3>
                        <p>Your current health measurements</p>
                      </div>
                      <div className="biometric-cards">
                        {pregnancyData.basicBioMetric.weightKg > 0 && (
                          <div className="biometric-card">
                            <div className="metric-icon">
                              <img
                                src={weightIcon}
                                alt="Weight"
                                className="bbm-icon"
                              />
                            </div>
                            <div className="metric-info">
                              <span className="metric-value">
                                {pregnancyData.basicBioMetric.weightKg} Kg
                              </span>
                              <span className="metric-label">
                                Current Weight
                              </span>
                            </div>
                          </div>
                        )}
                        {pregnancyData.basicBioMetric.bmi > 0 && (
                          <div className="biometric-card">
                            <div className="metric-icon">
                              <img
                                src={calculatorIcon}
                                alt="BMI"
                                className="bbm-icon"
                              />
                            </div>
                            <div className="metric-info">
                              <span className="metric-value">
                                {pregnancyData.basicBioMetric.bmi.toFixed(1)}
                              </span>
                              <span className="metric-label">BMI</span>
                            </div>
                          </div>
                        )}
                        {(pregnancyData.basicBioMetric.systolicBP > 0 ||
                          pregnancyData.basicBioMetric.diastolicBP > 0) && (
                          <div className="biometric-card">
                            <div className="metric-icon">
                              <img
                                src={heartRateIcon}
                                alt="Heart Rate"
                                className="bbm-icon"
                              />
                            </div>
                            <div className="metric-info">
                              <span className="metric-value">
                                {pregnancyData.basicBioMetric.systolicBP}/
                                {pregnancyData.basicBioMetric.diastolicBP} mmHg
                              </span>
                              <span className="metric-label">
                                Blood Pressure
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "reminderconsultation" && (
                <div className="tab-content">
                  <CheckupReminder
                    token={localStorage.getItem("token")}
                    userId={localStorage.getItem("userId")}
                    reminders={reminders}
                    appointments={appointments}
                    appointmentDates={appointmentDates}
                  />
                  <UpcomingAppointments
                    userId={localStorage.getItem("userId")}
                    token={localStorage.getItem("token")}
                    expanded={true}
                    appointments={appointments}
                  />
                </div>
              )}
              {activeTab === "journal" && (
                <div className="tab-content">
                  <JournalSection
                    journalEntries={[]}
                    growthDataId={pregnancyData?.id}
                    openModal={openJournalModal}
                    setOpenModal={setOpenJournalModal}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PregnancyTrackingPage;
