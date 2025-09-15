import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
import SystemMealPlanner from "../components/form/SystemMealPlanner";
import CustomMealPlanner from "../components/form/CustomMealPlanner";
import RecommendedNutritionalNeeds from "../components/form/RecommendedNutritionalNeeds";
import WeightGainChart from "../components/tracking/WeightGainChart";
import { getJournalByGrowthDataId } from "../apis/journal-api";
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
import CheckupReminder from "../components/tracking/CheckupReminder";
import { viewAllOfflineConsultation } from "../apis/offline-consultation-api";
import ChatBoxPage from "../components/chatbox/ChatBoxPage";
import { FaCube } from "react-icons/fa6";
import { FaHandHoldingHeart } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import "../styles/PregnancyTrackingPage.css";
import FoodWarning from "../components/form/FoodWarning";
import LoadingOverlay from "../components/popup/LoadingOverlay";
import { NotificationContext } from "../contexts/NotificationContext";

const PregnancyTrackingPage = () => {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [user, setUser] = useState(null);
  const [pregnancyData, setPregnancyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [mealPlannerType, setMealPlannerType] = useState("system");

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    (searchParams.get("weeklyinfo") && "weekly") ||
      (searchParams.get("reminderconsultationinfo") &&
        "reminderconsultation") ||
      (searchParams.get("mealplannerinfo") && "mealplanner") ||
      (searchParams.get("recommendednutritionalneedsinfo") &&
        "recommendednutritionalneeds") ||
      (searchParams.get("journalinfo") && "journal") ||
      "weekly"
  );
  const [openJournalModal, setOpenJournalModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [journals, setJournals] = useState([]);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const token = localStorage.getItem("token");
        const growthDataId = localStorage.getItem("growthDataId");

        const { data } = await getJournalByGrowthDataId(growthDataId, token);
        if (data?.error === 0 && Array.isArray(data?.data)) {
          setJournals(data.data);
        } else {
          setJournals([]);
        }
      } catch (err) {
        console.error("Error fetching journals:", err);
        setJournals([]);
      }
    };

    if (pregnancyData?.id) {
      fetchJournals();
    }
  }, [pregnancyData?.id]);

  const getAbnormalStatus = (bio) => {
    const results = {};

    // Blood Pressure
    if (bio?.systolicBP && bio?.diastolicBP) {
      const sys = bio.systolicBP;
      const dia = bio.diastolicBP;
      if (sys >= 160 || dia >= 110) {
        results.bloodPressure = {
          abnormal: true,
          message: `Blood Pressure ${sys}/${dia}: severe range (≥160/110). Seek urgent care.`,
        };
      } else if (sys >= 140 || dia >= 90) {
        results.bloodPressure = {
          abnormal: true,
          message: `Blood Pressure ${sys}/${dia}: elevated range (≥140/90)`,
        };
      } else if (sys < 90 || dia < 60) {
        results.bloodPressure = {
          abnormal: true,
          message: `Blood Pressure ${sys}/${dia}: hypotension`,
        };
      }
    }

    // Blood Sugar
    if (bio?.bloodSugarLevelMgDl) {
      const sugar = bio.bloodSugarLevelMgDl;
      if (sugar > 95) {
        results.bloodSugarLevelMgDl = {
          abnormal: true,
          message: `Blood Sugar Level ${sugar}: above pregnancy target (>95)`,
        };
      } else if (sugar < 70) {
        results.bloodSugarLevelMgDl = {
          abnormal: true,
          message: `Blood Sugar Level ${sugar}: hypoglycemia (<70)`,
        };
      }
    }

    // Heart Rate
    if (bio?.heartRateBPM) {
      const hr = bio.heartRateBPM;
      if (hr > 110) {
        results.heartRateBPM = {
          abnormal: true,
          message: `Heart Rate ${hr}: elevated (>110)`,
        };
      } else if (hr < 50) {
        results.heartRateBPM = {
          abnormal: true,
          message: `Heart Rate ${hr}: bradycardia (<50)`,
        };
      }
    }

    // BMI
    if (bio?.weightKg && bio?.heightCm) {
      const bmi = bio.weightKg / Math.pow(bio.heightCm / 100, 2);
      if (bmi < 18.5) {
        results.bmi = {
          abnormal: true,
          message: `BMI ${bmi.toFixed(1)}: underweight`,
        };
      } else if (bmi >= 30) {
        results.bmi = {
          abnormal: true,
          message: `BMI ${bmi.toFixed(
            1
          )}: obesity (≥30) increases pregnancy risks`,
        };
      }
    }

    return results;
  };

  const abnormalStatus = pregnancyData?.basicBioMetric
    ? getAbnormalStatus(pregnancyData.basicBioMetric)
    : {};

  const abnormalMessages = Object.values(abnormalStatus)
    .filter((s) => s?.abnormal)
    .map((s) => s.message);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

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
        localStorage.setItem("growthDataId", pregRes.data.id);
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
  const { notifications } = useContext(NotificationContext);

  useEffect(() => {
    if (!pregnancyData?.id) return;

    const lastMsg = notifications[notifications.length - 1];
    if (!lastMsg) return;

    // Handle BBM updates
    if (lastMsg.type === "BBM" || lastMsg.type === "BioMetric") {
      console.log("Real-time BBM update:", lastMsg);

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const currentDate = new Date().toISOString().split("T")[0];

      // Re-fetch current growth data to refresh BBM
      getCurrentWeekGrowthData(userId, currentDate, token)
        .then(({ data }) => {
          if (data?.error === 0 && data?.data) {
            setPregnancyData(data.data);
          }
        })
        .catch((err) => console.error("Failed to refresh BBM:", err));
    }

    // Optionally handle Journal updates here too if you want
    if (lastMsg.type === "Journal") {
      console.log("Real-time Journal update:", lastMsg);
      setJournals((prev) => {
        if (prev.some((j) => j.id === lastMsg.payload.id)) return prev;
        return [...prev, lastMsg.payload];
      });
    }
  }, [notifications, pregnancyData?.id]);

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

      await createBasicBioMetric(
        {
          GrowthDataId: growthDataId,
          WeightKg: preWeight,
          HeightCm: preHeight,
        },
        token
      );

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
          {/* <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p>Loading your pregnancy data...</p>
          </div> */}
          <LoadingOverlay show={isLoading} />
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
                {/* Dropdown for Recommended Nutritional Needs */}
                <div className="tab dropdown">
                  <button className="tab">
                    Nutritional Guidance{" "}
                    <span>
                      <FaCaretDown />
                    </span>
                  </button>
                  <div className="dropdown-menu">
                    <button
                      className={
                        activeTab === "nutritional-guidance-recommendations"
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        setActiveTab("nutritional-guidance-recommendations");
                        navigate(
                          `?growthDataId=${pregnancyData?.id}&nutritional-guidance=recommendations`
                        );
                      }}
                    >
                      Recommended Nutritional Needs
                    </button>

                    <button
                      className={
                        activeTab === "nutritional-guidance-foodwarnings"
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        setActiveTab("nutritional-guidance-foodwarnings");
                        navigate(
                          `?growthDataId=${pregnancyData?.id}&nutritional-guidance=foodwarnings`
                        );
                      }}
                    >
                      Food Warning
                    </button>
                  </div>
                </div>

                {/* Dropdown for Meal Planner */}
                <div className="tab dropdown">
                  <button className="tab">
                    Meal Planner{" "}
                    <span>
                      <FaCaretDown />
                    </span>
                  </button>
                  <div className="dropdown-menu">
                    <button
                      className={
                        activeTab === "mealplanner-system" ? "active" : ""
                      }
                      onClick={() => {
                        setActiveTab("mealplanner-system");
                        navigate(
                          `?growthDataId=${pregnancyData?.id}&mealplanner=system`
                        );
                      }}
                    >
                      System Meal Planner
                    </button>

                    <button
                      className={
                        activeTab === "mealplanner-custom" ? "active" : ""
                      }
                      onClick={() => {
                        setActiveTab("mealplanner-custom");
                        navigate(
                          `?growthDataId=${pregnancyData?.id}&mealplanner=custom`
                        );
                      }}
                    >
                      Custom Meal Planner
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === "weekly" && (
                <div className="tab-content">
                  <PregnancyOverview
                    pregnancyData={pregnancyData}
                    setPregnancyData={setPregnancyData}
                    setError={setError}
                  />
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
                    </div>
                    <div className="right-column">
                      <UpcomingAppointments
                        growthDataId={pregnancyData?.id}
                        userId={localStorage.getItem("userId")}
                        token={localStorage.getItem("token")}
                      />
                      {/* <TrimesterChecklists
                        growthDataId={pregnancyData?.id}
                        token={localStorage.getItem("token")}
                      /> */}
                    </div>
                  </div>
                  {pregnancyData.basicBioMetric && (
                    <div className="biometric-section">
                      <div className="section-header">
                        <h3>Health Metrics</h3>
                        <p>Your current health measurements</p>
                      </div>

                      {abnormalMessages.length > 0 && (
                        <div className="abnormal-alert-box">
                          <strong>Health Alert:</strong>

                          <ul>
                            {abnormalMessages.map((msg, idx) => (
                              <li key={idx}>{msg}</li>
                            ))}
                            <p>Please consult your healthcare provider.</p>
                          </ul>
                        </div>
                      )}
                      <div className="biometric-cards">
                        {(() => {
                          const status = getAbnormalStatus(
                            pregnancyData.basicBioMetric
                          );

                          return (
                            <>
                              {pregnancyData.preWeight > 0 && (
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
                                      {pregnancyData.preWeight} Kg
                                    </span>
                                    <span className="metric-label">
                                      Pre-Pregnancy Weight
                                    </span>
                                  </div>
                                </div>
                              )}
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
                                <div
                                  className={`biometric-card ${
                                    status.bmi?.abnormal ? "abnormal" : ""
                                  }`}
                                >
                                  <div className="metric-icon">
                                    <img
                                      src={calculatorIcon}
                                      alt="BMI"
                                      className="bbm-icon"
                                    />
                                  </div>
                                  <div className="metric-info">
                                    <span className="metric-value">
                                      {pregnancyData.basicBioMetric.bmi.toFixed(
                                        1
                                      )}
                                    </span>
                                    <span className="metric-label">
                                      BMI{" "}
                                      {/* {status.bmi?.abnormal
                                        ? `(${status.bmi.message})`
                                        : ""} */}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {(pregnancyData.basicBioMetric.systolicBP > 0 ||
                                pregnancyData.basicBioMetric.diastolicBP >
                                  0) && (
                                <div
                                  className={`biometric-card ${
                                    status.bloodPressure?.abnormal
                                      ? "abnormal"
                                      : ""
                                  }
                                  `}
                                >
                                  <div className="metric-icon">
                                    <img
                                      src={heartRateIcon}
                                      alt="Blood Pressure"
                                      className="bbm-icon"
                                    />
                                  </div>
                                  <div className="metric-info">
                                    <span className="metric-value">
                                      {pregnancyData.basicBioMetric.systolicBP}/
                                      {pregnancyData.basicBioMetric.diastolicBP}{" "}
                                      mmHg
                                    </span>
                                    <span className="metric-label">
                                      Blood Pressure{" "}
                                      {status.bloodPressure?.abnormal
                                        ? `(${status.bloodPressure.message})`
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {pregnancyData.basicBioMetric.heartRateBPM >
                                0 && (
                                <div
                                  className={`biometric-card ${
                                    status.heartRateBPM?.abnormal
                                      ? "abnormal"
                                      : ""
                                  }`}
                                >
                                  <div className="metric-icon">
                                    <FaHandHoldingHeart className="bbm-icon" />
                                  </div>
                                  <div className="metric-info">
                                    <span className="metric-value">
                                      {
                                        pregnancyData.basicBioMetric
                                          .heartRateBPM
                                      }{" "}
                                      bpm
                                    </span>
                                    <span className="metric-label">
                                      Heart Rate{" "}
                                      {status.heartRateBPM?.abnormal
                                        ? `(${status.heartRateBPM.message})`
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {pregnancyData.basicBioMetric
                                .bloodSugarLevelMgDl > 0 && (
                                <div
                                  className={`biometric-card ${
                                    status.bloodSugarLevelMgDl?.abnormal
                                      ? "abnormal"
                                      : ""
                                  }`}
                                >
                                  <div className="metric-icon">
                                    <FaCube className="bbm-icon" />
                                  </div>
                                  <div className="metric-info">
                                    <span className="metric-value">
                                      {
                                        pregnancyData.basicBioMetric
                                          .bloodSugarLevelMgDl
                                      }{" "}
                                      mg/dL
                                    </span>
                                    <span className="metric-label">
                                      Blood Sugar{" "}
                                      {status.bloodSugarLevelMgDl?.abnormal
                                        ? `(${status.bloodSugarLevelMgDl.message})`
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  <WeightGainChart
                    journalEntries={journals}
                    preWeight={pregnancyData?.preWeight}
                  />
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
              {activeTab === "mealplanner-system" && (
                <div className="tab-content">
                  <SystemMealPlanner />
                </div>
              )}

              {activeTab === "mealplanner-custom" && (
                <div className="tab-content">
                  <CustomMealPlanner />
                </div>
              )}

              {activeTab === "nutritional-guidance-recommendations" && (
                <div className="tab-content">
                  <RecommendedNutritionalNeeds pregnancyData={pregnancyData} />
                </div>
              )}
              {activeTab === "nutritional-guidance-foodwarnings" && (
                <div className="tab-content">
                  <FoodWarning />
                </div>
              )}
            </div>
          )}
        </div>
        <motion.div
          className="contact-icon"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPopupOpen(!isPopupOpen)}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </motion.div>
        <ChatBoxPage
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PregnancyTrackingPage;
