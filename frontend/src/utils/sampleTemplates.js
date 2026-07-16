/**
 * Sample badge templates + name lists used by the landing-page "Try it" section.
 *
 * Each preset draws its template onto an off-screen canvas so the page works
 * fully offline with zero external assets.
 */

// ─── Shared canvas helpers ────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Template drawing functions ───────────────────────────────────────────────

function drawTechConf(canvas) {
  const ctx = canvas.getContext('2d');
  const [w, h] = [canvas.width, canvas.height];

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0d1117');
  bg.addColorStop(1, '#1a1f3a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y <= h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Top accent bar
  const barGrad = ctx.createLinearGradient(0, 0, w, 0);
  barGrad.addColorStop(0, '#b8ff45');
  barGrad.addColorStop(1, '#45e8ff');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, w, 10);

  // Brand mark
  ctx.fillStyle = '#b8ff45';
  roundRect(ctx, 48, 32, 36, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#0a0a0f';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TC', 66, 55);

  // Event title
  ctx.fillStyle = '#e2e2ed';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('TechConf 2025', 96, 48);
  ctx.fillStyle = '#8888a8';
  ctx.font = '12px Arial';
  ctx.fillText('Annual Developer Conference', 97, 64);

  // Divider
  ctx.strokeStyle = 'rgba(184,255,69,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(48, 88); ctx.lineTo(w - 48, 88); ctx.stroke();

  // Center placeholder circle (avatar)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(w / 2, 200, 56, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();

  // Name zone label
  ctx.fillStyle = 'rgba(184,255,69,0.25)';
  roundRect(ctx, w / 2 - 180, 280, 360, 52, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(184,255,69,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(184,255,69,0.4)';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('ATTENDEE NAME', w / 2, 311);

  // Role tag
  ctx.fillStyle = 'rgba(69,232,255,0.12)';
  roundRect(ctx, w / 2 - 60, 350, 120, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#45e8ff';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DEVELOPER', w / 2, 369);

  // Bottom bar
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(0, h - 56, w, 56);
  ctx.fillStyle = '#555570';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('techconf2025.dev  ·  June 12–14, San Francisco', w / 2, h - 28);
}

function drawGala(canvas) {
  const ctx = canvas.getContext('2d');
  const [w, h] = [canvas.width, canvas.height];

  // Cream white background
  ctx.fillStyle = '#faf8f3';
  ctx.fillRect(0, 0, w, h);

  // Gold left strip
  const goldGrad = ctx.createLinearGradient(0, 0, 0, h);
  goldGrad.addColorStop(0, '#c9a84c');
  goldGrad.addColorStop(0.5, '#f5d98a');
  goldGrad.addColorStop(1, '#c9a84c');
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, 12, h);

  // Top header band
  ctx.fillStyle = '#1a1305';
  ctx.fillRect(0, 0, w, 90);

  // Gold top strip inside header
  ctx.fillStyle = '#f5d98a';
  ctx.fillRect(0, 0, w, 4);

  // Event name in header
  ctx.fillStyle = '#f5d98a';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ANNUAL GALA 2025', w / 2, 40);
  ctx.fillStyle = 'rgba(245,217,138,0.6)';
  ctx.font = 'italic 13px Georgia, serif';
  ctx.fillText('Excellence in Innovation', w / 2, 62);

  // Gold divider
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(60, 80); ctx.lineTo(w - 60, 80); ctx.stroke();

  // Decorative corner ornaments
  const drawCorner = (x, y, flip) => {
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(30, 0); ctx.moveTo(0, 0); ctx.lineTo(0, 30);
    ctx.stroke();
    ctx.restore();
  };
  drawCorner(24, 104, false);
  drawCorner(w - 24, 104, true);
  drawCorner(24, h - 104, false);
  drawCorner(w - 24, h - 104, true);

  // Name zone
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 0.75;
  roundRect(ctx, w / 2 - 200, 180, 400, 60, 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(201,168,76,0.06)';
  ctx.fill();
  ctx.fillStyle = 'rgba(26,19,5,0.3)';
  ctx.font = '10px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('HONOURED GUEST', w / 2, 215);

  // Role area
  ctx.fillStyle = '#1a1305';
  ctx.font = 'italic 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Guest of Honour', w / 2, 272);

  // Gold line divider
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(w / 2 - 80, 282); ctx.lineTo(w / 2 + 80, 282); ctx.stroke();

  // Bottom label
  ctx.fillStyle = '#8a7040';
  ctx.font = '10px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Table A  ·  Seat 12', w / 2, 320);
}

function drawWorkshop(canvas) {
  const ctx = canvas.getContext('2d');
  const [w, h] = [canvas.width, canvas.height];

  // Background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1a0a2e');
  bg.addColorStop(1, '#2d1040');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Scattered circle decorations
  const circles = [
    { x: w * 0.15, y: h * 0.2,  r: 60, a: 0.04 },
    { x: w * 0.85, y: h * 0.7,  r: 90, a: 0.03 },
    { x: w * 0.5,  y: h * 0.9,  r: 120, a: 0.025 },
    { x: w * 0.1,  y: h * 0.8,  r: 50, a: 0.04 },
  ];
  circles.forEach(c => {
    ctx.fillStyle = `rgba(255,69,133,${c.a})`;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
  });

  // Top pink/purple gradient bar
  const topGrad = ctx.createLinearGradient(0, 0, w, 0);
  topGrad.addColorStop(0, '#ff4585');
  topGrad.addColorStop(1, '#b845ff');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, 8);

  // Event label
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('DESIGN WORKSHOP', 48, 42);

  // Big header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial';
  ctx.fillText('Creative', 48, 72);
  const grad2 = ctx.createLinearGradient(48, 0, 300, 0);
  grad2.addColorStop(0, '#ff4585');
  grad2.addColorStop(1, '#b845ff');
  ctx.fillStyle = grad2;
  ctx.fillText('Summit', 48, 100);

  // Right abstract design
  ctx.strokeStyle = 'rgba(255,69,133,0.3)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w - 80, 80, 20 + i * 18, -Math.PI * 0.6, Math.PI * 0.8);
    ctx.stroke();
  }

  // Name zone
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, 48, 148, w - 96, 60, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,69,133,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PARTICIPANT', w / 2, 183);

  // Tags
  ['UX Design', 'Branding', 'Motion'].forEach((tag, i) => {
    const tx = 48 + i * 110;
    ctx.fillStyle = 'rgba(184,69,255,0.15)';
    roundRect(ctx, tx, 230, 100, 24, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(184,69,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#d080ff';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(tag, tx + 50, 246);
  });

  // Bottom strip
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, h - 48, w, 48);
  ctx.fillStyle = '#8888a8';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('creative-summit.io  ·  Berlin, September 2025', w / 2, h - 22);
}

// ─── Name lists ───────────────────────────────────────────────────────────────

const TECH_NAMES = [
  'Alex Johnson', 'Maria Garcia', 'Liam Chen', 'Aisha Patel',
  'Carlos Rivera', 'Sophie Müller', 'Yuki Tanaka', 'Omar Khalil',
  'Emma Williams', 'Ravi Shankar', 'Fatima Al-Hassan', 'Noah Kim',
  'Isabelle Dubois', 'James Okafor', 'Priya Nair', 'Lucas Schmidt',
];

const GALA_NAMES = [
  'Sir Edward Whitmore', 'Lady Catherine Brooks', 'Dr. Antoine Moreau',
  'Ambassador Layla Hassan', 'Prof. David Nakamura', 'Ms. Elena Vasquez',
  'Mr. Tariq Al-Rashid', 'Dr. Sarah Okonkwo', 'Lord James Pemberton',
  'Mme. Chloé Fontaine', 'H.E. Khalid Al-Mansouri', 'Dr. Ingrid Bergström',
];

const WORKSHOP_NAMES = [
  'Jordan Lee', 'Taylor Swift-Design', 'Sam Nguyen', 'Riley Morgan',
  'Avery Chen', 'Quinn Patel', 'Morgan Blake', 'Casey Kim',
  'Drew Hassan', 'Skyler Torres', 'Jamie Liu', 'Alex Rivera',
  'Dana Walsh', 'Reese Park', 'Robin Santos',
];

// ─── Preset definitions ───────────────────────────────────────────────────────

export const SAMPLE_PRESETS = [
  {
    id: 'techconf',
    title: 'TechConf 2025',
    subtitle: 'Developer Conference',
    theme: 'dark-green',
    width: 700,
    height: 420,
    names: TECH_NAMES,
    cfg: {
      event_name: 'TechConf 2025',
      font_family: 'Arial',
      font_size: 38,
      font_weight: 'bold',
      font_style: 'normal',
      font_color: '#ffffff',
      text_x: 350,
      text_y: 307,
      text_align: 'center',
      text_shadow: true,
      shadow_color: '#000000',
      shadow_offset_x: 0,
      shadow_offset_y: 2,
      shadow_blur: 6,
      text_outline: false,
      text_underline: false,
      text_strikethrough: false,
      text_rotation: 0,
      arabic_support: true,
    },
    draw: drawTechConf,
  },
  {
    id: 'gala',
    title: 'Annual Gala 2025',
    subtitle: 'Formal Event',
    theme: 'gold',
    width: 700,
    height: 400,
    names: GALA_NAMES,
    cfg: {
      event_name: 'Annual Gala 2025',
      font_family: 'Georgia',
      font_size: 30,
      font_weight: 'normal',
      font_style: 'italic',
      font_color: '#1a1305',
      text_x: 350,
      text_y: 207,
      text_align: 'center',
      text_shadow: false,
      shadow_color: '#888888',
      shadow_offset_x: 1,
      shadow_offset_y: 1,
      shadow_blur: 2,
      text_outline: false,
      text_underline: false,
      text_strikethrough: false,
      text_rotation: 0,
      arabic_support: true,
    },
    draw: drawGala,
  },
  {
    id: 'workshop',
    title: 'Creative Summit',
    subtitle: 'Design Workshop',
    theme: 'purple',
    width: 700,
    height: 400,
    names: WORKSHOP_NAMES,
    cfg: {
      event_name: 'Creative Summit',
      font_family: 'Arial',
      font_size: 32,
      font_weight: 'bold',
      font_style: 'normal',
      font_color: '#ffffff',
      text_x: 350,
      text_y: 195,
      text_align: 'center',
      text_shadow: false,
      shadow_color: '#000000',
      shadow_offset_x: 0,
      shadow_offset_y: 2,
      shadow_blur: 4,
      text_outline: false,
      text_underline: false,
      text_strikethrough: false,
      text_rotation: 0,
      arabic_support: true,
    },
    draw: drawWorkshop,
  },
];

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loadPreset(preset, context) {
  const { setCfg, setTF, setTImg, setNF, setNames, setGallery, INIT_CFG } = context;

  // Generate template image
  const canvas = document.createElement('canvas');
  canvas.width  = preset.width;
  canvas.height = preset.height;
  preset.draw(canvas);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const file = new File([blob], `${preset.id}-template.png`, { type: 'image/png' });

  const img = new Image();
  const url = URL.createObjectURL(blob);
  await new Promise(resolve => { img.onload = resolve; img.src = url; });

  // Generate names file
  const namesTxt  = preset.names.join('\n');
  const namesBlob = new Blob([namesTxt], { type: 'text/plain' });
  const namesFile = new File([namesBlob], `${preset.id}-names.txt`, { type: 'text/plain' });

  // Load into context
  setGallery([]);
  setTF(file);
  setTImg(img);
  setNF(namesFile);
  setNames([...preset.names]);
  setCfg({ ...INIT_CFG, ...preset.cfg });
}
