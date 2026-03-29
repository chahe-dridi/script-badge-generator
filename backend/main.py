#!/usr/bin/env python3
"""
Badge Generator - FastAPI Backend
Handles badge generation with full Arabic/RTL support
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import io
import zipfile
import json
import os
import tempfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import pandas as pd
from pathlib import Path
import base64

# Try to import Arabic support libraries
try:
    import arabic_reshaper
    from bidi.algorithm import get_display
    ARABIC_SUPPORT = True
except ImportError:
    ARABIC_SUPPORT = False
    print("Arabic reshaper not available. Install: pip install arabic-reshaper python-bidi")

app = FastAPI(title="Badge Generator API", version="2.0.0")

# CORS - allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Font helpers ────────────────────────────────────────────────────────────

FONT_MAP = {
    "Arial": "arial",
    "Times New Roman": "times",
    "Calibri": "calibri",
    "Verdana": "verdana",
    "Georgia": "georgia",
    "Trebuchet MS": "trebuc",
    "Comic Sans MS": "comic",
    "Impact": "impact",
    "Tahoma": "tahoma",
    "Courier New": "cour",
    "Segoe UI": "segoeui",
    "Consolas": "consola",
    "Cambria": "cambria",
    "Traditional Arabic": "trado",
    "Arabic Typesetting": "arabtype",
    "Simplified Arabic": "simpo",
    "Microsoft Sans Serif": "micross",
}

def get_font(font_family: str, font_size: int, font_style: str = "normal", font_weight: str = "normal"):
    """Load font with multiple fallback strategies"""
    font_size = max(8, font_size)
    attempts = []

    base = FONT_MAP.get(font_family, font_family.lower().replace(" ", ""))

    if font_weight == "bold" and font_style == "italic":
        attempts += [f"{base}bi.ttf", f"{base}z.ttf"]
    elif font_weight == "bold":
        attempts += [f"{base}bd.ttf", f"{base}b.ttf"]
    elif font_style == "italic":
        attempts += [f"{base}i.ttf", f"{base}it.ttf"]
    attempts += [f"{base}.ttf", font_family]

    # System font directories
    font_dirs = [
        "/usr/share/fonts",
        "/usr/local/share/fonts",
        "/usr/share/fonts/truetype",
        "/usr/share/fonts/truetype/dejavu",
        "/usr/share/fonts/truetype/liberation",
        "/usr/share/fonts/truetype/freefont",
        "C:/Windows/Fonts",
        os.path.expanduser("~/.fonts"),
    ]

    for attempt in attempts:
        try:
            return ImageFont.truetype(attempt, font_size)
        except:
            pass
        for d in font_dirs:
            try:
                return ImageFont.truetype(os.path.join(d, attempt), font_size)
            except:
                pass

    # Search recursively in system font dirs
    for font_dir in font_dirs:
        if os.path.exists(font_dir):
            for root, dirs, files in os.walk(font_dir):
                for f in files:
                    if f.lower().endswith('.ttf') or f.lower().endswith('.otf'):
                        try:
                            return ImageFont.truetype(os.path.join(root, f), font_size)
                        except:
                            pass

    return ImageFont.load_default()


# ─── Text helpers ─────────────────────────────────────────────────────────────

def contains_arabic(text: str) -> bool:
    if not text:
        return False
    for char in text:
        if '\u0600' <= char <= '\u06FF' or '\u0750' <= char <= '\u077F' or \
           '\uFB50' <= char <= '\uFDFD' or '\uFE70' <= char <= '\uFEFF':
            return True
    return False


def process_text(text: str, arabic_support: bool = True) -> str:
    if not text:
        return text
    if contains_arabic(text) and arabic_support and ARABIC_SUPPORT:
        try:
            reshaped = arabic_reshaper.reshape(text)
            return get_display(reshaped)
        except Exception as e:
            print(f"Arabic processing error: {e}")
    return text


def get_text_size(draw, text, font):
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]
    except:
        try:
            return draw.textsize(text, font=font)
        except:
            size = getattr(font, 'size', 20)
            return len(text) * int(size * 0.6), size


# ─── Badge drawing ────────────────────────────────────────────────────────────

def draw_badge(
    template: Image.Image,
    text: str,
    x: int,
    y: int,
    font_family: str,
    font_size: int,
    font_style: str,
    font_weight: str,
    font_color: str,
    text_align: str,
    text_shadow: bool,
    shadow_color: str,
    shadow_offset_x: int,
    shadow_offset_y: int,
    shadow_blur: int,
    text_outline: bool,
    outline_color: str,
    outline_width: int,
    text_underline: bool,
    text_strikethrough: bool,
    text_rotation: int,
    arabic_support: bool,
) -> Image.Image:

    display_text = process_text(text, arabic_support)

    img = template.copy()
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    font = get_font(font_family, font_size, font_style, font_weight)

    # Use a padding canvas to avoid clipping
    pad = max(200, font_size * 3)
    canvas_w = img.width + pad * 2
    canvas_h = img.height + pad * 2
    canvas = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad))

    draw = ImageDraw.Draw(canvas)
    tw, th = get_text_size(draw, display_text, font)

    # Alignment offset
    if text_align == "center":
        ax = -tw // 2
    elif text_align == "right":
        ax = -tw
    else:
        ax = 0

    tx = x + pad + ax
    ty = y + pad

    def draw_text_on(d, fx, fy, color):
        try:
            d.text((fx, fy), display_text, font=font, fill=color)
        except Exception as e:
            print(f"Text draw error: {e}")
            d.text((fx, fy), display_text, font=font, fill="black")

    # ── Shadow ──
    if text_shadow:
        if text_blur := shadow_blur:
            shadow_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
            sd = ImageDraw.Draw(shadow_layer)
            draw_text_on(sd, tx + shadow_offset_x, ty + shadow_offset_y, shadow_color)
            shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(text_blur))
            canvas = Image.alpha_composite(canvas, shadow_layer)
            draw = ImageDraw.Draw(canvas)
        else:
            draw_text_on(draw, tx + shadow_offset_x, ty + shadow_offset_y, shadow_color)

    # ── Outline ──
    if text_outline:
        for dx in range(-outline_width, outline_width + 1):
            for dy in range(-outline_width, outline_width + 1):
                if dx != 0 or dy != 0:
                    draw_text_on(draw, tx + dx, ty + dy, outline_color)

    # ── Main text ──
    draw_text_on(draw, tx, ty, font_color)

    # ── Decorations ──
    lw = max(1, font_size // 20)
    if text_underline:
        draw.rectangle([tx, ty + th + lw, tx + tw, ty + th + lw * 2], fill=font_color)
    if text_strikethrough:
        sy = ty + th // 2
        draw.rectangle([tx, sy, tx + tw, sy + lw], fill=font_color)

    # ── Rotation ──
    if text_rotation != 0:
        canvas = canvas.rotate(-text_rotation, expand=False, fillcolor=(0, 0, 0, 0))

    # Crop back
    result = canvas.crop((pad, pad, pad + img.width, pad + img.height))
    return result.convert('RGB')


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "Badge Generator API", "arabic_support": ARABIC_SUPPORT}


@app.get("/health")
def health():
    return {"status": "healthy", "arabic_support": ARABIC_SUPPORT}


@app.post("/preview")
async def preview_badge(
    template: UploadFile = File(...),
    settings: str = Form(...),
    name: str = Form(default="Sample Name"),
):
    """Generate a single badge preview and return as base64 PNG"""
    try:
        cfg = json.loads(settings)
        img_bytes = await template.read()
        template_img = Image.open(io.BytesIO(img_bytes))

        result = draw_badge(
            template=template_img,
            text=name,
            x=cfg.get("text_x", 400),
            y=cfg.get("text_y", 300),
            font_family=cfg.get("font_family", "Arial"),
            font_size=cfg.get("font_size", 48),
            font_style=cfg.get("font_style", "normal"),
            font_weight=cfg.get("font_weight", "normal"),
            font_color=cfg.get("font_color", "#000000"),
            text_align=cfg.get("text_align", "center"),
            text_shadow=cfg.get("text_shadow", False),
            shadow_color=cfg.get("shadow_color", "#808080"),
            shadow_offset_x=cfg.get("shadow_offset_x", 3),
            shadow_offset_y=cfg.get("shadow_offset_y", 3),
            shadow_blur=cfg.get("shadow_blur", 2),
            text_outline=cfg.get("text_outline", False),
            outline_color=cfg.get("outline_color", "#FFFFFF"),
            outline_width=cfg.get("outline_width", 2),
            text_underline=cfg.get("text_underline", False),
            text_strikethrough=cfg.get("text_strikethrough", False),
            text_rotation=cfg.get("text_rotation", 0),
            arabic_support=cfg.get("arabic_support", True),
        )

        buf = io.BytesIO()
        result.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode()
        return {"image": f"data:image/png;base64,{b64}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate_badges(
    template: UploadFile = File(...),
    names_file: UploadFile = File(...),
    settings: str = Form(...),
):
    """Generate all badges and return as a ZIP file"""
    try:
        cfg = json.loads(settings)

        # Load template
        img_bytes = await template.read()
        template_img = Image.open(io.BytesIO(img_bytes))

        # Load names
        names_bytes = await names_file.read()
        filename = names_file.filename.lower()

        if filename.endswith('.txt'):
            names_raw = names_bytes.decode('utf-8', errors='ignore').splitlines()
            names = [n.strip() for n in names_raw if n.strip()]
        elif filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(names_bytes), encoding='utf-8', on_bad_lines='skip')
            names = df.iloc[:, 0].dropna().astype(str).tolist()
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(names_bytes))
            names = df.iloc[:, 0].dropna().astype(str).tolist()
        else:
            raise HTTPException(status_code=400, detail="Unsupported names file format")

        if not names:
            raise HTTPException(status_code=400, detail="No names found in file")

        # Generate badges into ZIP
        zip_buffer = io.BytesIO()
        event_name = cfg.get("event_name", "badges").strip().replace(" ", "_") or "badges"

        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for i, name in enumerate(names):
                badge = draw_badge(
                    template=template_img,
                    text=str(name),
                    x=cfg.get("text_x", 400),
                    y=cfg.get("text_y", 300),
                    font_family=cfg.get("font_family", "Arial"),
                    font_size=cfg.get("font_size", 48),
                    font_style=cfg.get("font_style", "normal"),
                    font_weight=cfg.get("font_weight", "normal"),
                    font_color=cfg.get("font_color", "#000000"),
                    text_align=cfg.get("text_align", "center"),
                    text_shadow=cfg.get("text_shadow", False),
                    shadow_color=cfg.get("shadow_color", "#808080"),
                    shadow_offset_x=cfg.get("shadow_offset_x", 3),
                    shadow_offset_y=cfg.get("shadow_offset_y", 3),
                    shadow_blur=cfg.get("shadow_blur", 2),
                    text_outline=cfg.get("text_outline", False),
                    outline_color=cfg.get("outline_color", "#FFFFFF"),
                    outline_width=cfg.get("outline_width", 2),
                    text_underline=cfg.get("text_underline", False),
                    text_strikethrough=cfg.get("text_strikethrough", False),
                    text_rotation=cfg.get("text_rotation", 0),
                    arabic_support=cfg.get("arabic_support", True),
                )

                # Safe filename
                safe = "".join(c for c in str(name) if c.isalnum() or c in " _-").strip().replace(" ", "_")
                if not safe:
                    safe = f"badge_{i+1}"
                fname = f"{event_name}/{safe}_badge.png"

                img_buf = io.BytesIO()
                badge.save(img_buf, format="PNG")
                zf.writestr(fname, img_buf.getvalue())

        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{event_name}_badges.zip"'}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)