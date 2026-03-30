import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-main">{children}</div>
      <Footer />
    </div>
  );
}
