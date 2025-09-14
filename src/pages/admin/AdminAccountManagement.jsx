import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  createHealthExpertAccount,
  createNutrientSpecialistAccount,
  createClinicAccount,
  viewAllUsers,
  viewAllStaff,
  viewAllClinics,
  changeAccountAuthorize,
  banAccount,
  unbanAccount,
  hardDeleteAccount,
} from '../../apis/account-api';
import '../../styles/AdminAccountManagement.css';

const AdminAccountManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    passwordHash: '',
    phoneNumber: '',
    role: 'health-expert',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [viewError, setViewError] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const roleOptions = [
    { value: 3, label: 'Health Expert', formValue: 'health-expert' },
    { value: 4, label: 'Nutrient Specialist', formValue: 'nutrient-specialist' },
    { value: 5, label: 'Clinic', formValue: 'clinic' },
  ];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const [usersResponse, staffResponse, clinicsResponse] = await Promise.all([
          viewAllUsers(token),
          viewAllStaff(token),
          viewAllClinics(token),
        ]);
        setUsers(usersResponse.data.data || []);
        setStaff(staffResponse.data.data || []);
        setClinics(clinicsResponse.data.data || []);
      } catch (err) {
        setViewError('Failed to load accounts. Please try again.');
      }
    };
    if (token) {
      fetchAccounts();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Username: alphanumeric, hyphens, underscores, 3-30 characters
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(formData.userName.trim())) {
      return 'Username must be 3-30 characters long and contain only letters, numbers, hyphens, or underscores.';
    }
    // Email: standard email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    // Password: at least 8 characters, includes letter and number
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(formData.passwordHash)) {
      return 'Password must be at least 8 characters long and include both letters and numbers.';
    }
    // Phone number: optional, but if provided, must match a basic phone format
    if (formData.phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.trim())) {
      return 'Phone number must be a valid international format (e.g., +1234567890).';
    }
    // Role: must be one of the allowed values
    if (!roleOptions.some((role) => role.formValue === formData.role)) {
      return 'Invalid role selected.';
    }
    return null;
  };

  const checkDuplicates = () => {
    const allAccounts = [...users, ...staff, ...clinics];
    if (allAccounts.some((account) => account.userName?.toLowerCase() === formData.userName.trim().toLowerCase())) {
      return `Username "${formData.userName}" is already taken.`;
    }
    if (allAccounts.some((account) => account.email?.toLowerCase() === formData.email.trim().toLowerCase())) {
      return `Email "${formData.email}" is already in use.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    // Check for duplicates
    const duplicateError = checkDuplicates();
    if (duplicateError) {
      setError(duplicateError);
      setLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('UserName', formData.userName.trim());
      form.append('Email', formData.email.trim());
      form.append('PasswordHash', formData.passwordHash);
      form.append('PhoneNumber', formData.phoneNumber.trim() || '');

      let response;
      let roleLabel;
      let updateState;
      const selectedRole = roleOptions.find((r) => r.formValue === formData.role);

      switch (formData.role) {
        case 'health-expert':
          response = await createHealthExpertAccount(form, token);
          roleLabel = 'Health Expert';
          updateState = setStaff;
          break;
        case 'nutrient-specialist':
          response = await createNutrientSpecialistAccount(form, token);
          roleLabel = 'Nutrient Specialist';
          updateState = setStaff;
          break;
        case 'clinic':
          response = await createClinicAccount(form, token);
          roleLabel = 'Clinic';
          updateState = setClinics;
          break;
        default:
          throw new Error('Invalid role selected');
      }

      const userName = response.data?.data?.userName || formData.userName.trim();
      const email = response.data?.data?.email || formData.email.trim();
      const phoneNo = response.data?.data?.phoneNo || formData.phoneNumber.trim() || 'N/A';
      const status = response.data?.data?.status || 'active';
      const id = response.data?.data?.id || `temp-${Date.now()}`;
      const roleId = response.data?.data?.roleId || selectedRole.value;

      setSuccess(`Account created successfully: ${userName} (${email}) as ${roleLabel}`);

      const newAccount = {
        id,
        userName,
        email,
        phoneNo,
        status,
        roleId,
        avatar: response.data?.data?.avatar || { fileUrl: '', fileName: '', fileType: '' },
      };
      updateState((prev) => [...prev, newAccount]);

      await refreshAccounts();

      setFormData({
        userName: '',
        email: '',
        passwordHash: '',
        phoneNumber: '',
        role: 'health-expert',
      });
      setActiveTab('view');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (email, newRoleId) => {
    setError(null);
    setSuccess(null);
    setLoadingStates((prev) => ({ ...prev, [email]: true }));

    try {
      const form = new FormData();
      form.append('Email', email);
      form.append('RoleId', newRoleId);
      const response = await changeAccountAuthorize(form, token);
      setSuccess(`Role changed successfully for ${email} to ${roleOptions.find((r) => r.value === newRoleId)?.label}`);
      await refreshAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role. Please try again.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleBanAccount = async (email, currentStatus) => {
    setError(null);
    setSuccess(null);
    setLoadingStates((prev) => ({ ...prev, [email]: true }));

    const originalStates = {
      users: [...users],
      staff: [...staff],
      clinics: [...clinics],
    };

    try {
      updateAccountStatus(email, 'inactive');
      const response = await banAccount(email, token);
      setSuccess(`Account ${email} banned successfully`);
      await retryFetchAccounts(email, ['inactive', 'banned', 'suspended']);
    } catch (err) {
      setUsers(originalStates.users);
      setStaff(originalStates.staff);
      setClinics(originalStates.clinics);
      setError(err.response?.data?.message || 'Failed to ban account. Please try again.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleUnbanAccount = async (email, currentStatus) => {
    setError(null);
    setSuccess(null);
    setLoadingStates((prev) => ({ ...prev, [email]: true }));

    const originalStates = {
      users: [...users],
      staff: [...staff],
      clinics: [...clinics],
    };

    try {
      updateAccountStatus(email, 'active');
      const response = await unbanAccount(email, token);
      setSuccess(`Account ${email} unbanned successfully`);
      await retryFetchAccounts(email, 'active');
    } catch (err) {
      setUsers(originalStates.users);
      setStaff(originalStates.staff);
      setClinics(originalStates.clinics);
      setError(err.response?.data?.message || 'Failed to unban account. Please try again.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleToggleBan = (email, action, status) => {
    if (action === 'ban') {
      handleBanAccount(email, status);
    } else if (action === 'unban') {
      handleUnbanAccount(email, status);
    }
  };

  const handleDeleteAccount = async (email) => {
    setError(null);
    setSuccess(null);
    setLoadingStates((prev) => ({ ...prev, [email]: true }));

    const originalStates = {
      users: [...users],
      staff: [...staff],
      clinics: [...clinics],
    };

    try {
      setUsers((prev) => prev.filter((user) => user.email !== email));
      setStaff((prev) => prev.filter((staff) => staff.email !== email));
      setClinics((prev) => prev.filter((clinic) => clinic.email !== email));
      const response = await hardDeleteAccount(email, token);
      setSuccess(`Account ${email} deleted successfully`);
      await refreshAccounts();
    } catch (err) {
      setUsers(originalStates.users);
      setStaff(originalStates.staff);
      setClinics(originalStates.clinics);
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [email]: false }));
    }
  };

  const refreshAccounts = async () => {
    try {
      const [usersResponse, staffResponse, clinicsResponse] = await Promise.all([
        viewAllUsers(token),
        viewAllStaff(token),
        viewAllClinics(token),
      ]);
      setUsers(usersResponse.data.data || []);
      setStaff(staffResponse.data.data || []);
      setClinics(clinicsResponse.data.data || []);
    } catch (err) {
      setViewError('Failed to refresh account lists.');
    }
  };

  const retryFetchAccounts = async (email, expectedStatuses, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const [usersResponse, staffResponse, clinicsResponse] = await Promise.all([
          viewAllUsers(token),
          viewAllStaff(token),
          viewAllClinics(token),
        ]);
        const newUsers = usersResponse.data.data || [];
        const newStaff = staffResponse.data.data || [];
        const newClinics = clinicsResponse.data.data || [];
        setUsers(newUsers);
        setStaff(newStaff);
        setClinics(newClinics);

        const account = [
          ...newUsers,
          ...newStaff,
          ...newClinics,
        ].find((acc) => acc.email === email);

        if (account && (Array.isArray(expectedStatuses) ? expectedStatuses.includes(account.status?.toLowerCase()) : account.status?.toLowerCase() === expectedStatuses)) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (err) {
        if (i === retries - 1) {
          setViewError('Failed to refresh account status after action. Using last known status.');
          updateAccountStatus(email, Array.isArray(expectedStatuses) ? expectedStatuses[0] : expectedStatuses);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const updateAccountStatus = (email, status) => {
    setUsers((prev) =>
      prev.map((user) => (user.email === email ? { ...user, status } : user))
    );
    setStaff((prev) =>
      prev.map((staff) => (staff.email === email ? { ...staff, status } : staff))
    );
    setClinics((prev) =>
      prev.map((clinic) => (clinic.email === email ? { ...clinic, status } : clinic))
    );
  };

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const formVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const tableVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.1 } },
  };

  const rowVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <motion.div
        className="admin-account-management"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <div className="back-button-container">
          <button
            className="back-button"
            onClick={() => navigate('/admin')}
            aria-label="Back to Admin Home"
            title="Back to Admin Home"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <h1 className="admin-account-title">Account Management</h1>
        <p className="admin-account-description">
          Create, view, or manage accounts for Health Experts, Nutrient Specialists, or Clinics.
        </p>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <i className="fas fa-plus-circle"></i> Create Account
          </button>
          <button
            className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <i className="fas fa-eye"></i> View Accounts
          </button>
        </div>

        {activeTab === 'create' && (
          <motion.div className="account-form-container" variants={formVariants}>
            <form onSubmit={handleSubmit} className="account-form">
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.formValue}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="userName">Username</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter username (3-30 characters)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="passwordHash">Password</label>
                <input
                  type="password"
                  id="passwordHash"
                  name="passwordHash"
                  value={formData.passwordHash}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password (min 8 characters)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number (e.g., +1234567890)"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              <button type="submit" className="submit-button" disabled={loading}>
                <i className="fas fa-plus-circle"></i> {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'view' && (
          <motion.div className="account-view-container" variants={tableVariants} initial="initial" animate="animate">
            {viewError && <div className="error-message">{viewError}</div>}
            {success && <div className="success-message">{success}</div>}
            <h2 className="account-view-title">Users</h2>
            <table className="account-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <motion.tr key={user.id} variants={rowVariants}>
                      <td>{user.userName || user.username || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.phoneNo || user.phone || 'N/A'}</td>
                      <td>{user.status || 'N/A'}</td>
                      <td>{roleOptions.find((r) => r.value === user.roleId)?.label || 'Unknown'}</td>
                      <td className="action-buttons">
                        <select
                          onChange={(e) => handleChangeRole(user.email, parseInt(e.target.value))}
                          value={user.roleId || ''}
                          disabled={loadingStates[user.email]}
                        >
                          <option value="">Select Role</option>
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className="action-button ban"
                          onClick={() => handleToggleBan(user.email, 'ban', user.status)}
                          disabled={user.status?.toLowerCase() !== 'active' || loadingStates[user.email]}
                          aria-label="Ban Account"
                          title="Ban Account"
                        >
                          Ban
                        </button>
                        <button
                          className="action-button unban"
                          onClick={() => handleToggleBan(user.email, 'unban', user.status)}
                          disabled={user.status?.toLowerCase() === 'active' || loadingStates[user.email]}
                          aria-label="Unban Account"
                          title="Unban Account"
                        >
                          Unban
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDeleteAccount(user.email)}
                          disabled={loadingStates[user.email]}
                          aria-label="Delete Account"
                          title="Delete Account"
                        ></button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <h2 className="account-view-title">Staff</h2>
            <table className="account-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.length > 0 ? (
                  staff.map((staffMember) => (
                    <motion.tr key={staffMember.id} variants={rowVariants}>
                      <td>{staffMember.userName || staffMember.username || 'N/A'}</td>
                      <td>{staffMember.email || 'N/A'}</td>
                      <td>{staffMember.phoneNo || staffMember.phone || 'N/A'}</td>
                      <td>{staffMember.status || 'N/A'}</td>
                      <td>{roleOptions.find((r) => r.value === staffMember.roleId)?.label || 'Unknown'}</td>
                      <td className="action-buttons">
                        <select
                          onChange={(e) => handleChangeRole(staffMember.email, parseInt(e.target.value))}
                          value={staffMember.roleId || ''}
                          disabled={loadingStates[staffMember.email]}
                        >
                          <option value="">Select Role</option>
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className="action-button ban"
                          onClick={() => handleToggleBan(staffMember.email, 'ban', staffMember.status)}
                          disabled={staffMember.status?.toLowerCase() !== 'active' || loadingStates[staffMember.email]}
                          aria-label="Ban Account"
                          title="Ban Account"
                        >
                          Ban
                        </button>
                        <button
                          className="action-button unban"
                          onClick={() => handleToggleBan(staffMember.email, 'unban', staffMember.status)}
                          disabled={staffMember.status?.toLowerCase() === 'active' || loadingStates[staffMember.email]}
                          aria-label="Unban Account"
                          title="Unban Account"
                        >
                          Unban
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDeleteAccount(staffMember.email)}
                          disabled={loadingStates[staffMember.email]}
                          aria-label="Delete Account"
                          title="Delete Account"
                        ></button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No staff found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <h2 className="account-view-title">Clinics</h2>
            <table className="account-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clinics.length > 0 ? (
                  clinics.map((clinic) => (
                    <motion.tr key={clinic.id} variants={rowVariants}>
                      <td>{clinic.userName || clinic.username || 'N/A'}</td>
                      <td>{clinic.email || 'N/A'}</td>
                      <td>{clinic.phoneNo || clinic.phone || 'N/A'}</td>
                      <td>{clinic.status || 'N/A'}</td>
                      <td>{roleOptions.find((r) => r.value === clinic.roleId)?.label || 'Unknown'}</td>
                      <td className="action-buttons">
                        <select
                          onChange={(e) => handleChangeRole(clinic.email, parseInt(e.target.value))}
                          value={clinic.roleId || ''}
                          disabled={loadingStates[clinic.email]}
                        >
                          <option value="">Select Role</option>
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className="action-button ban"
                          onClick={() => handleToggleBan(clinic.email, 'ban', clinic.status)}
                          disabled={clinic.status?.toLowerCase() !== 'active' || loadingStates[clinic.email]}
                          aria-label="Ban Account"
                          title="Ban Account"
                        >
                          Ban
                        </button>
                        <button
                          className="action-button unban"
                          onClick={() => handleToggleBan(clinic.email, 'unban', clinic.status)}
                          disabled={clinic.status?.toLowerCase() === 'active' || loadingStates[clinic.email]}
                          aria-label="Unban Account"
                          title="Unban Account"
                        >
                          Unban
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleDeleteAccount(clinic.email)}
                          disabled={loadingStates[clinic.email]}
                          aria-label="Delete Account"
                          title="Delete Account"
                        ></button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No clinics found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default AdminAccountManagement;