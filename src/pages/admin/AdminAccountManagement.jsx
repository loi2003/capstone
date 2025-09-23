import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getCurrentUser, logout } from '../../apis/authentication-api';
import '../../styles/AdminAccountManagement.css';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`notification ${type}`}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
    >
      <span>{message}</span>
      <button className="notification-close" onClick={onClose} aria-label="Close notification">
        <i className="fas fa-times"></i>
      </button>
    </motion.div>
  );
};

const AdminAccountManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    passwordHash: '',
    phoneNumber: '',
    role: 'health-expert',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [viewError, setViewError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState({ users: 1, staff: 1, clinics: 1 });
  const itemsPerPage = 8;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const roleOptions = [
    { value: 3, label: 'Health Expert', formValue: 'health-expert' },
    { value: 4, label: 'Nutrient Specialist', formValue: 'nutrient-specialist' },
    { value: 5, label: 'Clinic', formValue: 'clinic' },
  ];

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate('/signin', { replace: true });
        return;
      }
      try {
        const response = await getCurrentUser(token);
        const userData = response.data?.data || response.data;
        if (userData && userData.roleId === 1) {
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          setUser(null);
          navigate('/signin', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
        localStorage.removeItem('token');
        setUser(null);
        navigate('/signin', { replace: true });
      }
    };
    fetchUser();
  }, [navigate, token]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const [usersResponse, staffResponse, clinicsResponse] = await Promise.all([
          viewAllUsers(token),
          viewAllStaff(token),
          viewAllClinics(token),
        ]);
        setUsers(usersResponse.data.data?.filter(user => ![6, 7].includes(user.roleId)) || []);
        setStaff(staffResponse.data.data?.filter(staff => ![6, 7].includes(staff.roleId)) || []);
        setClinics(clinicsResponse.data.data?.filter(clinic => ![6, 7].includes(clinic.roleId)) || []);
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

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(formData.userName.trim())) {
      return 'Username must be 3-30 characters long and contain only letters, numbers, hyphens, or underscores.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(formData.passwordHash)) {
      return 'Password must be at least 8 characters long and include both letters and numbers.';
    }
    if (formData.phoneNumber && !/^(?:\+84|0)(?:3[2-9]|5[689]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(formData.phoneNumber.trim())) {
      return 'Phone number must be a valid Vietnamese mobile number (e.g., +84912345678 or 0912345678).';
    }
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
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      addNotification(validationError, 'error');
      setLoading(false);
      return;
    }

    const duplicateError = checkDuplicates();
    if (duplicateError) {
      addNotification(duplicateError, 'error');
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

      addNotification(`Account created successfully: ${userName} (${email}) as ${roleLabel}`, 'success');

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
      setShowPassword(false);
      setActiveTab('view');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to create account. Please check the form and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (email, newRoleId) => {
    setLoadingStates((prev) => ({ ...prev, [email]: true }));

    if ([6, 7].includes(parseInt(newRoleId))) {
      addNotification('Selected role is not available.', 'error');
      setLoadingStates((prev) => ({ ...prev, [email]: false }));
      return;
    }

    try {
      const form = new FormData();
      form.append('Email', email);
      form.append('RoleId', newRoleId);
      const response = await changeAccountAuthorize(form, token);
      addNotification(`Role changed successfully for ${email} to ${roleOptions.find((r) => r.value === parseInt(newRoleId))?.label || 'Unknown'}`, 'success');
      await refreshAccounts();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to change role. Please try again.', 'error');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleBanAccount = async (email, currentStatus) => {
    setLoadingStates((prev) => ({ ...prev, [email]: true }));

    const originalStates = {
      users: [...users],
      staff: [...staff],
      clinics: [...clinics],
    };

    try {
      updateAccountStatus(email, 'inactive');
      const response = await banAccount(email, token);
      addNotification(`Account ${email} banned successfully`, 'success');
      await retryFetchAccounts(email, ['inactive', 'banned', 'suspended']);
    } catch (err) {
      setUsers(originalStates.users);
      setStaff(originalStates.staff);
      setClinics(originalStates.clinics);
      addNotification(err.response?.data?.message || 'Failed to ban account. Please try again.', 'error');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [email]: false }));
    }
  };

  const handleUnbanAccount = async (email, currentStatus) => {
    setLoadingStates((prev) => ({ ...prev, [email]: true }));

    const originalStates = {
      users: [...users],
      staff: [...staff],
      clinics: [...clinics],
    };

    try {
      updateAccountStatus(email, 'active');
      const response = await unbanAccount(email, token);
      addNotification(`Account ${email} unbanned successfully`, 'success');
      await retryFetchAccounts(email, 'active');
    } catch (err) {
      setUsers(originalStates.users);
      setStaff(originalStates.staff);
      setClinics(originalStates.clinics);
      addNotification(err.response?.data?.message || 'Failed to unban account. Please try again.', 'error');
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
    if (!window.confirm(`Are you sure you want to delete the account with email ${email}? This action cannot be undone.`)) {
      return;
    }
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
      addNotification(`Account ${email} deleted successfully`, 'success');
      await refreshAccounts();
    } catch (err) {
      setUsers(originalStates.users);
      setStaff(originalStates.staff);
      setClinics(originalStates.clinics);
      addNotification(err.response?.data?.message || 'Failed to delete account. Please try again.', 'error');
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
      setUsers(usersResponse.data.data?.filter(user => ![6, 7].includes(user.roleId)) || []);
      setStaff(staffResponse.data.data?.filter(staff => ![6, 7].includes(staff.roleId)) || []);
      setClinics(clinicsResponse.data.data?.filter(clinic => ![6, 7].includes(clinic.roleId)) || []);
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
        const newUsers = usersResponse.data.data?.filter(user => ![6, 7].includes(user.roleId)) || [];
        const newStaff = staffResponse.data.data?.filter(staff => ![6, 7].includes(staff.roleId)) || [];
        const newClinics = clinicsResponse.data.data?.filter(clinic => ![6, 7].includes(clinic.roleId)) || [];
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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    try {
      if (user?.id) await logout(user.id);
    } catch (error) {
      console.error('Error logging out:', error.message);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsSidebarOpen(window.innerWidth > 768);
      navigate('/signin', { replace: true });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage({ users: 1, staff: 1, clinics: 1 });
  };

  const filterAccounts = (accounts) => {
    if (!searchQuery) return accounts;
    const query = searchQuery.toLowerCase();
    return accounts.filter(
      (account) =>
        account.userName?.toLowerCase().includes(query) ||
        account.email?.toLowerCase().includes(query) ||
        account.phoneNo?.toLowerCase().includes(query)
    );
  };

  const paginateAccounts = (accounts, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return accounts.slice(startIndex, startIndex + itemsPerPage);
  };

  const getPageCount = (accounts) => Math.ceil(accounts.length / itemsPerPage);

  const renderPagination = (accountType, accounts) => {
    const pageCount = getPageCount(accounts);
    if (pageCount <= 1) return null;
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    return (
      <div className="pagination">
        {pages.map((page) => (
          <button
            key={page}
            className={`pagination-button ${currentPage[accountType] === page ? 'active' : ''}`}
            onClick={() => setCurrentPage((prev) => ({ ...prev, [accountType]: page }))}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  const logoVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
    hover: {
      scale: 1.1,
      filter: 'brightness(1.15)',
      transition: { duration: 0.3 },
    },
  };

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.1 } },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const sidebarVariants = {
    open: {
      width: '240px',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    closed: {
      width: '56px',
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <div className="admin-account-management">
      <motion.aside
        className="admin-account-management__sidebar"
        variants={sidebarVariants}
        animate={isSidebarOpen ? 'open' : 'closed'}
        initial={window.innerWidth > 768 ? 'open' : 'closed'}
      >
        <div className="admin-account-management__sidebar-header">
          <Link
            to="/admin"
            className="admin-account-management__logo"
            onClick={() => setIsSidebarOpen(true)}
          >
            <motion.div
              variants={logoVariants}
              animate="animate"
              whileHover="hover"
              className="admin-account-management__logo-svg-container"
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Admin icon for admin panel"
              >
                <path
                  d="M3 9h18M9 3v18M3 15h18M6 12h12M12 3v18"
                  fill="var(--admin-accent)"
                  stroke="var(--admin-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            {isSidebarOpen && <span>Admin Panel</span>}
          </Link>
          <motion.button
            className="admin-account-management__sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="var(--admin-background)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isSidebarOpen
                    ? 'M13 18L7 12L13 6M18 18L12 12L18 6'
                    : 'M6 18L12 12L6 6M11 18L17 12L11 6'
                }
              />
            </svg>
          </motion.button>
        </div>
        <motion.nav
          className="admin-account-management__sidebar-nav"
          aria-label="Sidebar navigation"
          initial="initial"
          animate="animate"
          variants={containerVariants}
        >
          <motion.div
            variants={navItemVariants}
            className="admin-account-management__sidebar-nav-item"
          >
            <Link
              to="/admin"
              onClick={() => setIsSidebarOpen(true)}
              title="Dashboard"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3"
                />
              </svg>
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="admin-account-management__sidebar-nav-item"
          >
            <Link
              to="/admin/categories"
              onClick={() => setIsSidebarOpen(true)}
              title="Blog Categories"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 4h10m-10 4h10m-10 4h10"
                />
              </svg>
              {isSidebarOpen && <span>Blog Categories</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="admin-account-management__sidebar-nav-item"
          >
            <Link
              to="/admin/tutorial"
              onClick={() => setIsSidebarOpen(true)}
              title="Tutorial Management"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-6-6h12"
                />
              </svg>
              {isSidebarOpen && <span>Tutorial Management</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="admin-account-management__sidebar-nav-item"
          >
            <Link
              to="/admin/policy"
              onClick={() => setIsSidebarOpen(true)}
              title="Admin Policy"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v20m-8-4h16M4 6h16"
                />
              </svg>
              {isSidebarOpen && <span>Admin Policy</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="admin-account-management__sidebar-nav-item"
          >
            <Link
              to="/admin/account-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Account Management"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                />
              </svg>
              {isSidebarOpen && <span>Account Management</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="admin-account-management__sidebar-nav-item"
          >
            <Link
              to="/admin/system-configuration"
              onClick={() => setIsSidebarOpen(true)}
              title="System Configuration"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 0v-6m0 18v-6m6 0h6m-18 0H3"
                />
              </svg>
              {isSidebarOpen && <span>System Configuration</span>}
            </Link>
          </motion.div>
          <motion.div
            variants={navItemVariants}
            className="admin-account-management__sidebar-nav-item"
          >
            <Link
              to="/admin/payment-management"
              onClick={() => setIsSidebarOpen(true)}
              title="Payment Management"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="var(--admin-background)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18v12H3zm4 4h10m-10 4h10"
                />
              </svg>
              {isSidebarOpen && <span>Payment Management</span>}
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                variants={navItemVariants}
                className="admin-account-management__sidebar-nav-item admin-account-management__admin-profile-section"
              >
                <Link
                  to="/profile"
                  className="admin-account-management__admin-profile-info"
                  title={isSidebarOpen ? user.email : ''}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="User icon for profile"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill="var(--admin-background)"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="admin-account-management__admin-profile-email">
                      {user.email}
                    </span>
                  )}
                </Link>
              </motion.div>
              <motion.div
                variants={navItemVariants}
                className="admin-account-management__sidebar-nav-item"
              >
                <button
                  className="admin-account-management__logout-button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="var(--admin-logout)"
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
              className="admin-account-management__sidebar-nav-item"
            >
              <Link
                to="/signin"
                onClick={() => setIsSidebarOpen(true)}
                title="Sign In"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="var(--admin-background)"
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
      <main className={`admin-account-management__content ${isSidebarOpen ? '' : 'closed'}`}>
        <motion.div
          className="admin-account-management__inner"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="notification-container">
            <AnimatePresence>
              {notifications.map((notification) => (
                <Notification
                  key={notification.id}
                  message={notification.message}
                  type={notification.type}
                  onClose={() => removeNotification(notification.id)}
                />
              ))}
            </AnimatePresence>
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
            <motion.div className="account-form-container" variants={cardVariants}>
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
                <div className="form-group password-group">
                  <label htmlFor="passwordHash">Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="passwordHash"
                      name="passwordHash"
                      value={formData.passwordHash}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password (min 8 characters)"
                      aria-describedby="passwordHelp"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={toggleShowPassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <i className="fas fa-eye-slash" aria-hidden="true"></i>
                      ) : (
                        <i className="fas fa-eye" aria-hidden="true"></i>
                      )}
                      <span className="toggle-password-fallback" aria-hidden="true">
                        {showPassword ? 'Hide' : 'Show'}
                      </span>
                    </button>
                  </div>
                  <small id="passwordHelp" className="form-text">
                    Password must be at least 8 characters with letters and numbers.
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter Vietnamese phone number (e.g., +84912345678)"
                  />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                  <i className="fas fa-plus-circle"></i> {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'view' && (
            <motion.div className="account-view-container" variants={containerVariants} initial="initial" animate="animate">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by username, email, or phone..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
              {viewError && <div className="error-message">{viewError}</div>}
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
                  {paginateAccounts(filterAccounts(users), currentPage.users).length > 0 ? (
                    paginateAccounts(filterAccounts(users), currentPage.users).map((user) => (
                      <motion.tr key={user.id} variants={navItemVariants}>
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
              {renderPagination('users', filterAccounts(users))}

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
                  {paginateAccounts(filterAccounts(staff), currentPage.staff).length > 0 ? (
                    paginateAccounts(filterAccounts(staff), currentPage.staff).map((staffMember) => (
                      <motion.tr key={staffMember.id} variants={navItemVariants}>
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
              {renderPagination('staff', filterAccounts(staff))}

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
                  {paginateAccounts(filterAccounts(clinics), currentPage.clinics).length > 0 ? (
                    paginateAccounts(filterAccounts(clinics), currentPage.clinics).map((clinic) => (
                      <motion.tr key={clinic.id} variants={navItemVariants}>
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
              {renderPagination('clinics', filterAccounts(clinics))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminAccountManagement;