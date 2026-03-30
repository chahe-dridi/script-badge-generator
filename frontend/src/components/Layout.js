import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/Layout.css";

export default function Layout({ page, onPageChange, event_name, children }) {
  return (
    <div className="layout">
      <Navbar page={page} onPageChange={onPageChange} event_name={event_name} />
      <div className="layout-main">{children}</div>
      <Footer />
    </div>
  );
}
