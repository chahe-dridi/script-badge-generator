# 🎯 Advanced Badge Generator

Generate personalized event badges automatically from a template image and names list with advanced styling options!

## ✨ New Features

### 🎪 Event-Based Organization
- **Event Name Input**: Each badge generation creates a dedicated folder
- **Automatic Folder Creation**: `output/EventName/` structure
- **Organized Storage**: Never mix different events again!

### 🎨 Advanced Text Styling
- **Text Shadows**: Add depth with customizable shadow effects
  - Shadow color picker
  - X/Y offset controls
  - Enable/disable toggle
- **Text Outlines**: Make text pop with outline effects
  - Outline color picker
  - Adjustable outline width
  - Perfect for light text on dark backgrounds

### 📝 Smart Naming System
Choose from multiple naming formats:
- `name_badge` → "John_Doe_badge.png"
- `badge_name` → "badge_John_Doe.png"
- `event_name_badge` → "Conference2024_John_Doe_badge.png"
- `name_event` → "John_Doe_Conference2024.png"
- `custom` → Your own format

**Additional Options:**
- Custom prefix/suffix
- Sequential numbering (001, 002, etc.)
- Real-time naming preview

### 💾 Configuration Management
- **Save Settings**: Export your styling preferences
- **Load Settings**: Reuse configurations for future events
- **JSON Format**: Easy to share and backup

### 🖱️ Improved User Experience
- **Tabbed Interface**: Organized into Main, Styling, and Naming tabs
- **Live Preview**: See naming format examples in real-time
- **Smart Previews**: Auto-resize large images for better viewing
- **Progress Tracking**: Visual progress bar with status updates
- **Auto-Open Folder**: Quick access to generated badges

## 🚀 Quick Start

### 1. Prepare Your Files
```
📁 Your Project Folder
├── 📁 templates/          # Put your badge template here
│   └── my_badge.png
├── 📄 attendees.csv       # Your names list
└── 📄 badge_generator.py  # The main program
```

### 2. Names File Formats

**TXT File (Simple):**
```
John Doe
Jane Smith
Bob Johnson
```

**CSV File (With extras):**
```
Name,Title,Company
John Doe,CEO,TechCorp
Jane Smith,Designer,CreativeStudio
Bob Johnson,Developer,CodeWorks
```

**Excel File:**
- First column = Names
- Additional columns ignored

### 3. Run the Program
```bash
python badge_generator.py
```

## 📋 Step-by-Step Usage

### Main Settings Tab
1. **Enter Event Name** (creates folder: `output/EventName/`)
2. **Select Badge Template** (PNG, JPG, etc.)
3. **Choose Names File** (TXT, CSV, Excel)
4. **Set Output Directory**
5. **Configure Basic Text**:
   - Font selection
   - Size (12-150)
   - Color
   - Position (X, Y coordinates)

### Advanced Styling Tab
1. **Text Shadow**:
   - ✅ Enable Shadow
   - Choose shadow color
   - Adjust X/Y offset (-10 to +10)

2. **Text Outline**:
   - ✅ Enable Outline
   - Choose outline color
   - Set outline width (1-10 pixels)

### Naming Options Tab
1. **Select Naming Format**
2. **Add Prefix/Suffix** (optional)
3. **Enable Sequential Numbers** ✅
4. **Preview Your Format** 👀

### Generate Badges
1. **Preview First Badge** - Test your settings
2. **Generate All Badges** - Create the full batch
3. **Auto-Open Folder** - Quick access to results

## 🎨 Styling Tips

### For Dark Templates:
- Use bright text colors (#FFFFFF, #FFFF00)
- Add white outline for contrast
- Light shadow for depth

### For Light Templates:
- Use dark text colors (#000000, #333333)
- Add dark outline if needed
- Gray shadow for subtle depth

### Professional Look:
- Font Size: 36-48 for names
- Outline Width: 2-3 pixels
- Shadow Offset: 2-3 pixels

## 📁 Output Structure
```
📁 output/
└── 📁 MyEvent2024/
    ├── John_Doe_badge_001.png
    ├── Jane_Smith_badge_002.png
    ├── Bob_Johnson_badge_003.png
    └── ... (all your badges)
```

## 🔧 Advanced Features

### Configuration Files
Save your perfect settings as JSON:
```json
{
  "event_name": "TechConf2024",
  "font_size": 48,
  "font_color": "#FFFFFF",
  "text_shadow": true,
  "shadow_color": "#000000",
  "naming_format": "event_name_badge"
}
```

### Bulk Processing
- Handles hundreds of names efficiently
- Progress tracking
- Error reporting
- Automatic folder organization

## 🎯 Requirements

```bash
pip install pillow pandas openpyxl
```

## 💡 Pro Tips

1. **Test First**: Always preview before generating all badges
2. **Save Settings**: Create templates for different event types
3. **Name Organization**: Use sequential numbering for large events
4. **Template Quality**: Higher resolution templates = better results
5. **Font Choice**: Sans-serif fonts (Arial, Calibri) work best for badges

## 🆘 Troubleshooting

**Text not showing?**
- Check text position (X, Y coordinates)
- Try contrasting colors
- Increase font size

**Blurry text?**
- Use higher resolution template
- Reduce font size slightly
- Check template image quality

**File errors?**
- Ensure names file has proper encoding (UTF-8)
- Check file permissions
- Verify template image format

---

## 🌟 Example Workflow

1. Design your badge template in Photoshop/Canva
2. Export as high-resolution PNG
3. Create CSV with attendee names
4. Load badge generator
5. Set event name: "TechConf2024"
6. Configure styling with shadows/outlines
7. Preview first badge
8. Generate all badges
9. Badges saved to: `output/TechConf2024/`

Perfect for conferences, workshops, meetups, and any event needing personalized badges! 🎉
