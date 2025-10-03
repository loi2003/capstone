import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllNutrientSuggestions,
  getNutrientSuggestionById,
  createNutrientSuggestion,
  updateNutrientSuggestion,
  deleteNutrientSuggestion,
  getAllNutrients,
  addNutrientSuggestionAttribute,
  getAllAgeGroups,
  updateNutrientSuggestionAttribute,
  deleteNutrientSuggestionAttribute,
} from "../../apis/nutriet-api";
import { getCurrentUser, logout } from "../../apis/authentication-api";
import "../../styles/NutrientSuggestion.css";

// Notification Component
const Notification = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.dispatchEvent(new CustomEvent("closeNotification"));
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="notification-content">
        <h4>{type === "success" ? "Success" : "Error"}</h4>
        <p>{message}</p>
      </div>
    </motion.div>
  );
};

// NutrientSuggestionModal Component
const NutrientSuggestionModal = ({
  suggestion,
  onClose,
  ageGroups,
  onEditAttribute,
  onDeleteAttribute,
}) => {
  const attributes = Array.isArray(suggestion?.nutrientSuggestionAttributes)
    ? suggestion.nutrientSuggestionAttributes
    : [];
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>
          {suggestion.nutrientSuggestionName || `Suggestion #${suggestion.id}`}
        </h2>
        <h3>Attributes</h3>
        {attributes.length > 0 ? (
          <ul className="attribute-list">
            {attributes.map((attr) => {
              const attribute = attr.attribute || {};
              const ageGroup = ageGroups.find((g) => g.id === attr.ageGroupId);
              return (
                <li
                  key={attr.nutrientSuggestionAttributeId}
                  className="attribute-item"
                >
                  <div className="attribute-content">
                    <strong>Nutrient:</strong>{" "}
                    {attribute.nutrientName || "Unknown Nutrient"}
                    <br />
                    <strong>Age Group:</strong>{" "}
                    {ageGroup
                      ? ageGroup.name ||
                        `Age ${ageGroup.fromAge}-${ageGroup.toAge}`
                      : "Unknown Age Group"}
                    <br />
                    <strong>Trimester:</strong> {attr.trimester || "N/A"}
                    <br />
                    <strong>Type:</strong> {attribute.type || "N/A"}
                    <br />
                    <strong>Min Energy %:</strong>{" "}
                    {attribute.minEnergyPercentage || "N/A"}
                    <br />
                    <strong>Max Energy %:</strong>{" "}
                    {attribute.maxEnergyPercentage || "N/A"}
                    <br />
                    <strong>Min Value Per Day:</strong>{" "}
                    {attribute.minValuePerDay || "N/A"}
                    <br />
                    <strong>Max Value Per Day:</strong>{" "}
                    {attribute.maxValuePerDay || "N/A"}
                    <br />
                    <strong>Amount:</strong> {attribute.amount || "N/A"}
                    <br />
                    <strong>Unit:</strong> {attribute.unit || "N/A"}
                    <br />
                    <strong>Min Animal Protein % Require:</strong>{" "}
                    {attribute.minAnimalProteinPercentageRequire || "N/A"}
                  </div>
                  <div className="attribute-actions">
                    {onEditAttribute && (
                      <motion.button
                        onClick={() => onEditAttribute(attr)}
                        className="nutrient-specialist-button primary small"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Edit Attribute"
                      >
                        Edit
                      </motion.button>
                    )}
                    {onDeleteAttribute && (
                      <motion.button
                        onClick={() => onDeleteAttribute(attr)}
                        className="nutrient-specialist-button danger small"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Delete Attribute"
                      >
                        Delete
                      </motion.button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No attributes added for this suggestion.</p>
        )}
        <motion.button
          onClick={onClose}
          className="nutrient-specialist-button primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// NutrientAttributeModal Component
const NutrientAttributeModal = ({
  suggestionId,
  nutrients,
  ageGroups,
  onClose,
  onSave,
  onShowNotification,
  attribute,
  isEditing = false,
}) => {
  const [attributeData, setAttributeData] = useState({
    nutrientSuggestionId: suggestionId || "",
    ageGroupId: attribute?.ageGroupId || "",
    trimester: attribute?.trimester || "",
    maxEnergyPercentage: attribute?.attribute?.maxEnergyPercentage || "",
    minEnergyPercentage: attribute?.attribute?.minEnergyPercentage || "",
    maxValuePerDay: attribute?.attribute?.maxValuePerDay || "",
    minValuePerDay: attribute?.attribute?.minValuePerDay || "",
    unit: attribute?.attribute?.unit || "milligrams",
    amount: attribute?.attribute?.amount || "",
    minAnimalProteinPercentageRequire:
      attribute?.attribute?.minAnimalProteinPercentageRequire || "",
    nutrientId: attribute?.attribute?.nutrientId || "",
    type: attribute?.attribute?.type || "",
    attributeId: attribute?.attribute?.id || attribute?.attributeId || "",
  });

  const isValidGuid = (guid) => {
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return (
      guid &&
      guid !== "00000000-0000-0000-0000-000000000000" &&
      guidRegex.test(guid)
    );
  };

  const validateAttributeData = () => {
    const errors = [];
    if (isEditing && !isValidGuid(attributeData.attributeId)) {
      errors.push("AttributeId is required and must be a valid GUID for editing");
    }
    if (!isValidGuid(attributeData.nutrientId)) {
      errors.push("NutrientId is required and must be a valid GUID");
    }
    if (attributeData.ageGroupId && !isValidGuid(attributeData.ageGroupId)) {
      errors.push("AgeGroupId must be a valid GUID");
    }
    if (
      attributeData.minValuePerDay !== "" &&
      attributeData.maxValuePerDay !== "" &&
      parseFloat(attributeData.minValuePerDay) >
        parseFloat(attributeData.maxValuePerDay)
    ) {
      errors.push("MinValuePerDay cannot be greater than MaxValuePerDay");
    }
    if (
      attributeData.minEnergyPercentage !== "" &&
      attributeData.maxEnergyPercentage !== "" &&
      parseFloat(attributeData.minEnergyPercentage) >
        parseFloat(attributeData.maxEnergyPercentage)
    ) {
      errors.push("MinEnergyPercentage cannot be greater than MaxEnergyPercentage");
    }
    if (
      attributeData.minAnimalProteinPercentageRequire !== "" &&
      (parseFloat(attributeData.minAnimalProteinPercentageRequire) < 0 ||
        parseFloat(attributeData.minAnimalProteinPercentageRequire) > 100)
    ) {
      errors.push("MinAnimalProteinPercentageRequire must be between 0 and 100");
    }
    if (attributeData.unit && attributeData.unit.trim() === "") {
      errors.push("Unit cannot be an empty string");
    }
    if (attributeData.amount !== "" && parseFloat(attributeData.amount) < 0) {
      errors.push("Amount must be non-negative");
    }
    if (attributeData.type !== "" && parseInt(attributeData.type) < 0) {
      errors.push("Type must be non-negative");
    }
    if (
      attributeData.trimester !== "" &&
      ![1, 2, 3].includes(parseInt(attributeData.trimester))
    ) {
      errors.push("Trimester must be 1, 2, or 3");
    }
    return errors;
  };

  const handleInputChange = (field, value) => {
    setAttributeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!isValidGuid(attributeData.nutrientId)) {
      onShowNotification("Please select a nutrient", "error");
      return;
    }
    if (!isValidGuid(attributeData.ageGroupId)) {
      onShowNotification("Please select an age group", "error");
      return;
    }
    const errors = validateAttributeData();
    if (errors.length > 0) {
      errors.forEach((error) => onShowNotification(error, "error"));
      return;
    }
    try {
      const cleanedAttributeData = {
        nutrientId: attributeData.nutrientId,
        ageGroupId: attributeData.ageGroupId || null,
        trimester: attributeData.trimester
          ? parseInt(attributeData.trimester)
          : null,
        maxEnergyPercentage: attributeData.maxEnergyPercentage
          ? parseFloat(attributeData.maxEnergyPercentage)
          : null,
        minEnergyPercentage: attributeData.minEnergyPercentage
          ? parseFloat(attributeData.minEnergyPercentage)
          : null,
        maxValuePerDay: attributeData.maxValuePerDay
          ? parseFloat(attributeData.maxValuePerDay)
          : null,
        minValuePerDay: attributeData.minValuePerDay
          ? parseFloat(attributeData.minValuePerDay)
          : null,
        unit: attributeData.unit || null,
        amount: attributeData.amount ? parseFloat(attributeData.amount) : null,
        minAnimalProteinPercentageRequire:
          attributeData.minAnimalProteinPercentageRequire
            ? parseFloat(attributeData.minAnimalProteinPercentageRequire)
            : null,
        type: attributeData.type ? parseInt(attributeData.type) : null,
      };
      if (isEditing) {
        cleanedAttributeData.attributeId = attributeData.attributeId;
        await onSave(cleanedAttributeData, isEditing);
        onShowNotification("Attribute updated successfully", "success");
      } else {
        cleanedAttributeData.nutrientSuggestionId =
          attributeData.nutrientSuggestionId;
        await onSave(cleanedAttributeData, isEditing);
        onShowNotification("Attribute added successfully", "success");
      }
    } catch (error) {
      onShowNotification(
        "Failed to save attribute: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      onClose();
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{isEditing ? "Edit Attribute" : "Add Attribute to Suggestion"}</h2>
        <div className="form-group">
          <label htmlFor="nutrientId">Nutrient</label>
          <select
            id="nutrientId"
            value={attributeData.nutrientId}
            onChange={(e) => handleInputChange("nutrientId", e.target.value)}
            className="input-field"
          >
            <option value="">Select Nutrient</option>
            {nutrients.length > 0 ? (
              nutrients.map((nutrient) => (
                <option key={nutrient.id} value={nutrient.id}>
                  {nutrient.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No nutrients available
              </option>
            )}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="ageGroupId">Age Group</label>
          <select
            id="ageGroupId"
            value={attributeData.ageGroupId}
            onChange={(e) => handleInputChange("ageGroupId", e.target.value)}
            className="input-field"
            disabled={isEditing}
          >
            <option value="">Select Age Group</option>
            {ageGroups.length > 0 ? (
              ageGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name || `Age ${group.fromAge}-${group.toAge}`}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No age groups available
              </option>
            )}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="trimester">Trimester</label>
          <select
            id="trimester"
            value={attributeData.trimester}
            onChange={(e) => handleInputChange("trimester", e.target.value)}
            className="input-field"
            disabled={isEditing}
          >
            <option value="">Select Trimester</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="minEnergyPercentage">Min Energy Percentage</label>
          <input
            id="minEnergyPercentage"
            type="number"
            value={attributeData.minEnergyPercentage}
            onChange={(e) =>
              handleInputChange("minEnergyPercentage", e.target.value)
            }
            className="input-field"
            min="0"
            step="0.1"
            placeholder="Enter min energy percentage"
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxEnergyPercentage">Max Energy Percentage</label>
          <input
            id="maxEnergyPercentage"
            type="number"
            value={attributeData.maxEnergyPercentage}
            onChange={(e) =>
              handleInputChange("maxEnergyPercentage", e.target.value)
            }
            className="input-field"
            min="0"
            step="0.1"
            placeholder="Enter max energy percentage"
          />
        </div>
        <div className="form-group">
          <label htmlFor="minValuePerDay">Min Value Per Day</label>
          <input
            id="minValuePerDay"
            type="number"
            value={attributeData.minValuePerDay}
            onChange={(e) =>
              handleInputChange("minValuePerDay", e.target.value)
            }
            className="input-field"
            min="0"
            step="0.1"
            placeholder="Enter min value per day"
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxValuePerDay">Max Value Per Day</label>
          <input
            id="maxValuePerDay"
            type="number"
            value={attributeData.maxValuePerDay}
            onChange={(e) =>
              handleInputChange("maxValuePerDay", e.target.value)
            }
            className="input-field"
            min="0"
            step="0.1"
            placeholder="Enter max value per day"
          />
        </div>
        <div className="form-group">
          <label htmlFor="unit">Unit</label>
          <select
            id="unit"
            value={attributeData.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            className="input-field"
          >
            <option value="milligrams">Milligrams</option>
            <option value="grams">Grams</option>
            <option value="micrograms">Micrograms</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={attributeData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            className="input-field"
            min="0"
            step="0.1"
            placeholder="Enter amount"
          />
        </div>
        <div className="form-group">
          <label htmlFor="minAnimalProteinPercentageRequire">
            Min Animal Protein Percentage
          </label>
          <input
            id="minAnimalProteinPercentageRequire"
            type="number"
            value={attributeData.minAnimalProteinPercentageRequire}
            onChange={(e) =>
              handleInputChange(
                "minAnimalProteinPercentageRequire",
                e.target.value
              )
            }
            className="input-field"
            min="0"
            max="100"
            step="0.1"
            placeholder="Enter min animal protein percentage"
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <input
            id="type"
            type="number"
            value={attributeData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="input-field"
            min="0"
            placeholder="Enter type"
          />
        </div>
        <div className="button-group">
          <motion.button
            onClick={handleSubmit}
            className="nutrient-specialist-button primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={
              !isValidGuid(attributeData.nutrientId) ||
              !isValidGuid(attributeData.ageGroupId)
            }
          >
            {isEditing ? "Update Attribute" : "Save Attribute"}
          </motion.button>
          <motion.button
            onClick={onClose}
            className="nutrient-specialist-button secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Component
const NutrientSuggestion = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [nutrients, setNutrients] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState({ name: "" });
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [selectedViewSuggestion, setSelectedViewSuggestion] = useState(null);
  const [selectedAttributeSuggestion, setSelectedAttributeSuggestion] =
    useState(null);
  const [selectedEditAttribute, setSelectedEditAttribute] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSidebarPage, setCurrentSidebarPage] = useState(2);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false);
  const [isNutrientDropdownOpen, setIsNutrientDropdownOpen] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const toggleFoodDropdown = () => setIsFoodDropdownOpen((prev) => !prev);
  const toggleNutrientDropdown = () =>
    setIsNutrientDropdownOpen((prev) => !prev);

  const dropdownVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const handleHomepageNavigation = () => {
    setIsSidebarOpen(true);
    navigate("/nutrient-specialist");
  };

  useEffect(() => {
    const fetchUser = () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }
      getCurrentUser(token)
        .then((response) => {
          const userData = response.data?.data || response.data;
          if (userData && Number(userData.roleId) === 4) {
            setUser(userData);
          } else {
            localStorage.removeItem("token");
            setUser(null);
            navigate("/signin", { replace: true });
          }
        })
        .catch((error) => {
          localStorage.removeItem("token");
          setUser(null);
          navigate("/signin", { replace: true });
        });
    };
    fetchUser();
  }, [navigate, token]);

  const showNotification = (message, type) => {
    setNotification(null);
    setTimeout(() => {
      setNotification({ message, type });
      const closeListener = () => {
        setNotification(null);
        document.removeEventListener("closeNotification", closeListener);
      };
      document.addEventListener("closeNotification", closeListener);
    }, 100);
  };

  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suggestionsResponse, nutrientsResponse, ageGroupsResponse] =
        await Promise.all([
          getAllNutrientSuggestions(token),
          getAllNutrients(),
          getAllAgeGroups(),
        ]);
      const suggestionsData = extractData(suggestionsResponse);
      setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
      const nutrientsData = extractData(nutrientsResponse);
      setNutrients(
        Array.isArray(nutrientsData)
          ? nutrientsData.filter((n) => n.id && n.name)
          : []
      );
      const ageGroupsData = extractData(ageGroupsResponse);
      setAgeGroups(
        Array.isArray(ageGroupsData) ? ageGroupsData.filter((g) => g.id) : []
      );
    } catch (err) {
      showNotification(`Failed to fetch data: ${err.message}`, "error");
      setSuggestions([]);
      setNutrients([]);
      setAgeGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestionById = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getNutrientSuggestionById(id, token);
      const data = response.data?.data || response.data || response;
      setSelectedSuggestion(data);
      setNewSuggestion({ name: data.nutrientSuggestionName || "" });
      setIsEditing(true);
    } catch (err) {
      showNotification(
        `Failed to fetch suggestion details: ${err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestionByIdForView = async (id) => {
    setLoading(true);
    try {
      const response = await getNutrientSuggestionById(id, token);
      const data = response.data?.data || response.data || response;
      data.nutrientSuggestionAttributes = Array.isArray(
        data.nutrientSuggestionAttributes
      )
        ? data.nutrientSuggestionAttributes
        : [];
      setSelectedViewSuggestion(data);
    } catch (err) {
      showNotification(
        `Failed to fetch suggestion details: ${err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateSuggestionName = (name) => {
    if (!name.trim()) {
      showNotification("Suggestion name is required", "error");
      return false;
    }
    if (name.length <= 2) {
      showNotification("Suggestion name must be more than 2 characters", "error");
      return false;
    }
    if (!/^[a-zA-Z]/.test(name)) {
      showNotification("Suggestion name must start with a letter", "error");
      return false;
    }
    const isDuplicate = suggestions.some(
      (suggestion) =>
        suggestion.nutrientSuggestionName.toLowerCase() === name.toLowerCase() &&
        (!isEditing || suggestion.id !== selectedSuggestion?.id)
    );
    if (isDuplicate) {
      showNotification("Suggestion name already exists", "error");
      return false;
    }
    return true;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewSuggestion({ ...newSuggestion, name });
  };

  const createSuggestionHandler = async () => {
    if (!validateSuggestionName(newSuggestion.name)) {
      return;
    }
    setLoading(true);
    try {
      await createNutrientSuggestion({ name: newSuggestion.name }, token);
      setNewSuggestion({ name: "" });
      setIsEditing(false);
      await fetchData();
      showNotification("Nutrient suggestion created successfully", "success");
    } catch (err) {
      showNotification(
        `Failed to create suggestion: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestionHandler = async () => {
    if (!validateSuggestionName(newSuggestion.name)) {
      return;
    }
    if (!selectedSuggestion?.id) {
      showNotification("Invalid suggestion ID", "error");
      return;
    }
    setLoading(true);
    try {
      await updateNutrientSuggestion(
        {
          id: selectedSuggestion.id,
          nutrientSuggetionName: newSuggestion.name,
        },
        token
      );
      setNewSuggestion({ name: "" });
      setSelectedSuggestion(null);
      setIsEditing(false);
      await fetchData();
      showNotification("Nutrient suggestion updated successfully", "success");
    } catch (err) {
      showNotification(
        `Failed to update suggestion: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSuggestionHandler = async (id, attributesCount) => {
    if (!id) return;
    if (attributesCount > 0) {
      showNotification(
        "There are attributes inside. Please delete attributes first.",
        "error"
      );
      return;
    }
    if (!window.confirm("Are you sure you want to delete this suggestion?"))
      return;
    setLoading(true);
    try {
      await deleteNutrientSuggestion(id, token);
      setSelectedSuggestion(null);
      setIsEditing(false);
      setNewSuggestion({ name: "" });
      await fetchData();
      showNotification("Nutrient suggestion deleted successfully", "success");
    } catch (err) {
      showNotification(
        `Failed to delete suggestion: ${
          err.response?.data?.message || err.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = async (attributeData, isEditing = false) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateNutrientSuggestionAttribute(attributeData, token);
        showNotification("Attribute updated successfully", "success");
      } else {
        await addNutrientSuggestionAttribute(attributeData, token);
        showNotification("Attribute added successfully", "success");
      }
      await fetchData();
      if (selectedViewSuggestion) {
        await fetchSuggestionByIdForView(selectedViewSuggestion.id);
      }
    } catch (error) {
      showNotification(
        `Failed to ${isEditing ? "update" : "add"} attribute: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
      setSelectedAttributeSuggestion(null);
      setSelectedEditAttribute(null);
    }
  };

  const handleDeleteAttribute = async (attribute, closeViewModal) => {
    if (!window.confirm("Are you sure you want to delete this attribute?"))
      return;
    setLoading(true);
    try {
      if (!attribute.attributeId) {
        throw new Error("Attribute ID is missing");
      }
      await deleteNutrientSuggestionAttribute(
        selectedViewSuggestion.id,
        attribute.attributeId,
        token
      );
      showNotification("Attribute deleted successfully", "success");
      await fetchData();
      if (selectedViewSuggestion) {
        await fetchSuggestionByIdForView(selectedViewSuggestion.id);
      }
    } catch (error) {
      showNotification(
        `Failed to delete attribute: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
    } finally {
      setLoading(false);
      if (closeViewModal) {
        closeViewModal();
      }
    }
  };

  const closeAllModals = () => {
    setSelectedViewSuggestion(null);
    setSelectedAttributeSuggestion(null);
    setSelectedEditAttribute(null);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      if (user?.userId) await logout(user.userId, token);
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsSidebarOpen(true);
      navigate("/signin", { replace: true });
    }
  };

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSuggestions = suggestions.filter((suggestion) =>
    (suggestion.nutrientSuggestionName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastSuggestion = currentPage * itemsPerPage;
  const indexOfFirstSuggestion = indexOfLastSuggestion - itemsPerPage;
  const currentSuggestions = filteredSuggestions.slice(
    indexOfFirstSuggestion,
    indexOfLastSuggestion
  );

  const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      },
    },
    hover: {
      scale: 1.1,
      filter: "brightness(1.15)",
      transition: { duration: 0.3 },
    },
  };

  const sidebarVariants = {
    open: { width: "280px", transition: { duration: 0.3, ease: "easeOut" } },
    closed: { width: "60px", transition: { duration: 0.3, ease: "easeIn" } },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20, backgroundColor: "rgba(0, 0, 0, 0)" },
    animate: {
      opacity: 1,
      x: 0,
      backgroundColor: "rgba(0, 0, 0, 0)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      backgroundColor: "#4caf50",
      transform: "translateY(-2px)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="nutrient-suggestion">
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}
      </AnimatePresence>
      <motion.aside
        className={`nutrient-specialist-sidebar ${
          isSidebarOpen ? "open" : "closed"
        }`}
        variants={sidebarVariants}
        animate={isSidebarOpen ? "open" : "closed"}
        initial={window.innerWidth > 768 ? "open" : "closed"}
      >
        <div className="sidebar-header">
          <Link
            to="/nutrient-specialist"
            className="logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="logo-svg-container"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Leaf icon for nutrient specialist panel"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 3.5 2.5 6.5 5.5 8C6 21 5 22 5 22s2-2 4-2c2 0 3 1 3 1s1-1 3-1c2 0 4 2 4 2s-1-1-2.5-2C17.5 18.5 20 15.5 20 12c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                  fill="var(--nutrient-specialist-highlight)"
                  stroke="var(--nutrient-specialist-primary)"
                  strokeWidth="1.5"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span className="logo-text">Nutrient Panel</span>}
          </Link>
          <motion.button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--nutrient-specialist-white)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isSidebarOpen
                    ? "M13 18L7 12L13 6M18 18L12 12L18 6"
                    : "M6 18L12 12L6 6M11 18L17 12L11 6"
                }
              />
            </svg>
          </motion.button>
        </div>
        <motion.nav
          className="sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          {currentSidebarPage === 1 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  onClick={handleHomepageNavigation}
                  title="Homepage"
                  aria-label="Navigate to homepage"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Home icon for homepage"
                  >
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12h6v10"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Homepage</span>}
                </button>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/blog-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Blog Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Blog icon for blog management"
                  >
                    <path
                      d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Blog Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  onClick={toggleFoodDropdown}
                  className="food-dropdown-toggle"
                  aria-label={
                    isFoodDropdownOpen
                      ? "Collapse food menu"
                      : "Expand food menu"
                  }
                  title="Food"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Food icon for food management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4l2 6-6 2 6 2 2-6-2-6z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Food</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${
                        isFoodDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isFoodDropdownOpen ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="food-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && isFoodDropdownOpen ? "open" : "closed"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/food-category-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Category Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Category icon for food category management"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="var(--nutrient-specialist-secondary)"
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item food-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/food-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Food Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Food item icon for food management"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="var(--nutrient-specialist-accent)"
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Food Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  onClick={toggleNutrientDropdown}
                  className="nutrient-dropdown-toggle"
                  aria-label={
                    isNutrientDropdownOpen
                      ? "Collapse nutrient menu"
                      : "Expand nutrient menu"
                  }
                  title="Nutrient"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient icon for nutrient management"
                  >
                    <path
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient</span>}
                  {isSidebarOpen && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`dropdown-icon ${
                        isNutrientDropdownOpen ? "open" : ""
                      }`}
                    >
                      <path
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          isNutrientDropdownOpen
                            ? "M6 9l6 6 6-6"
                            : "M6 15l6-6 6 6"
                        }
                      />
                    </svg>
                  )}
                </button>
              </motion.div>
              <motion.div
                className="nutrient-dropdown"
                variants={dropdownVariants}
                animate={
                  isSidebarOpen && isNutrientDropdownOpen ? "open" : "closed"
                }
                initial="closed"
              >
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/nutrient-category-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Nutrient Category Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Category icon for nutrient category management"
                    >
                      <path
                        d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                        fill="var(--nutrient-specialist-secondary)"
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Category Management</span>}
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemVariants}
                  className="sidebar-nav-item nutrient-dropdown-item"
                >
                  <Link
                    to="/nutrient-specialist/nutrient-management"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Nutrient Management"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Nutrient item icon for nutrient management"
                    >
                      <path
                        d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-2 2h4v8h-4V6z"
                        fill="var(--nutrient-specialist-accent)"
                        stroke="var(--nutrient-specialist-white)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isSidebarOpen && <span>Nutrient Management</span>}
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/nutrient-in-food-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient in Food Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient in food icon"
                  >
                    <path
                      d="M12 2c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8zm0 2c-3 0-5 2-5 6s2 6 5 6 5-2 5-6-2-6-5-6zm-3 2h6v2H9v-2zm0 4h6v2H9v-2z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient in Food Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/age-group-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Age Group Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Users icon for age group management"
                  >
                    <path
                      d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m14-10a4 4 0 010-8m-6 4a4 4 0 11-8 0 4 4 0 018 0zm10 13v-2a4 4 0 00-3-3.87"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Age Group Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/dish-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Dish Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Plate icon for dish management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 8a4 4 0 014-4 4 4 0 014 4"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Dish Management</span>}
                </Link>
              </motion.div>
            </>
          )}
          {currentSidebarPage === 2 && (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/allergy-category-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Category Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Category icon for allergy category management"
                  >
                    <path
                      d="M4 4h16v2H4V4zm0 7h16v2H4v-2zm0 7h16v2H4v-2z"
                      fill="var(--nutrient-specialist-secondary)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Category Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/allergy-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Allergy Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Allergy icon for allergy management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4m0 4v2"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Allergy Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/disease-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Disease Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Medical icon for disease management"
                  >
                    <path
                      d="M19 7h-3V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3H5a2 2 0 00-2 2v6a2 2 0 002 2h3v3a2 2 0 002 2h4a2 2 0 002-2v-3h3a2 2 0 002-2V9a2 2 0 00-2-2zm-7 10v3h-2v-3H7v-2h3V9h2v3h3v2h-3z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Disease Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/warning-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Warning Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Warning icon for warning management"
                  >
                    <path
                      d="M12 2l10 20H2L12 2zm0 4v8m0 4v2"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Warning Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/meal-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Meal Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Meal icon for meal management"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm-4 4h8v2H8v-2zm0 4h8v2H8v-2z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Meal Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/energy-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Energy Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Energy icon for energy suggestion"
                  >
                    <path
                      d="M12 2l-6 9h4v7l6-9h-4V2zm-2 9h4m-4-7v3m4 3v3"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Energy Suggestion</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item active"
              >
                <Link
                  to="/nutrient-specialist/nutrient-suggestion"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Suggestion"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Nutrient suggestion icon for nutrient suggestion"
                  >
                    <path
                      d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4h4m-4 2v2"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Suggestion</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/messenger-management"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Messenger Management"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Messenger icon for messenger management"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Messenger Management</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/nutrient-policy"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Policy"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Document icon for nutrient policy"
                  >
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Policy</span>}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <Link
                  to="/nutrient-specialist/nutrient-tutorial"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Nutrient Tutorial"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Book icon for nutrient tutorial"
                  >
                    <path
                      d="M4 19.5A2.5 2.5 0 016.5 17H20m-16 0V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6.5"
                      fill="var(--nutrient-specialist-accent)"
                      stroke="var(--nutrient-specialist-white)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isSidebarOpen && <span>Nutrient Tutorial</span>}
                </Link>
              </motion.div>
            </>
          )}
          <motion.div
            variants={navItemVariants}
            className="sidebar-nav-item page-switcher"
          >
            <button
              onClick={() => setCurrentSidebarPage(1)}
              className={currentSidebarPage === 1 ? "active" : ""}
              aria-label="Switch to sidebar page 1"
              title="<<"
            >
              {isSidebarOpen ? "<<" : "<<"}
            </button>
            <button
              onClick={() => setCurrentSidebarPage(2)}
              className={currentSidebarPage === 2 ? "active" : ""}
              aria-label="Switch to sidebar page 2"
              title=">>"
            >
              {isSidebarOpen ? ">>" : ">>"}
            </button>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item nutrient-specialist-profile-section"
              >
                <Link
                  to="/profile"
                  className="nutrient-specialist-profile-info"
                  title={isSidebarOpen ? user.email : "Profile"}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon for profile"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--nutrient-specialist-white)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="nutrient-specialist-profile-email">
                      {user.email}
                    </span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="sidebar-nav-item"
              >
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-label="Logout icon"
                  >
                    <path
                      stroke="var(--nutrient-specialist-logout)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                    />
                  </svg>
                  {isSidebarOpen && <span>Sign Out</span>}
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div
              variants={navItemVariants}
              className="sidebar-nav-item"
              whileHover="hover"
            >
              <Link
                to="/signin"
                onClick={() => setIsSidebarOpen(true)}
                title="Sign In"
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Login icon"
                >
                  <path
                    stroke="var(--nutrient-specialist-white)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-6-4l6-6-6-6m0 12h8"
                  />
                </svg>
                {isSidebarOpen && <span>Sign In</span>}
              </Link>
            </motion.div>
          )}
        </motion.nav>
      </motion.aside>
      <motion.main
        className={`nutrient-specialist-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="management-header">
          <h1>Nutrient Suggestions</h1>
          <p>
            Create and manage nutrient suggestions for personalized dietary
            plans
          </p>
        </div>
        <div className="management-container">
          <div className="form-section">
            <h2>{isEditing ? "Edit Suggestion" : "Create New Suggestion"}</h2>
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="suggestion-name">Suggestion Name</label>
                <input
                  id="suggestion-name"
                  type="text"
                  value={newSuggestion.name}
                  onChange={handleNameChange}
                  placeholder="Enter suggestion name (e.g., High Protein Diet)"
                  className="input-field"
                />
              </div>
              <div className="button-group">
                <motion.button
                  onClick={
                    isEditing
                      ? updateSuggestionHandler
                      : createSuggestionHandler
                  }
                  className="nutrient-specialist-button primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading || !newSuggestion.name.trim()}
                >
                  {isEditing ? "Update" : "Create"}
                </motion.button>
                {isEditing && (
                  <motion.button
                    onClick={() => {
                      setNewSuggestion({ name: "" });
                      setSelectedSuggestion(null);
                      setIsEditing(false);
                    }}
                    className="nutrient-specialist-button secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          <div className="list-section">
            <div className="section-header">
              <h2>All Suggestions</h2>
              <div className="search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    stroke="var(--nutrient-specialist-text)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search suggestions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field"
                />
              </div>
            </div>
            {loading ? (
              <div className="loading-state">
                <p>Loading suggestions...</p>
              </div>
            ) : currentSuggestions.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2a10 10 0 0110 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 4v4m0 4v2"
                    stroke="var(--nutrient-specialist-text)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>No suggestions found.</p>
              </div>
            ) : (
              <>
                <div className="suggestion-list">
                  {currentSuggestions.map((suggestion) => (
                      <motion.div
                      key={suggestion.id}
                      className="suggestion-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="suggestion-content">
                        <h3>{suggestion.nutrientSuggestionName}</h3>
                        <p>
                          Attributes:{" "}
                          {suggestion.nutrientSuggestionAttributes?.length || 0}
                        </p>
                      </div>
                      <div className="suggestion-actions">
                        <motion.button
                          onClick={() => {
                            fetchSuggestionById(suggestion.id);
                          }}
                          className="nutrient-specialist-button primary small"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Edit Suggestion"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() =>
                            deleteSuggestionHandler(
                              suggestion.id,
                              suggestion.nutrientSuggestionAttributes?.length || 0
                            )
                          }
                          className="nutrient-specialist-button danger small"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Delete Suggestion"
                        >
                          Delete
                        </motion.button>
                        <motion.button
                          onClick={() => fetchSuggestionByIdForView(suggestion.id)}
                          className="nutrient-specialist-button secondary small"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="View Details"
                        >
                          View
                        </motion.button>
                        <motion.button
                          onClick={() => setSelectedAttributeSuggestion(suggestion)}
                          className="nutrient-specialist-button primary small"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Add Attribute"
                        >
                          Add Attribute
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <motion.button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`pagination-button ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {index + 1}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.main>

      <AnimatePresence>
        {selectedViewSuggestion && (
          <NutrientSuggestionModal
            suggestion={selectedViewSuggestion}
            onClose={() => setSelectedViewSuggestion(null)}
            ageGroups={ageGroups}
            onEditAttribute={(attr) => {
              setSelectedEditAttribute(attr);
              setSelectedAttributeSuggestion(selectedViewSuggestion);
            }}
            onDeleteAttribute={(attr) => handleDeleteAttribute(attr, () => setSelectedViewSuggestion(null))}
          />
        )}
        {(selectedAttributeSuggestion || selectedEditAttribute) && (
          <NutrientAttributeModal
            suggestionId={selectedAttributeSuggestion?.id}
            nutrients={nutrients}
            ageGroups={ageGroups}
            onClose={closeAllModals}
            onSave={handleAddAttribute}
            onShowNotification={showNotification}
            attribute={selectedEditAttribute}
            isEditing={!!selectedEditAttribute}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutrientSuggestion;