# Badge Generator

Automatically generates personalized event badges from a template image and a list of names.

## Features

- **Template-based**: Uses your existing badge design as a template
- **Multiple input formats**: Supports CSV, Excel (.xlsx/.xls), and TXT files
- **Customizable text styling**: 
  - Font selection
  - Font size adjustment
  - Color picker
  - Position control (X, Y coordinates)
- **Preview functionality**: See how the first badge will look before generating all
- **Batch processing**: Generates badges for all names in one go
- **Progress tracking**: Visual progress bar and status updates

## How to Use

1. **Prepare your files**:
   - Badge template image (PNG, JPG, etc.)
   - Names list file (TXT, CSV, or Excel)

2. **Run the application**:
   ```
   python badge_generator.py
   ```

3. **Configure the badge**:
   - Select your badge template image
   - Select your names file
   - Choose output directory
   - Adjust text styling (font, size, color, position)

4. **Preview and generate**:
   - Click "Preview First Badge" to see how it looks
   - Adjust settings if needed
   - Click "Generate All Badges" to create all badges

## File Formats Supported

### Names Files:
- **TXT**: One name per line
- **CSV**: Names in the first column (additional columns ignored)
- **Excel**: Names in the first column of the first sheet

### Template Images:
- PNG, JPG, JPEG, BMP, GIF, TIFF

## Output

Generated badges will be saved in the output directory with filenames like:
- `John Smith_badge.png`
- `Jane Doe_badge.png`
- etc.

## Requirements

- Python 3.6+
- Pillow (PIL)
- pandas
- openpyxl
- tkinter (usually included with Python)

## Installation

The required packages are already installed. Just run:
```
python badge_generator.py
```

## Tips

1. **Template Design**: Make sure your template image has enough space where you want the names to appear
2. **Text Positioning**: Use the preview function to fine-tune text placement
3. **Font Size**: Adjust based on your template size and available space
4. **Color Choice**: Choose colors that contrast well with your template background
5. **File Organization**: Keep templates in the `templates` folder for organization

## Sample Files Included

- `sample_names.txt` - Simple text file with names
- `sample_names.csv` - CSV file with names and additional info
