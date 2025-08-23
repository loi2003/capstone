import React, { useEffect, useState } from "react";
import { getAllClinics, getClinicsByName } from "../../apis/clinic-api";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import "../../styles/ClinicList.css";

const CLINICS_PER_PAGE = 6;

// Helper to calculate average rating and convert to 5-star scale
function getStarRating(feedbacks) {
  if (!feedbacks || feedbacks.length === 0)
    return { avg: 0, stars: 0, count: 0 };
  const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
  const avg10 = sum / feedbacks.length;
  const avg5 = avg10 / 2;
  return { avg: avg5, stars: Math.round(avg5), count: feedbacks.length };
}

// Helper to truncate description
function truncateText(text, maxLength = 100) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

const ClinicList = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await getAllClinics();
        setClinics(data.data || data);
      } catch (err) {
        setError("Failed to fetch clinics.", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // Search handler using getClinicsByName
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let data;
      if (!search.trim()) {
        data = await getAllClinics();
      } else {
        data = await getClinicsByName(search);
      }
      setClinics(data.data || data);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to search clinics.", err.message);
    } finally {
      setLoading(false);
    }
  };

  const clinicsToShow = clinics.slice(0, currentPage * CLINICS_PER_PAGE);
  const hasMore = clinicsToShow.length < clinics.length;

  const handleSeeMore = () => setCurrentPage((prev) => prev + 1);

  // Star rendering helper
  const renderStars = (stars) => {
    const filled = Math.floor(stars);
    const half = stars - filled >= 0.25 && stars - filled < 0.75;
    return (
      <>
        {[...Array(5)].map((_, i) => {
          if (i < filled) {
            return (
              <span key={i} className="star">
                &#9733;
              </span>
            );
          } else if (i === filled && half) {
            return (
              <span key={i} className="star star-half" aria-label="half star">
                &#9733;
              </span>
            );
          } else {
            return (
              <span key={i} className="star star-empty">
                &#9733;
              </span>
            );
          }
        })}
      </>
    );
  };

  return (
    <div className="clinic-list-background-container">
      <MainLayout>
        <header className="clinic-header">
          <h1 className="clinic-main-title">Clinics</h1>
          <p className="clinic-header-desc">
            Explore reputable and quality clinics that suit your needs.
          </p>
          {/* Modern search bar */}
          <form className="clinic-search-bar" onSubmit={handleSearch}>
            <div className="clinic-search-bar-input-wrapper">
              <button
                type="submit"
                className="clinic-search-icon-btn"
                tabIndex={-1}
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="#8ee6f7"
                    stroke="#2196f3"
                    strokeWidth="2"
                  />
                  <line
                    x1="16"
                    y1="16"
                    x2="20"
                    y2="20"
                    stroke="#a259c6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <input
                type="text"
                className="clinic-search-input"
                placeholder="Input clinic name or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </header>
        <main className="clinic-list-main-content clinic-list-container">
          {loading && <p className="loading-text">Loading clinics...</p>}
          {error && <p className="error-text">{error}</p>}
          <div>
            <div className="clinic-list-count">
              {clinics.length} Clinics found
            </div>
            <div className="clinic-list-cards-modern">
              {clinicsToShow && clinicsToShow.length > 0
                ? clinicsToShow.map((clinic) => {
                    const { avg, count } = getStarRating(clinic.feedbacks);
                    const consultantCount = clinic.consultants
                      ? clinic.consultants.length
                      : 0;
                    const doctorCount = clinic.doctors
                      ? clinic.doctors.length
                      : 0;
                    return (
                      <div className="clinic-modern-card" key={clinic.id}>
                        <div className="clinic-modern-card-left">
                          <img
                            src={
                              clinic.imageUrl && clinic.imageUrl.fileUrl
                                ? clinic.imageUrl.fileUrl
                                : "/images/clinic-placeholder.png"
                            }
                            alt={clinic.name}
                            className="clinic-modern-avatar"
                          />
                          <div className="clinic-modern-name">
                            {clinic.name}
                          </div>
                        </div>
                        <div className="clinic-modern-card-body">
                          <div className="clinic-modern-header-row">
                            <div>
                              <span className="clinic-modern-title">
                                {clinic.name}
                              </span>
                              <span className="clinic-modern-rating">
                                {renderStars(avg)}
                                <span className="rating-value">
                                  {avg.toFixed(1)}
                                </span>
                                <span className="review-count">
                                  ({count} reviews)
                                </span>
                              </span>
                            </div>
                            <div className="clinic-modern-badges">
                              {avg > 4 && (
                                <span className="clinic-modern-badge green">
                                  Highly Rated
                                </span>
                              )}
                              {clinic.isInsuranceAccepted && (
                                <span className="clinic-modern-badge teal">
                                  Insurance Accepted
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="clinic-modern-info-row">
                            <div className="clinic-modern-info-col">
                              <div className="clinic-modern-info-item">
                                <span
                                  className="icon-card"
                                  role="img"
                                  aria-label="location"
                                >
                                  &#128205;
                                </span>
                                <span>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      clinic.address
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="clinic-address-link"
                                  >
                                    {clinic.address}
                                  </a>
                                </span>
                              </div>
                              <div className="clinic-modern-info-item">
                                <span>
                                  {truncateText(clinic.description, 100)}
                                </span>
                              </div>
                              <div className="clinic-modern-info-item">
                                <span>
                                  <b>Consultants:</b> {consultantCount}{" "}
                                  &nbsp;|&nbsp; <b>Doctors:</b> {doctorCount}
                                </span>
                              </div>
                            </div>
                            <div className="clinic-modern-info-col">
                              <div className="clinic-modern-info-item">
                                <span
                                  className="icon-card"
                                  role="img"
                                  aria-label="specialties"
                                >
                                  &#128137;
                                </span>
                                <span>
                                  <b>Specialties:</b>{" "}
                                  {clinic.specializations || "N/A"}
                                </span>
                              </div>
                              <div className="clinic-modern-info-item">
                                <span
                                  className="icon-card"
                                  role="img"
                                  aria-label="phone"
                                >
                                  &#128222;
                                </span>
                                <span>{clinic.user.phoneNo}</span>
                              </div>
                            </div>
                          </div>
                          <div className="clinic-modern-card-footer">
                            <button
                              className="clinic-modern-select-btn"
                              onClick={() => navigate(`/clinic/${clinic.id}`)}
                            >
                              Select Clinic
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : !loading && (
                    <div className="no-clinics">No clinics found.</div>
                  )}
            </div>
            {hasMore && (
              <button className="see-more-btn" onClick={handleSeeMore}>
                See More
              </button>
            )}
          </div>
        </main>
        <footer className="clinic-footer">
          <p className="footer-text">
            &copy; {new Date().getFullYear()} DoIt Clinic Platform. All rights
            reserved.
          </p>
        </footer>
      </MainLayout>
    </div>
  );
};

export default ClinicList;
