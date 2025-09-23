// src/App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ToastContainer from "./components/popup/ToastContainer";
import { MessageProvider } from "./contexts/MessageContext";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <MessageProvider>
          <AppRouter />
          <ToastContainer />
        </MessageProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;