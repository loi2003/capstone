"use client"

import { useState } from "react"
import "./TrackingForm.css"
import { formatDateForApi } from '../../utils/date.js'
import { getCurrentUser } from "../../apis/authentication-api.jsx"
import { useEffect } from "react"


const TrackingForm = ({ onSubmit, isLoading }) => {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    firstDayOfLastMenstrualPeriod: "",
    preWeight: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await getCurrentUser(token)
        setUser(res.data.data) 
      } catch (err) {
        console.error("Error fetching user:", err)
      }
    }

    fetchUser()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstDayOfLastMenstrualPeriod) {
      newErrors.firstDayOfLastMenstrualPeriod = "Please select your last menstrual period date"
    } else {
      const selectedDate = new Date(formData.firstDayOfLastMenstrualPeriod)
      const today = new Date()
      if (selectedDate > today) {
        newErrors.firstDayOfLastMenstrualPeriod = "Date cannot be in the future"
      }
    }

    // if (!formData.preWeight || formData.preWeight <= 0) {
    //   newErrors.preWeight = "Please enter a valid pre-pregnancy weight"
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
  e.preventDefault()
  if (validateForm()) {
    onSubmit({
      userId: user.id,
      firstDayOfLastMenstrualPeriod: formatDateForApi(formData.firstDayOfLastMenstrualPeriod),
      preWeight: Number.parseFloat(formData.preWeight),
      
    })
  }
  
}


  

  return (
    <div className="lmp-form-container">
      <div className="lmp-form-card">
        <div className="form-header">
          <div className="form-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                fill="#e91e63"
              />
            </svg>
          </div>
          <h2>Start Your Pregnancy Journey</h2>
          <p>Enter your information to begin tracking your pregnancy</p>
        </div>

        <form onSubmit={handleSubmit} className="lmp-form">
          <div className="form-group">
            <label htmlFor="lmp-date">Last Menstrual Period Date *</label>
            <input
              type="date"
              id="lmp-date"
              name="firstDayOfLastMenstrualPeriod"
              value={formData.firstDayOfLastMenstrualPeriod}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className={errors.firstDayOfLastMenstrualPeriod ? "error" : ""}
            />
            {errors.firstDayOfLastMenstrualPeriod && (
              <span className="error-message">{errors.firstDayOfLastMenstrualPeriod}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="pre-weight">Pre-pregnancy Weight (kg) *</label>
            <input
              type="number"
              id="pre-weight"
              name="preWeight"
              value={formData.preWeight}
              onChange={handleChange}
              min="30"
              max="200"
              step="0.1"
              placeholder="Enter your weight in kg"
              className={errors.preWeight ? "error" : ""}
            />
            {errors.preWeight && <span className="error-message">{errors.preWeight}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Creating Profile...
              </>
            ) : (
              "Start Tracking"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TrackingForm
