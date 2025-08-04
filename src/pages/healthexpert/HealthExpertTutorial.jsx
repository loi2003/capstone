import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

import "../../styles/HealthExpertHomePage.css";

const HealthExpertTutorial = () => {
   const navigate = useNavigate();
 
   const handleBack = () => {
     navigate('/health-expert');
   };
 
   return (
     <motion.div
       className="admin-tutorial"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5, ease: 'easeOut' }}
     >
       <header className="tutorial-header">
         <motion.button
           className="tutorial-back-button"
           onClick={handleBack}
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.95 }}
           aria-label="Go back to admin dashboard"
         />
         <h1 className="tutorial-title">Admin Panel Tutorial</h1>
       </header>
       <motion.section
         className="tutorial-content"
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.4 }}
         role="region"
         aria-label="Admin tutorial content"
       >
         <h2>Welcome to the Admin Panel</h2>
         <p>
           This tutorial guides you through using the admin panel to manage your blog platform effectively.
         </p>
         <h3>1. Navigating the Dashboard</h3>
         <p>
           The admin dashboard (<code>/admin</code>) provides an overview of your platform. Use the navigation menu to access:
           - <strong>Blog Category Management</strong>: Create, edit, or delete categories.
           - <strong>Admin Policy</strong>: Review guidelines for admin actions.
           - <strong>Reports</strong>: View analytics and user reports (coming soon).
         </p>
         <h3>2. Managing Blog Categories</h3>
         <p>
           Access the category management page (<code>/admin/categories</code>) to:
           - <strong>Create</strong>: Add new categories using the form.
           - <strong>Edit</strong>: Update category names or toggle active status.
           - <strong>Delete</strong>: Remove categories (confirmation required).
           - <strong>Search & Sort</strong>: Filter categories by name or status, and sort by name or active status.
           - View statistics and a chart of categories added over the last 3 months.
         </p>
         <h3>3. User Management</h3>
         <p>
           Manage user roles and permissions from the dashboard (feature in development). Ensure only authorized users (roleId: 1) access the admin panel.
         </p>
         <h3>4. Best Practices</h3>
         <ul>
           <li>Regularly update category statuses to reflect active content.</li>
           <li>Check reports for insights on platform usage.</li>
           <li>Contact support via the Reports page for issues.</li>
         </ul>
         <p>
           For detailed policies, visit the <Link to="/admin/policy">Admin Policy</Link> page.
         </p>
       </motion.section>
     </motion.div>
   );
};

export default HealthExpertTutorial;