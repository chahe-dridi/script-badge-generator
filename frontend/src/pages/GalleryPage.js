import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBadgeContext } from '../context/BadgeContext';
import '../styles/Pages-Gallery.css';

const FONTS = [
  'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma',
  'Trebuchet MS', 'Impact', 'Courier New', 'Segoe UI', 'Calibri',
  'Traditional Arabic', 'Arabic Typesetting', 'Simplified Arabic',
];

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
    removeBadge,
    removeGalleryItem,
    downloadZip,
    templateFile,
    templateImg,
    namesFile,
    names,
    cfg,
  } = useBadgeContext();

  const [galFilter, setGalFilter] = useState('');
  const [selIdx, setSelIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [regenSel, setRegenSel] = useState(false);

  const filteredGallery = useMemo(() => {
    if (!galFilter) return gallery;
    const lower = galFilter.toLowerCase();
    return gallery.filter((b) => b.name?.toLowerCase().includes(lower));
  }, [gallery, galFilter]);

  // Optional-chain form: when selIdx is null, find returns undefined → null via ??
  const selectedBadge = gallery.find((b) => b._i === selIdx) ?? null;
  const selArrayIdx = gallery.findIndex((b) => b._i === selIdx);

  const canExport = gallery.length > 0 || (!!templateFile && !!(namesFile || names.length > 0));

  const canNavigate = (direction) => {
    if (selArrayIdx === -1) return false;
    if (direction === 'prev') return selArrayIdx > 0;
    if (direction === 'next') return selArrayIdx < gallery.length - 1;
    return false;
  };

  const handleRegenOne = async (idx, newName, overrides) => {
    setRegenSel(true);
    await regenOne(idx, newName, overrides);
    setRegenSel(false);
  };

  const updateOverride = (key, val) => {
    if (selIdx === null) return;
    const badge = gallery.find(b => b._i === selIdx);
    regenOne(selIdx, badge?.name, { ...(badge?.customCfg || {}), [key]: val });
  };

  const resetOverrides = () => {
    if (selIdx === null) return;
    const badge = gallery.find(b => b._i === selIdx);
    if (!badge?.customCfg) return;
    const cleared = Object.fromEntries(Object.keys(badge.customCfg).map(k => [k, undefined]));
    regenOne(selIdx, badge.name, cleared);
  };

  const maxX = templateImg?.naturalWidth ?? 3000;
  const maxY = templateImg?.naturalHeight ?? 3000;

  const selectCard = (b) => {
    setSelIdx(selIdx === b._i ? null : b._i);
    setEditName(b.name);
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
            <button className='ghost' onClick={buildGallery}>↺ Apply Settings to All</button>
          )}
          <button className='ghost' onClick={() => navigate('/design')}>✏ Edit Design</button>
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
            <button
              key={b._i}
              type='button'
              className={cls('gcard', !b.ok && 'gcard-err', selIdx === b._i && 'gcard-sel')}
              onClick={() => selectCard(b)}
            >
              <div className='gcard-img'>
                {b.dataUrl ? <img src={b.dataUrl} alt={b.name} loading='lazy' /> : <div className='gcard-noimg'>⚠</div>}
              </div>
              <div className='gcard-foot'>
                <span className='gcard-name'>{b.name}</span>
                <div className='gcard-btns'>
                  <span
                    role='button'
                    tabIndex={0}
                    className='gcard-btn'
                    title='Edit'
                    onClick={(e) => { e.stopPropagation(); setSelIdx(b._i); setEditName(b.name); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setSelIdx(b._i); setEditName(b.name); } }}
                  >✏</span>
                  <span
                    role='button'
                    tabIndex={0}
                    className='gcard-btn'
                    title='Regenerate'
                    onClick={(e) => { e.stopPropagation(); handleRegenOne(b._i); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleRegenOne(b._i); } }}
                  >↺</span>
                  {b.dataUrl && (
                    <a
                      className='gcard-btn'
                      href={b.dataUrl}
                      download={`${b.name}_badge.png`}
                      onClick={(e) => e.stopPropagation()}
                      title='Download'
                    >⬇</a>
                  )}
                </div>
              </div>
            </button>
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
              <button className='close-x' onClick={() => setSelIdx(null)}>✕</button>
            </div>

            <div className='gside-prev'>
              {selectedBadge.dataUrl
                ? <img src={selectedBadge.dataUrl} alt={`Badge preview for ${selectedBadge.name}`} />
                : <div className='gside-noimg'>No preview</div>}
            </div>

            <div className='gside-body'>
              <label className='dlbl' htmlFor='gside-name-inp'>NAME ON BADGE</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id='gside-name-inp'
                  className='gside-inp'
                  style={{ flex: 1 }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRegenOne(selIdx, editName.trim()); }}
                />
                <button
                  className='gside-btn'
                  style={{ padding: '0 12px', flexShrink: 0 }}
                  onClick={() => handleRegenOne(selIdx, editName.trim())}
                >
                  {regenSel ? '↻' : '✔ Save'}
                </button>
              </div>

              {/* Override design */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bdr)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--a)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    ✨ Override Design
                  </span>
                  {selectedBadge.customCfg && Object.keys(selectedBadge.customCfg).length > 0 && (
                    <button
                      onClick={resetOverrides}
                      style={{ background: 'transparent', border: '1px solid var(--bdr)', color: 'var(--muted)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Reset all
                    </button>
                  )}
                </div>

                {/* Font family */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className='dlbl' htmlFor='ov-font-family'>FONT FAMILY</label>
                  <select
                    id='ov-font-family'
                    className='dsel'
                    value={selectedBadge.customCfg?.font_family ?? cfg.font_family}
                    onChange={(e) => updateOverride('font_family', e.target.value)}
                    style={{ fontSize: '12px' }}
                  >
                    {FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                {/* Font size */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className='dlbl' htmlFor='ov-font-size'>FONT SIZE</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{selectedBadge.customCfg?.font_size ?? cfg.font_size}px</span>
                  </div>
                  <input id='ov-font-size' type='range' min='8' max='300'
                    value={selectedBadge.customCfg?.font_size ?? cfg.font_size}
                    onChange={(e) => updateOverride('font_size', Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                {/* Alignment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className='dlbl' id='ov-align-lbl'>ALIGNMENT</label>
                  <div className='dpills' role='group' aria-labelledby='ov-align-lbl' style={{ gap: '4px' }}>
                    {['left', 'center', 'right'].map(a => (
                      <button
                        key={a}
                        className={cls('dpill', (selectedBadge.customCfg?.text_align ?? cfg.text_align) === a && 'dpill-on')}
                        style={{ flex: 1, fontSize: '11px' }}
                        onClick={() => updateOverride('text_align', a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* X position */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className='dlbl' htmlFor='ov-text-x'>X POSITION</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{selectedBadge.customCfg?.text_x ?? cfg.text_x}px</span>
                  </div>
                  <input id='ov-text-x' type='range' min='0' max={maxX}
                    value={selectedBadge.customCfg?.text_x ?? cfg.text_x}
                    onChange={(e) => updateOverride('text_x', Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                {/* Y position */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className='dlbl' htmlFor='ov-text-y'>Y POSITION</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{selectedBadge.customCfg?.text_y ?? cfg.text_y}px</span>
                  </div>
                  <input id='ov-text-y' type='range' min='0' max={maxY}
                    value={selectedBadge.customCfg?.text_y ?? cfg.text_y}
                    onChange={(e) => updateOverride('text_y', Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                {/* Text color */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className='dlbl' htmlFor='ov-font-color'>TEXT COLOR</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input id='ov-font-color' type='color'
                      value={selectedBadge.customCfg?.font_color ?? cfg.font_color}
                      onChange={(e) => updateOverride('font_color', e.target.value)}
                      style={{ width: '30px', height: '30px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                    <span style={{ fontSize: '12px', fontFamily: 'var(--fmono)' }}>
                      {selectedBadge.customCfg?.font_color ?? cfg.font_color}
                    </span>
                  </div>
                </div>

                {/* Letter spacing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className='dlbl' htmlFor='ov-letter-spacing'>LETTER SPACING</label>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{selectedBadge.customCfg?.letter_spacing ?? cfg.letter_spacing}px</span>
                  </div>
                  <input id='ov-letter-spacing' type='range' min='0' max='20' step='0.5'
                    value={selectedBadge.customCfg?.letter_spacing ?? cfg.letter_spacing}
                    onChange={(e) => updateOverride('letter_spacing', Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }} />
                </div>
              </div>

              <div className='gside-actions' style={{ marginTop: '16px' }}>
                {selectedBadge.dataUrl && (
                  <a className='gside-btn gside-dl' href={selectedBadge.dataUrl} download={`${selectedBadge.name}_badge.png`}>
                    ⬇ Download
                  </a>
                )}
                <button
                  className='gside-btn gside-del'
                  onClick={() => {
                    (removeGalleryItem ?? removeBadge)(selIdx);
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
                  const nb = gallery[selArrayIdx - 1];
                  if (nb) { setSelIdx(nb._i); setEditName(nb.name || ''); }
                }}
              >
                ← Prev
              </button>
              <button
                className='nav-btn'
                disabled={!canNavigate('next')}
                onClick={() => {
                  const nb = gallery[selArrayIdx + 1];
                  if (nb) { setSelIdx(nb._i); setEditName(nb.name || ''); }
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
