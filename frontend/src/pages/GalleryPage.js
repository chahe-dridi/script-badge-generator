import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBadgeContext } from '../context/BadgeContext';
import '../styles/Pages-Gallery.css';

function cls(...a) {
  return a.filter(Boolean).join(' ');
}

export default function GalleryPage() {
  const navigate = useNavigate();
  const {
    gallery,
    galLoading,
    galProgress,
    buildGallery,
    regenOne,
    downloadZip,
    templateFile,
    namesFile,
    names,
    cfg,
    updateGalleryItem,
    removeGalleryItem
  } = useBadgeContext();

  const [galFilter, setGalFilter] = useState('');
  const [selIdx, setSelIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [regenSel, setRegenSel] = useState(false);

  const filteredGallery = useMemo(() => {
    if (!galFilter) return gallery;
    const lower = galFilter.toLowerCase();
    return gallery.filter((b) => b.name && b.name.toLowerCase().includes(lower));
  }, [gallery, galFilter]);

  const selectedBadge = selIdx !== null ? gallery.find((b) => b._i === selIdx) : null;

  const canExport = gallery.length > 0 || (!!templateFile && !!(namesFile || names.length > 0));

  const canNavigate = (direction) => {
    if (direction === 'prev') return selIdx > 0;
    if (direction === 'next') return selIdx < gallery.length - 1;
    return false;
  };

  const handleRegenOne = async (idx, newName) => {
    setRegenSel(true);
    await regenOne(idx, newName);
    setRegenSel(false);
  };

  return (
    <div className='pg pg-gallery'>
      {/* Toolbar */}
      <div className='gbar'>
        <div className='gbar-l'>
          <span className='gbar-title'>Gallery</span>
          <span className='gbar-count'>
            {galLoading ? `${gallery.length} / generating…` : `${gallery.length} badges`}
          </span>
          {galLoading && (
            <div className='gbar-prog'>
              <div className='gbar-prog-fill' style={{ width: galProgress + '%' }} />
            </div>
          )}
          {!galLoading && gallery.length > 0 && (
            <input
              className='gal-search'
              placeholder='🔍 Search names…'
              value={galFilter}
              onChange={(e) => setGalFilter(e.target.value)}
            />
          )}
        </div>
        <div className='gbar-r'>
          {!galLoading && gallery.length > 0 && (
            <button className='ghost' onClick={buildGallery}>
              ↺ Apply Settings to All
            </button>
          )}
          <button className='ghost' onClick={() => navigate('/design')}>
            ✏ Edit Design
          </button>
          <button className={cls('cta cta-sm', canExport && 'cta-on')} onClick={() => { downloadZip(); navigate('/export'); }} disabled={!canExport}>
            ⬇ Download ZIP
          </button>
        </div>
      </div>

      <div className='gal-body'>
        {/* Grid */}
        <div className='gal-grid'>
          {gallery.length === 0 && galLoading && (
            <div className='gal-empty-state'>
              <div className='spinner' />
              <p>Building gallery…</p>
            </div>
          )}
          {gallery.length === 0 && !galLoading && (
            <div className='gal-empty-state'>
              <p>No badges generated yet.</p>
              <button className='cta cta-on' onClick={buildGallery}>Build Gallery Now</button>
            </div>
          )}
          {filteredGallery.map((b) => (
            <div
              key={b._i}
              className={cls('gcard', !b.ok && 'gcard-err', selIdx === b._i && 'gcard-sel')}
              onClick={() => {
                setSelIdx(selIdx === b._i ? null : b._i);
                setEditName(b.name);
              }}
            >
              <div className='gcard-img'>
                {b.dataUrl ? <img src={b.dataUrl} alt={b.name} loading='lazy' /> : <div className='gcard-noimg'>⚠</div>}
              </div>
              <div className='gcard-foot'>
                <span className='gcard-name'>{b.name}</span>
                <div className='gcard-btns'>
                  <button
                    className='gcard-btn'
                    title='Edit'
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelIdx(b._i);
                      setEditName(b.name);
                    }}
                  >
                    ✏
                  </button>
                  <button
                    className='gcard-btn'
                    title='Regenerate'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenOne(b._i);
                    }}
                  >
                    ↺
                  </button>
                  {b.dataUrl && (
                    <a
                      className='gcard-btn'
                      href={b.dataUrl}
                      download={`${b.name}_badge.png`}
                      onClick={(e) => e.stopPropagation()}
                      title='Download'
                    >
                      ⬇
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredGallery.length === 0 && !galLoading && galFilter && gallery.length > 0 && (
            <div className='gal-empty-state'>
              <p>No badges match "{galFilter}"</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        {selIdx !== null && selectedBadge && (
          <div className='gal-side'>
            <div className='gside-hdr'>
              <span className='gside-title'>Edit Badge</span>
              <button className='close-x' onClick={() => setSelIdx(null)}>
                ✕
              </button>
            </div>

            <div className='gside-prev'>
              {selectedBadge.dataUrl ? (
                <img src={selectedBadge.dataUrl} alt='sel' />
              ) : (
                <div className='gside-noimg'>No preview</div>
              )}
            </div>

            <div className='gside-body'>
              <label className='dlbl'>NAME ON BADGE</label>
              <input
                className='gside-inp'
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRegenOne(selIdx, editName.trim());
                }}
              />

              <div className='gside-actions'>
                <button
                  className='gside-btn'
                  onClick={() => handleRegenOne(selIdx, editName.trim())}
                >
                  {regenSel ? '↺ Saving…' : '↺ Save & Update'}
                </button>
                {selectedBadge.dataUrl && (
                  <a
                    className='gside-btn gside-dl'
                    href={selectedBadge.dataUrl}
                    download={`${selectedBadge.name}_badge.png`}
                  >
                    ⬇ Download
                  </a>
                )}
                <button
                  className='gside-btn gside-del'
                  onClick={() => {
                    removeGalleryItem(selIdx);
                    setSelIdx(null);
                  }}
                >
                  🗑 Remove
                </button>
              </div>
            </div>

            <div className='gside-nav'>
              <button
                className='nav-btn'
                disabled={!canNavigate('prev')}
                onClick={() => {
                  const newIdx = selIdx - 1;
                  setSelIdx(newIdx);
                  setEditName(gallery.find((b) => b._i === newIdx)?.name || '');
                }}
              >
                ← Prev
              </button>
              <button
                className='nav-btn'
                disabled={!canNavigate('next')}
                onClick={() => {
                  const newIdx = selIdx + 1;
                  setSelIdx(newIdx);
                  setEditName(gallery.find((b) => b._i === newIdx)?.name || '');
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