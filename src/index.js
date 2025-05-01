import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { AuthContextProvider } from "context";
import { NotificationProvider } from "context/NotificationContext";

//  2 React Context Provider
import { MaterialUIControllerProvider } from "context";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <BrowserRouter basename="/">
    <AuthContextProvider>
      <MaterialUIControllerProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </MaterialUIControllerProvider>
    </AuthContextProvider>
  </BrowserRouter>
);