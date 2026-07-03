import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/Global.css";
import "./styles/Layout.css";

import Layout from "./components/Layout";
import Toast from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import WhatsNew from "./components/WhatsNew";

import LandingPage    from "./pages/LandingPage";
import SetupPage      from "./pages/SetupPage";
import DesignPage     from "./pages/DesignPage";
import GalleryPage    from "./pages/GalleryPage";
import ExportPage     from "./pages/ExportPage";
import AboutPage      from "./pages/AboutPage";
import TermsPage      from "./pages/TermsPage";
import PrivacyPage    from "./pages/PrivacyPage";
import ChangelogPage  from "./pages/ChangelogPage";
import LoginPage      from "./pages/LoginPage";
import RegisterPage   from "./pages/RegisterPage";

export default function App() {
  return (
    <>
      <div className="noise" />
      <ScrollToTop />
      <Toast />
      <WhatsNew />
      <Layout>
        <Routes>
          {/* Core app flow */}
          <Route path="/"        element={<LandingPage />}    />
          <Route path="/setup"   element={<SetupPage />}      />
          <Route path="/design"  element={<DesignPage />}     />
          <Route path="/gallery" element={<GalleryPage />}    />
          <Route path="/export"  element={<ExportPage />}     />

          {/* Auth */}
          <Route path="/login"    element={<LoginPage />}    />
          <Route path="/register" element={<RegisterPage />} />

          {/* Company / Legal */}
          <Route path="/about"     element={<AboutPage />}     />
          <Route path="/terms"     element={<TermsPage />}     />
          <Route path="/privacy"   element={<PrivacyPage />}   />
          <Route path="/changelog" element={<ChangelogPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
}
