import React from "react";
import "../styles/Pages-Export.css";

export default function ExportPage({
  zipLoading,
  zipProgress,
  zipDone,
  gallery,
  onDownloadZip,
  onBackToGallery,
  onEditDesign,
  onNewProject,
}) {
  return (
    <div className="pg pg-export">
      <div className="exp-card">
        {zipLoading ? (
          <>
            <div className="spinner" />
            <h2 className="exp-h2">Packaging your badges…</h2>
            <div className="exp-prog-wrap">
              <div className="exp-prog">
                <div className="exp-prog-fill" style={{ width: zipProgress + "%" }} />
              </div>
              <div className="exp-count">
                {gallery.length > 0 ? `${zipDone} / ${gallery.length} badges` : `${zipProgress}%`}
              </div>
            </div>
            <div className="exp-status">
              {zipProgress < 20 && "Starting…"}
              {zipProgress >= 20 && zipProgress < 90 && "Building ZIP in browser…"}
              {zipProgress >= 90 && "Finalizing…"}
            </div>
            {gallery.length > 0 && <div className="exp-note">Using cached previews — no server wait!</div>}
          </>
        ) : (
          <>
            <div className="exp-done">✓</div>
            <h2 className="exp-h2">All done!</h2>
            <p className="exp-sub">Your ZIP downloaded automatically.</p>
            <div className="exp-actions">
              <button className="cta cta-on" onClick={onDownloadZip}>
                ⬇ Download again
              </button>
              <button className="cta cta-ghost" onClick={onBackToGallery}>
                ← Back to Gallery
              </button>
              <button className="cta cta-ghost" onClick={onEditDesign}>
                ✏ Edit Design
              </button>
              <button className="cta cta-ghost" onClick={onNewProject}>
                ⌂ New Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
