import React from "react";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./contexts/UserContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./styles/main.css";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <GoogleOAuthProvider clientId="1034415973183-pg06ng2b0b7ta1ta48kiphk8bpnq2muk.apps.googleusercontent.com">
        <UserProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </UserProvider>
      </GoogleOAuthProvider>
    </I18nextProvider>
  );
}

export default App;
