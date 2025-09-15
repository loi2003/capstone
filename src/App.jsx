// src/App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ToastContainer from "./components/popup/ToastContainer";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppRouter />
        <ToastContainer />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;