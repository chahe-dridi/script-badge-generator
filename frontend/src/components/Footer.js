import React from "react";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>BadgeGen</h4>
          <p>Create stunning personalized badges in seconds</p>
        </div>

        <div className="footer-col">
          <h4>Features</h4>
          <ul>
            <li>Instant Canvas Preview</li>
            <li>Arabic & RTL Support</li>
            <li>Advanced Text Effects</li>
            <li>No Server wait for Gallery</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li>Files: TXT, CSV, Excel</li>
            <li>Formats: PNG, JPG, BMP</li>
            <li>Max: 2000 badges per batch</li>
            <li>Export: ZIP download</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Status</h4>
          <div className="status-info">
            <span className="status-badge status-online">Online</span>
            <p className="status-text">All services running</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-left">
          <p>&copy; 2025 BadgeGen. Made with attention to detail.</p>
        </div>
        <div className="footer-right">
          <span className="version">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
