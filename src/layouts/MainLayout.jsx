import React from 'react';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import '../styles/MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;