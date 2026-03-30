import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/Global.css";
import "./styles/Layout.css";

import Layout from "./components/Layout";
import Toast from "./components/Toast";
import SetupPage from "./pages/SetupPage";
import DesignPage from "./pages/DesignPage";
import GalleryPage from "./pages/GalleryPage";
import ExportPage from "./pages/ExportPage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <>
      <div className="noise" />
      <Toast />
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </Layout>
    </>
  );
}
