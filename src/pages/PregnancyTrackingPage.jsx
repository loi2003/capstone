"use client"

import { useState, useEffect } from "react"
import Header from "../components/header/Header"
import Footer from "../components/footer/Footer"
import TrackingForm from "../components/form/TrackingForm"
import PregnancyOverview from "../components/form/PregnancyOverview"
import PregnancyProgressBar from "../components/tracking/WeeklyProgessBar"
import JournalSection from "../components/journal/JournalSection"
import BabyDevelopment from "../components/tracking/BabyDevelopment"
import UpcomingAppointments from "../components/tracking/UpcomingAppointments"
import SymptomsAndMood from "../components/tracking/SymptomsAndMood"
import TrimesterChecklists from "../components/tracking/TrimesterChecklists"
import { getGrowthDataFromUser, createGrowthDataProfile } from "../apis/growthdata-api"
import { getCurrentUser } from "../apis/authentication-api"
import "../styles/PregnancyTrackingPage.css"

const PregnancyTrackingPage = () => {
  const [user, setUser] = useState(null)
  const [pregnancyData, setPregnancyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("weekly")

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please sign in to access pregnancy tracking")
        setIsLoading(false)
        return
      }

      const res = await getCurrentUser(token)
      const userData = res?.data?.data

      if (!userData || userData.roleId !== 2 || !userData.id) {
        setError("Access denied or user ID missing.")
        setIsLoading(false)
        return
      }

      setUser(userData)

      const { data: pregRes } = await getGrowthDataFromUser(userData.id, token)

      if (pregRes?.error === 0 && pregRes?.data) {
        setPregnancyData(pregRes.data)
      } else {
        setPregnancyData(null)
      }
    } catch (err) {
      console.error("Error initializing page:", err)
      setError("Failed to load page. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProfile = async (formData) => {
    setIsCreating(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!formData?.userId) {
        setError("User ID is missing. Cannot create growth data profile.")
        return
      }

      await createGrowthDataProfile(formData, token)

      const { data: pregRes } = await getGrowthDataFromUser(formData.userId, token)

      if (pregRes?.error === 0 && pregRes?.data) {
        setPregnancyData(pregRes.data)
      } else {
        setError(pregRes?.message || "Failed to fetch updated growth data")
      }
    } catch (err) {
      console.error("Error creating profile:", err)
      setError(err?.response?.data?.message || "Failed to create pregnancy profile. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const hasValidPregnancyData =
    pregnancyData && !!pregnancyData.firstDayOfLastMenstrualPeriod && !!pregnancyData.estimatedDueDate

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
    )
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
    )
  }

  return (
    <div className="pregnancy-tracking-page">
      <Header />
      <main className="main-content">
        <div className="container">
          {!hasValidPregnancyData ? (
            <div className="welcome-section">
              <div className="welcome-header">
                <h1>Welcome to Pregnancy Tracking</h1>
                <p>Start your beautiful journey of motherhood with personalized tracking and insights</p>
              </div>
              <TrackingForm onSubmit={handleCreateProfile} isLoading={isCreating} user={user} />
            </div>
          ) : (
            <div className="tracking-dashboard">
              {/* Header with Add Journal Entry Button */}
              <div className="dashboard-header">
                <h1>Pregnancy Tracker</h1>
                <button className="add-journal-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add Journal Entry
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="nav-tabs">
                <button
                  className={`tab ${activeTab === "weekly" ? "active" : ""}`}
                  onClick={() => setActiveTab("weekly")}
                >
                  Weekly Info
                </button>
                <button
                  className={`tab ${activeTab === "checkups" ? "active" : ""}`}
                  onClick={() => setActiveTab("checkups")}
                >
                  Checkup Reminders
                </button>
                <button
                  className={`tab ${activeTab === "journal" ? "active" : ""}`}
                  onClick={() => setActiveTab("journal")}
                >
                  Journal Entries
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "weekly" && (
                <div className="tab-content">
                  {/* Your existing PregnancyOverview component */}
                  <PregnancyOverview pregnancyData={pregnancyData} />

                  {/* New Progress Bar Component */}
                  <PregnancyProgressBar pregnancyData={pregnancyData} />

                  <div className="dashboard-grid">
                    <div className="left-column">
                      <BabyDevelopment pregnancyData={pregnancyData} />
                      <SymptomsAndMood pregnancyData={pregnancyData} />
                    </div>

                    <div className="right-column">
                      <UpcomingAppointments />
                      <TrimesterChecklists pregnancyData={pregnancyData} />
                    </div>
                  </div>

                  {/* Show biometric data if available */}
                  {pregnancyData.basicBioMetric && (
                    <div className="biometric-section">
                      <div className="section-header">
                        <h3>Health Metrics</h3>
                        <p>Your current health measurements</p>
                      </div>
                      <div className="biometric-cards">
                        {pregnancyData.basicBioMetric.weightKg > 0 && (
                          <div className="biometric-card">
                            <div className="metric-icon">⚖️</div>
                            <div className="metric-info">
                              <span className="metric-value">{pregnancyData.basicBioMetric.weightKg} kg</span>
                              <span className="metric-label">Current Weight</span>
                            </div>
                          </div>
                        )}

                        {pregnancyData.basicBioMetric.bmi > 0 && (
                          <div className="biometric-card">
                            <div className="metric-icon">📊</div>
                            <div className="metric-info">
                              <span className="metric-value">{pregnancyData.basicBioMetric.bmi.toFixed(1)}</span>
                              <span className="metric-label">BMI</span>
                            </div>
                          </div>
                        )}

                        {(pregnancyData.basicBioMetric.systolicBP > 0 ||
                          pregnancyData.basicBioMetric.diastolicBP > 0) && (
                          <div className="biometric-card">
                            <div className="metric-icon">❤️</div>
                            <div className="metric-info">
                              <span className="metric-value">
                                {pregnancyData.basicBioMetric.systolicBP}/{pregnancyData.basicBioMetric.diastolicBP}
                              </span>
                              <span className="metric-label">Blood Pressure</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "checkups" && (
                <div className="tab-content">
                  <UpcomingAppointments expanded={true} />
                </div>
              )}

              {activeTab === "journal" && (
                <div className="tab-content">
                  <JournalSection journalEntries={pregnancyData.journal} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PregnancyTrackingPage
