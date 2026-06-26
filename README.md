# Script Badge Generator

This repository contains a full-suite solution for generating professional event badges. It evolved from simple Python Tkinter scripts into a full-stack web application with instant in-browser rendering.

## Architecture

This project encompasses multiple approaches to generating badges:

1. **Web Version (Full Stack)**
   The modern implementation is split into a robust web client and optional backend.
   - **`frontend/`**: A highly interactive React 18 application that renders badges on the client side using HTML5 Canvas and JSZip. Includes custom text effects, alignment, and modern UI.
   - **`backend/`**: A FastAPI Python service providing REST endpoints for expanded data processing.

2. **Legacy Desktop Scripts**
   The original desktop solutions remain available for purely local batch jobs:
   - `badge_generator.py`: A user-friendly badge generator with essential features and a minimal UI.
   - `professional_badge_generator.py`: An advanced generator adding shadows, outlines, and multi-threading.

## Quick Start (Web App)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm start`
The web GUI will open at `http://localhost:3001`.

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`
The API will be available at `http://localhost:8000`.

Check the nested `README.md` files in `frontend` and `backend` respectively for deeper development instructions.

---

## License
MIT License