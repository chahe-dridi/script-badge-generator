import React from "react";
import PropTypes from "prop-types";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/Global.css";
import "./styles/Layout.css";

import Layout from "./components/Layout";
import Toast from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import WhatsNew from "./components/WhatsNew";
import { useAuth } from "./context/AuthContext";

import LandingPage        from "./pages/LandingPage";
import SetupPage          from "./pages/SetupPage";
import DesignPage         from "./pages/DesignPage";
import GalleryPage        from "./pages/GalleryPage";
import ExportPage         from "./pages/ExportPage";
import AboutPage          from "./pages/AboutPage";
import TermsPage          from "./pages/TermsPage";
import PrivacyPage        from "./pages/PrivacyPage";
import ChangelogPage      from "./pages/ChangelogPage";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage     from "./pages/AdminUsersPage";
import AdminPlansPage     from "./pages/AdminPlansPage";

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user?.is_admin) return <Navigate to="/" replace />;
  return children;
}

AdminRoute.propTypes = { children: PropTypes.node.isRequired };

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

          {/* Admin (is_admin = true required) */}
          <Route path="/admin"       element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>}     />
          <Route path="/admin/plans" element={<AdminRoute><AdminPlansPage /></AdminRoute>}     />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
}
