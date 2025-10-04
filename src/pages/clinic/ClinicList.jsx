import React, { useEffect, useState } from "react";
import { getAllClinics, getClinicsByName } from "../../apis/clinic-api";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ChatBoxPage from "../../components/chatbox/ChatBoxPage";
import "../../styles/ClinicList.css";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaPhone,
  FaUserMd,
  FaStethoscope,
  FaStar,
  FaFilter,
  FaCheck,
} from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import LoadingOverlay from "../../components/popup/LoadingOverlay";

const CLINICS_PER_PAGE = 6;

// Helper to calculate average rating and convert to 5-star scale
function getStarRating(feedbacks) {
  if (!feedbacks || feedbacks.length === 0)
    return { avg: 0, stars: 0, count: 0 };
  const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
  const avg10 = sum / feedbacks.length;
  const avg5 = avg10 / 2;
  return { avg: avg5, stars: avg5, count: feedbacks.length };
}

// Helper to truncate description
function truncateText(text, maxLength = 120) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

const ClinicList = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await getAllClinics();
        setClinics(
          Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setError("Failed to fetch clinics.", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const [specialization, setSpecialization] = useState("");
  const [insuranceOnly, setInsuranceOnly] = useState(false);

  // Search handler using getClinicsByName
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let data;
      if (!search.trim() && !specialization && !insuranceOnly) {
        data = await getAllClinics();
      } else {
        data = await getClinicsByName(search);
      }

      setClinics(
        Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      );
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to search clinics.");
    } finally {
      setLoading(false);
    }
  };

  const clinicsToShow = clinics.slice(0, currentPage * CLINICS_PER_PAGE);
  const hasMore = clinicsToShow.length < clinics.length;

  const handleSeeMore = () => setCurrentPage((prev) => prev + 1);

  const renderStars = (stars) => {
    const filled = Math.floor(stars);

    return (
      <>
        {[...Array(5)].map((_, i) =>
          i < filled ? (
            <FaStar key={i} style={{ color: "#f7b801", marginRight: "2px" }} />
          ) : (
            <FaRegStar key={i} style={{ color: "#ccc", marginRight: "2px" }} />
          )
        )}
      </>
    );
  };

  // Add these state variables after your existing useState declarations
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});

  // Add these handler functions before your useEffect
  const handleImageError = (imageId) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoad = (imageId) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoadStart = (imageId) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: true }));
  };

  return (
    <div className="clinic-list-background-container">
      <LoadingOverlay show={loading} />
      <MainLayout>
        {/* Hero Section */}
        <motion.header
          className="clinic-hero-section"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="clinic-hero-content">
            <h1 className="clinic-hero-title">
              Find Your Perfect
              <span className="clinic-hero-accent"> Healthcare Partner</span>
            </h1>
            <p className="clinic-hero-description">
              Discover trusted clinics with verified ratings, experienced
              professionals, and comprehensive healthcare services tailored to
              your needs.
            </p>

            {/* Enhanced Search Section */}
            <motion.form
              className="clinic-search-container"
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="clinic-main-search">
                <div className="clinic-search-input-group">
                  <FaSearch className="search-input-icon" />
                  <input
                    type="text"
                    className="clinic-search-main-input"
                    placeholder="Search clinics by name or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {/* <button 
                  type="button" 
                  className="clinic-filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                  Filters
                </button> */}
                <button type="submit" className="clinic-search-main-btn">
                  <FaSearch />
                  Search
                </button>
              </div>

              {/* Collapsible Filters */}
              {/* <motion.div 
                className={`clinic-filters-panel ${showFilters ? 'expanded' : ''}`}
                initial={false}
                animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="clinic-filters-content">
                  <div className="filter-group">
                    <label className="filter-label">Specialization</label>
                    <select
                      className="clinic-filter-select"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                    >
                      <option value="">All Specializations</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="clinic-insurance-filter">
                      <input
                        type="checkbox"
                        checked={insuranceOnly}
                        onChange={(e) => setInsuranceOnly(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Insurance Accepted Only
                    </label>
                  </div>
                </div>
              </motion.div> */}
            </motion.form>
          </div>
        </motion.header>

        {/* Results Section */}
        <main className="clinic-results-section">
          <div className="clinic-results-header">
            <div className="results-info">
              <h2 className="results-count">
                {clinics.length} {clinics.length === 1 ? "Clinic" : "Clinics"}{" "}
                Found
              </h2>
              <p className="results-subtitle">
                Choose the best healthcare provider for you
              </p>
            </div>
          </div>

          {error && (
            <div className="error-container">
              <p className="error-text">{error}</p>
            </div>
          )}

          <div className="clinic-cards-grid">
            {clinicsToShow && clinicsToShow.length > 0
              ? clinicsToShow.map((clinic, index) => {
                  const { avg, count } = getStarRating(clinic.feedbacks);
                  const consultantCount = clinic.consultants
                    ? clinic.consultants.length
                    : 0;
                  const doctorCount = clinic.doctors
                    ? clinic.doctors.length
                    : 0;

                  return (
                    <motion.div
                      className="clinic-card"
                      key={clinic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 20px 40px rgba(4, 102, 141, 0.15)",
                      }}
                    >
                      {/* Card Header */}
                      <div className="clinic-card-header">
                        <div className="clinic-image-container">
                          {/* {imageLoading[`clinic-${clinic.id}`] && (
                            <div className="image-loading-overlay">
                              <div className="loading-spinner"></div>
                            </div>
                          )} */}
                          <img
                            src={
                              clinic.imageUrl?.fileUrl ||
                              "https://www.placeholderimage.online/placeholder/420/310/ffffff/ededed?text=image&font=Lato.png"
                            }
                            alt={clinic.name}
                            className="clinic-image"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://www.placeholderimage.online/placeholder/420/310/ffffff/ededed?text=image&font=Lato.png";
                            }}
                          />
                          {/* {(imageErrors[`clinic-${clinic.id}`] ||
                            !clinic.imageUrl?.fileUrl) && (
                            <div className="clinic-list-placeholder-overlay">
                              <svg
                                className="clinic-list-placeholder-icon"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-2 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              </svg>
                            </div>
                          )} */}
                          <div className="clinic-badges">
                            {avg > 4 && (
                              <span className="clinic-badge premium">
                                <FaStar /> Top Rated
                              </span>
                            )}
                            {clinic.isInsuranceAccepted && (
                              <span className="clinic-badge insurance">
                                <FaCheck /> Insurance
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="clinic-header-info">
                          <h3 className="clinic-name">{clinic.name}</h3>
                          <div className="clinic-rating">
                            {renderStars(avg)}
                            <span className="rating-score">
                              {avg.toFixed(1)}
                            </span>
                            <span className="rating-count">
                              ({count} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="clinic-card-body">
                        <p className="clinic-name">
                          {truncateText(clinic?.user?.userName)}
                        </p>
                        <p className="clinic-description">
                          {truncateText(clinic.description)}
                        </p>

                        <div className="clinic-details">
                          <div className="clinic-detail-item">
                            <FaMapMarkerAlt className="detail-icon" />
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
                          </div>

                          <div className="clinic-detail-item">
                            <FaPhone className="detail-icon" />
                            <span>{clinic.user.phoneNo}</span>
                          </div>

                          <div className="clinic-detail-item">
                            <FaStethoscope className="detail-icon" />
                            <div className="clinic-specializations">
                              {clinic.specializations
                                ? clinic.specializations
                                    .split(";")
                                    .filter((s) => s.trim() !== "")
                                    .map((spec, idx) => (
                                      <span
                                        key={idx}
                                        className="specialization-badge"
                                      >
                                        {spec.trim()}
                                      </span>
                                    ))
                                : "General Practice"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="clinic-card-footer">
                        <div className="clinic-stats">
                          <div className="stat-item">
                            <FaUserMd className="stat-icon" />
                            <span>{doctorCount} Doctors</span>
                          </div>
                          <div className="stat-item">
                            <FaUserMd className="stat-icon" />
                            <span>{consultantCount} Consultants</span>
                          </div>
                        </div>
                        <motion.button
                          className="clinic-select-btn"
                          onClick={() => navigate(`/clinic/${clinic.id}`)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View Details & Book
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              : !loading && (
                  <div className="no-clinics-container">
                    <div className="no-clinics-content">
                      <FaStethoscope className="no-clinics-icon" />
                      <h3>No Clinics Found</h3>
                      <p>
                        Try adjusting your search criteria or removing filters
                      </p>
                    </div>
                  </div>
                )}
          </div>

          {hasMore && (
            <div className="load-more-container">
              <motion.button
                className="load-more-btn"
                onClick={handleSeeMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Load More Clinics
              </motion.button>
            </div>
          )}
        </main>

        {/* Enhanced Chat Button */}
        <motion.div
          className="chat-fab"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
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
      </MainLayout>
    </div>
  );
};

export default ClinicList;
