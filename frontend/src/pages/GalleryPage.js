import React from "react";
import "../styles/Pages-Gallery.css";

function cls(...a) {
  return a.filter(Boolean).join(" ");
}

export default function GalleryPage({
  gallery,
  galLoading,
  galProgress,
  galFilter,
  onGalFilterChange,
  selIdx,
  onSelIdxChange,
  editName,
  onEditNameChange,
  regenSel,
  selectedBadge,
  filteredGallery,
  onRegenAll,
  onRegenOne,
  onDownloadZip,
  onEditDesign,
  canExport,
  onRemoveBadge,
}) {
  const canNavigate = (direction) => {
    if (direction === "prev") return selIdx > 0;
    if (direction === "next") return selIdx < gallery.length - 1;
    return false;
  };

  return (
    <div className="pg pg-gallery">
      {/* Toolbar */}
      <div className="gbar">
        <div className="gbar-l">
          <span className="gbar-title">Gallery</span>
          <span className="gbar-count">
            {galLoading ? `${gallery.length} / generating…` : `${gallery.length} badges`}
          </span>
          {galLoading && (
            <div className="gbar-prog">
              <div className="gbar-prog-fill" style={{ width: galProgress + "%" }} />
            </div>
          )}
          {!galLoading && gallery.length > 0 && (
            <input
              className="gal-search"
              placeholder="🔍 Search names…"
              value={galFilter}
              onChange={(e) => onGalFilterChange(e.target.value)}
            />
          )}
        </div>
        <div className="gbar-r">
          {!galLoading && gallery.length > 0 && (
            <button className="ghost" onClick={onRegenAll}>
              ↺ Apply Settings to All
            </button>
          )}
          <button className="ghost" onClick={onEditDesign}>
            ✏ Edit Design
          </button>
          <button className={cls("cta cta-sm", canExport && "cta-on")} onClick={onDownloadZip} disabled={!canExport}>
            ⬇ Download ZIP
          </button>
        </div>
      </div>

      <div className="gal-body">
        {/* Grid */}
        <div className="gal-grid">
          {gallery.length === 0 && galLoading && (
            <div className="gal-empty-state">
              <div className="spinner" />
              <p>Building gallery…</p>
            </div>
          )}
          {filteredGallery.map((b) => (
            <div
              key={b._i}
              className={cls("gcard", !b.ok && "gcard-err", selIdx === b._i && "gcard-sel")}
              onClick={() => {
                onSelIdxChange(selIdx === b._i ? null : b._i);
                onEditNameChange(b.name);
              }}
            >
              <div className="gcard-img">
                {b.dataUrl ? <img src={b.dataUrl} alt={b.name} loading="lazy" /> : <div className="gcard-noimg">⚠</div>}
              </div>
              <div className="gcard-foot">
                <span className="gcard-name">{b.name}</span>
                <div className="gcard-btns">
                  <button
                    className="gcard-btn"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelIdxChange(b._i);
                      onEditNameChange(b.name);
                    }}
                  >
                    ✏
                  </button>
                  <button
                    className="gcard-btn"
                    title="Regenerate"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenOne(b._i);
                    }}
                  >
                    ↺
                  </button>
                  {b.dataUrl && (
                    <a
                      className="gcard-btn"
                      href={b.dataUrl}
                      download={`${b.name}_badge.png`}
                      onClick={(e) => e.stopPropagation()}
                      title="Download"
                    >
                      ⬇
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredGallery.length === 0 && !galLoading && galFilter && (
            <div className="gal-empty-state">
              <p>No badges match "{galFilter}"</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        {selIdx !== null && selectedBadge && (
          <div className="gal-side">
            <div className="gside-hdr">
              <span className="gside-title">Edit Badge</span>
              <button className="close-x" onClick={() => onSelIdxChange(null)}>
                ✕
              </button>
            </div>

            <div className="gside-prev">
              {selectedBadge.dataUrl ? (
                <img src={selectedBadge.dataUrl} alt="sel" />
              ) : (
                <div className="gside-noimg">No preview</div>
              )}
            </div>

            <div className="gside-body">
              <label className="dlbl">NAME ON BADGE</label>
              <input
                className="gside-inp"
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRegenOne(selIdx, editName.trim());
                }}
              />

              <div className="gside-actions">
                <button
                  className="gside-btn"
                  onClick={() => onRegenOne(selIdx, editName.trim())}
                >
                  {regenSel ? "↺ Saving…" : "↺ Save & Update"}
                </button>
                {selectedBadge.dataUrl && (
                  <a
                    className="gside-btn gside-dl"
                    href={selectedBadge.dataUrl}
                    download={`${selectedBadge.name}_badge.png`}
                  >
                    ⬇ Download
                  </a>
                )}
                <button
                  className="gside-btn gside-del"
                  onClick={() => {
                    onRemoveBadge(selIdx);
                    onSelIdxChange(null);
                  }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>

            <div className="gside-nav">
              <button
                className="nav-btn"
                disabled={!canNavigate("prev")}
                onClick={() => {
                  const n = selIdx - 1;
                  onSelIdxChange(n);
                  onEditNameChange(gallery[n].name);
                }}
              >
                ← Prev
              </button>
              <span className="nav-pos">
                {selIdx + 1} / {gallery.length}
              </span>
              <button
                className="nav-btn"
                disabled={!canNavigate("next")}
                onClick={() => {
                  const n = selIdx + 1;
                  onSelIdxChange(n);
                  onEditNameChange(gallery[n].name);
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
