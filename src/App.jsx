// src/App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;