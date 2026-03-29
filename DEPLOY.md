# Badge Generator — Web Edition
**FastAPI backend on Render · React frontend on Vercel**

---

## Folder structure to add to your GitHub repo

```
your-repo/
├── badge_generator.py              ← existing
├── professional_badge_generator.py ← existing
├── professional_badge_generator1.py← existing
├── sample_names.csv                ← existing
├── sample_names.txt                ← existing
├── backend/
│   ├── main.py                     ← NEW (FastAPI app)
│   └── requirements.txt            ← NEW
├── frontend/
│   ├── package.json                ← NEW
│   ├── vercel.json                 ← NEW
│   ├── .env.example                ← NEW
│   ├── public/
│   │   └── index.html              ← NEW
│   └── src/
│       ├── index.js                ← NEW
│       ├── App.js                  ← NEW
│       └── App.css                 ← NEW
├── render.yaml                     ← NEW
└── .gitignore                      ← NEW (update existing)
```

---

## Step 1 — Add files to your GitHub repo

Push all the new files above into your repo `chahe-dridi/script-badge-generator`.

```bash
git add backend/ frontend/ render.yaml .gitignore
git commit -m "Add web version: FastAPI backend + React frontend"
git push
```

---

## Step 2 — Deploy backend to Render

1. Go to **https://render.com** → Sign up / Log in
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub account and select `script-badge-generator`
4. Fill in the settings:
   - **Name:** `badge-generator-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
5. Click **"Create Web Service"**
6. Wait ~3-5 minutes for the build to complete
7. Copy your Render URL — it looks like:
   ```
   https://badge-generator-api.onrender.com
   ```

> ⚠️ Free Render instances spin down after 15min of inactivity.
> First request may take ~30s to wake up. That's normal on free tier.

---

## Step 3 — Deploy frontend to Vercel

1. Go to **https://vercel.com** → Sign up / Log in
2. Click **"Add New Project"**
3. Import your GitHub repo `script-badge-generator`
4. Configure the project:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
5. Add **Environment Variable:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://badge-generator-api.onrender.com`
     (use YOUR actual Render URL from Step 2)
6. Click **"Deploy"**
7. Your app is live at `https://your-project.vercel.app` 🎉

---

## Step 4 — Update CORS on backend (important!)

Once you have your Vercel URL, update `backend/main.py`:

Find this line:
```python
allow_origins=["*"],
```

Replace with:
```python
allow_origins=[
    "https://your-project.vercel.app",
    "http://localhost:3000",
],
```

Then push and Render will auto-redeploy.

---

## Local development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm start
# Runs at http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Health + Arabic support status |
| POST | `/preview` | Generate single badge preview (base64 PNG) |
| POST | `/generate` | Generate all badges → download ZIP |

### POST /preview
```
form-data:
  template    → image file
  settings    → JSON string (see settings schema)
  name        → string (name to preview)
```

### POST /generate
```
form-data:
  template    → image file
  names_file  → TXT / CSV / Excel file
  settings    → JSON string
```

### Settings schema
```json
{
  "event_name":       "My Event",
  "font_family":      "Arial",
  "font_size":        48,
  "font_style":       "normal",
  "font_weight":      "normal",
  "font_color":       "#000000",
  "text_x":           400,
  "text_y":           300,
  "text_align":       "center",
  "text_shadow":      false,
  "shadow_color":     "#808080",
  "shadow_offset_x":  3,
  "shadow_offset_y":  3,
  "shadow_blur":      2,
  "text_outline":     false,
  "outline_color":    "#ffffff",
  "outline_width":    2,
  "text_underline":   false,
  "text_strikethrough": false,
  "text_rotation":    0,
  "arabic_support":   true
}
```

---

## Troubleshooting

**Backend not responding?**
- Free Render tier sleeps after 15min → first request is slow, just wait
- Check Render logs in dashboard

**CORS error in browser?**
- Make sure `REACT_APP_API_URL` in Vercel matches your Render URL exactly
- Update `allow_origins` in `backend/main.py` with your Vercel URL

**Arabic text not rendering?**
- The `arabic-reshaper` and `python-bidi` packages are in requirements.txt
- Check backend logs: `GET /health` will show `"arabic_support": true`

**ZIP not downloading?**
- Make sure your names file has at least one name
- Make sure event name is filled in