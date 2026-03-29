# Script Badge Generator

A Python project for generating personalized event badges from a template image and a list of names. The project contains two main applications:

- **Badge Generator** (`badge_generator.py`): A user-friendly badge generator with essential features and a simple interface.
- **Professional Badge Generator** (`professional_badge_generator.py`): An advanced badge generator with a modern UI, enhanced text effects, and more customization options.

---

## Features

### Badge Generator
- Simple GUI for selecting template and names file
- Supports CSV and TXT name lists
- Customizable font size, color, and text position
- Batch badge generation
- Output to a chosen directory

### Professional Badge Generator
- Modern, responsive UI
- Advanced text effects: shadow, outline, color picker
- Click-to-position text on the badge
- Event name customization
- Multi-threaded batch processing for large lists
- Supports CSV and TXT name lists
- Output to a chosen directory

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chahe-dridi/script-badge-generator.git
   cd script-badge-generator
   ```

2. **Install Python 3.x** (if not already installed):
   - Download from [python.org](https://www.python.org/downloads/)

3. **Install required packages:**
   ```bash
   pip install pillow pandas
   ```

---

## Usage

### 1. Badge Generator
Run:
```bash
python badge_generator.py
```
- Select a badge template image (PNG/JPG)
- Select a names file (`sample_names.csv` or `sample_names.txt`)
- Adjust font size, color, and position as needed
- Click 'Generate' to create badges in the output folder

### 2. Professional Badge Generator
Run:
```bash
python professional_badge_generator.py
```
- Select a badge template image
- Select a names file (CSV or TXT)
- Use the UI to adjust text effects, position, and event name
- Click 'Generate' to create badges with advanced styling

---

## Sample Data
- `sample_names.csv`: Example CSV with Name, Department, Role
- `sample_names.txt`: Simple list of names

---

## Extra Information
- Both scripts use a graphical interface (Tkinter) and require a display environment.
- Output badges are saved in the selected output directory.
- You can customize text position, font size(which you already have).
Click the "Open Preview" button at the top right of the editor (it looks like a small split window with a magnifier).
Or, right-click inside the file and select "Open Preview".
Or, press Ctrl+Shift+V (Windows) to open the Markdown preview.
You will see a live-rendered version of your README side-by-side with the source.
This lets you check formatting, , color, and effects.
- For large name lists, the professional version is recommended for better performance and features.

---

## Author
[chahe-dridi](https://github.com/chahe-dridi)

---

## License
This project is licensed under the MIT License.

---

## Repository
[GitHub: chahe-dridi/script-badge-generator](https://github.com/chahe-dridi/script-badge-generator)
