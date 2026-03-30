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

  const handleRegenOne = async (idx, newName, overrides) => {
    setRegenSel(true);
    await regenOne(idx, newName, overrides);
    setRegenSel(false);
  };

  // Helper for quick override updates
  const updateOverride = (key, val) => {
    if (selIdx === null) return;
    const badge = gallery.find(b => b._i === selIdx);
    const overrides = { ...(badge?.customCfg || {}), [key]: val };
    regenOne(selIdx, badge?.name, overrides);
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className='gside-inp'
                  style={{ flex: 1 }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRegenOne(selIdx, editName.trim());
                  }}
                />
                <button
                  className='gside-btn'
                  style={{ padding: '0 12px', flexShrink: 0 }}
                  onClick={() => handleRegenOne(selIdx, editName.trim())}
                >
                  {regenSel ? '↻' : '✔ Save'}
                </button>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--a)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ✨ Override Design
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className='dlbl'>FONT SIZE</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{selectedBadge.customCfg?.font_size ?? cfg.font_size}px</span>
                  </div>
                  <input type='range' min='8' max='200' 
                    value={selectedBadge.customCfg?.font_size ?? cfg.font_size} 
                    onChange={(e) => updateOverride('font_size', Number(e.target.value))} 
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className='dlbl'>X POSITION</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{selectedBadge.customCfg?.text_x ?? cfg.text_x}px</span>
                  </div>
                  <input type='range' min='0' max='2000' 
                    value={selectedBadge.customCfg?.text_x ?? cfg.text_x} 
                    onChange={(e) => updateOverride('text_x', Number(e.target.value))} 
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className='dlbl'>Y POSITION</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{selectedBadge.customCfg?.text_y ?? cfg.text_y}px</span>
                  </div>
                  <input type='range' min='0' max='2000' 
                    value={selectedBadge.customCfg?.text_y ?? cfg.text_y} 
                    onChange={(e) => updateOverride('text_y', Number(e.target.value))} 
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className='dlbl'>TEXT COLOR</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type='color' 
                      value={selectedBadge.customCfg?.font_color ?? cfg.font_color} 
                      onChange={(e) => updateOverride('font_color', e.target.value)} 
                      style={{ width: '30px', height: '30px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                    <span style={{ fontSize: '12px', fontFamily: 'var(--fmono)' }}>
                      {selectedBadge.customCfg?.font_color ?? cfg.font_color}
                    </span>
                    {(selectedBadge.customCfg && Object.keys(selectedBadge.customCfg).length > 0) && (
                       <button 
                         onClick={() => regenOne(selIdx, selectedBadge.name, { font_size: undefined, text_x: undefined, text_y: undefined, font_color: undefined })}
                         style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--bdr)', color: 'var(--txt)', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                       >
                         Reset
                       </button>
                    )}
                  </div>
                </div>
              </div>

              <div className='gside-actions' style={{ marginTop: '16px' }}>
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