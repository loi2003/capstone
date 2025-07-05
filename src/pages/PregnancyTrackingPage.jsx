"use client"

import { useState, useEffect } from "react"
import Header from "../components/header/Header"
import Footer from "../components/footer/Footer"
import TrackingForm from "../components/form/TrackingForm"
import PregnancyOverview from "../components/form/PregnancyOverview"
import JournalSection from "../components/journal/JournalSection"
import {
  getGrowthDataFromUser,
  createGrowthDataProfile,
} from "../apis/growthdata-api"
import { getCurrentUser } from "../apis/authentication-api"
import '../styles/PregnancyTrackingPage.css';

const PregnancyTrackingPage = () => {
  const [user, setUser] = useState(null)
  const [pregnancyData, setPregnancyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

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
    if (!formData?.UserId) {
      setError("User ID is missing. Cannot create growth data profile.")
      return
    }

    await createGrowthDataProfile(formData, token)

    const { data: pregRes } = await getGrowthDataFromUser(formData.UserId, token)

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



  // Only show overview if these fields are valid
  const hasValidPregnancyData = 
    pregnancyData &&
    !!pregnancyData.firstDayOfLastMenstrualPeriod &&
    !!pregnancyData.estimatedDueDate
    // console.log("Fetched growth data:", pregRes.data)


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
              <PregnancyOverview pregnancyData={pregnancyData} />
              <JournalSection journalEntries={pregnancyData.journal} />

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

                    {(pregnancyData.basicBioMetric.systolicBP > 0 || pregnancyData.basicBioMetric.diastolicBP > 0) && (
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
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PregnancyTrackingPage