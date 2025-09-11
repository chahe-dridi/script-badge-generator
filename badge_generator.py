#!/usr/bin/env python3
"""
Badge Generator
Automatically generates personalized badges from a template image and names list.
"""

import os
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from tkinter import colorchooser
import json

class BadgeGenerator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Advanced Badge Generator")
        self.root.geometry("1000x700")
        
        # Variables
        self.template_path = tk.StringVar()
        self.names_file_path = tk.StringVar()
        self.output_dir = tk.StringVar(value="output")
        self.event_name = tk.StringVar()
        
        # Text styling variables
        self.font_size = tk.IntVar(value=48)
        self.font_color = "#000000"  # Black
        self.text_x = tk.IntVar(value=100)
        self.text_y = tk.IntVar(value=200)
        
        # Enhanced styling options
        self.text_shadow = tk.BooleanVar(value=False)
        self.shadow_color = "#808080"  # Gray
        self.shadow_offset_x = tk.IntVar(value=2)
        self.shadow_offset_y = tk.IntVar(value=2)
        
        self.text_outline = tk.BooleanVar(value=False)
        self.outline_color = "#FFFFFF"  # White
        self.outline_width = tk.IntVar(value=2)
        
        # Naming options
        self.naming_format = tk.StringVar(value="name_badge")
        self.include_numbers = tk.BooleanVar(value=True)
        self.badge_prefix = tk.StringVar(value="")
        self.badge_suffix = tk.StringVar(value="")
        
        # Available fonts
        self.available_fonts = ["arial.ttf", "times.ttf", "calibri.ttf", "verdana.ttf", "comic.ttf", "impact.ttf"]
        self.selected_font = tk.StringVar(value="arial.ttf")
        
        # Preview image reference
        self.preview_image = None
        
        self.setup_gui()
        
    def setup_gui(self):
        """Setup the GUI interface"""
        # Create notebook for tabs
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Main tab
        main_tab = ttk.Frame(notebook)
        notebook.add(main_tab, text="Main Settings")
        
        # Styling tab
        styling_tab = ttk.Frame(notebook)
        notebook.add(styling_tab, text="Advanced Styling")
        
        # Naming tab
        naming_tab = ttk.Frame(notebook)
        notebook.add(naming_tab, text="Naming Options")
        
        self.setup_main_tab(main_tab)
        self.setup_styling_tab(styling_tab)
        self.setup_naming_tab(naming_tab)
        
    def setup_main_tab(self, parent):
        """Setup main settings tab"""
        main_frame = ttk.Frame(parent, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Event name
        ttk.Label(main_frame, text="Event Name:").grid(row=0, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.event_name, width=50).grid(row=0, column=1, padx=5)
        ttk.Label(main_frame, text="(Creates a folder with this name)", font=("Arial", 8)).grid(row=0, column=2, sticky=tk.W)
        
        # Template selection
        ttk.Label(main_frame, text="Badge Template Image:").grid(row=1, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.template_path, width=50).grid(row=1, column=1, padx=5)
        ttk.Button(main_frame, text="Browse", command=self.select_template).grid(row=1, column=2)
        
        # Names file selection
        ttk.Label(main_frame, text="Names File (CSV/Excel/TXT):").grid(row=2, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.names_file_path, width=50).grid(row=2, column=1, padx=5)
        ttk.Button(main_frame, text="Browse", command=self.select_names_file).grid(row=2, column=2)
        
        # Output directory
        ttk.Label(main_frame, text="Output Directory:").grid(row=3, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.output_dir, width=50).grid(row=3, column=1, padx=5)
        ttk.Button(main_frame, text="Browse", command=self.select_output_dir).grid(row=3, column=2)
        
        # Basic text styling section
        style_frame = ttk.LabelFrame(main_frame, text="Basic Text Styling", padding="10")
        style_frame.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=10)
        
        # Font selection
        ttk.Label(style_frame, text="Font:").grid(row=0, column=0, sticky=tk.W)
        ttk.Combobox(style_frame, textvariable=self.selected_font, 
                    values=self.available_fonts, width=20).grid(row=0, column=1, padx=5)
        
        # Font size
        ttk.Label(style_frame, text="Font Size:").grid(row=0, column=2, sticky=tk.W, padx=(20,0))
        ttk.Scale(style_frame, from_=12, to=150, variable=self.font_size, 
                 orient=tk.HORIZONTAL, length=150).grid(row=0, column=3, padx=5)
        ttk.Label(style_frame, textvariable=self.font_size).grid(row=0, column=4)
        
        # Font color
        ttk.Label(style_frame, text="Text Color:").grid(row=1, column=0, sticky=tk.W)
        self.color_button = tk.Button(style_frame, text="Choose Color", 
                                     bg=self.font_color, command=self.choose_color)
        self.color_button.grid(row=1, column=1, padx=5, pady=5)
        
        # Text position
        ttk.Label(style_frame, text="Text Position (X, Y):").grid(row=2, column=0, sticky=tk.W)
        ttk.Scale(style_frame, from_=0, to=1500, variable=self.text_x, 
                 orient=tk.HORIZONTAL, length=150).grid(row=2, column=1, padx=5)
        ttk.Label(style_frame, textvariable=self.text_x).grid(row=2, column=2)
        
        ttk.Scale(style_frame, from_=0, to=1500, variable=self.text_y, 
                 orient=tk.HORIZONTAL, length=150).grid(row=2, column=3, padx=5)
        ttk.Label(style_frame, textvariable=self.text_y).grid(row=2, column=4)
        
        # Click to position button
        ttk.Button(style_frame, text="Click on Preview to Set Position", 
                  command=self.enable_click_positioning).grid(row=3, column=0, columnspan=2, pady=5)
        
        # Preview and Generate buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=5, column=0, columnspan=3, pady=20)
        
        ttk.Button(button_frame, text="Preview First Badge", 
                  command=self.preview_badge).pack(side=tk.LEFT, padx=10)
        ttk.Button(button_frame, text="Generate All Badges", 
                  command=self.generate_badges).pack(side=tk.LEFT, padx=10)
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='determinate')
        self.progress.grid(row=6, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=10)
        
        # Status label
        self.status_label = ttk.Label(main_frame, text="Ready to generate badges")
        self.status_label.grid(row=7, column=0, columnspan=3, pady=5)
        
    def setup_styling_tab(self, parent):
        """Setup advanced styling tab"""
        styling_frame = ttk.Frame(parent, padding="10")
        styling_frame.pack(fill=tk.BOTH, expand=True)
        
        # Shadow settings
        shadow_frame = ttk.LabelFrame(styling_frame, text="Text Shadow", padding="10")
        shadow_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        
        ttk.Checkbutton(shadow_frame, text="Enable Shadow", 
                       variable=self.text_shadow).grid(row=0, column=0, sticky=tk.W)
        
        ttk.Label(shadow_frame, text="Shadow Color:").grid(row=1, column=0, sticky=tk.W)
        self.shadow_color_button = tk.Button(shadow_frame, text="Choose Color", 
                                           bg=self.shadow_color, command=self.choose_shadow_color)
        self.shadow_color_button.grid(row=1, column=1, padx=5, pady=5)
        
        ttk.Label(shadow_frame, text="Shadow Offset X:").grid(row=2, column=0, sticky=tk.W)
        ttk.Scale(shadow_frame, from_=-10, to=10, variable=self.shadow_offset_x, 
                 orient=tk.HORIZONTAL, length=150).grid(row=2, column=1, padx=5)
        ttk.Label(shadow_frame, textvariable=self.shadow_offset_x).grid(row=2, column=2)
        
        ttk.Label(shadow_frame, text="Shadow Offset Y:").grid(row=3, column=0, sticky=tk.W)
        ttk.Scale(shadow_frame, from_=-10, to=10, variable=self.shadow_offset_y, 
                 orient=tk.HORIZONTAL, length=150).grid(row=3, column=1, padx=5)
        ttk.Label(shadow_frame, textvariable=self.shadow_offset_y).grid(row=3, column=2)
        
        # Outline settings
        outline_frame = ttk.LabelFrame(styling_frame, text="Text Outline", padding="10")
        outline_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        
        ttk.Checkbutton(outline_frame, text="Enable Outline", 
                       variable=self.text_outline).grid(row=0, column=0, sticky=tk.W)
        
        ttk.Label(outline_frame, text="Outline Color:").grid(row=1, column=0, sticky=tk.W)
        self.outline_color_button = tk.Button(outline_frame, text="Choose Color", 
                                            bg=self.outline_color, command=self.choose_outline_color)
        self.outline_color_button.grid(row=1, column=1, padx=5, pady=5)
        
        ttk.Label(outline_frame, text="Outline Width:").grid(row=2, column=0, sticky=tk.W)
        ttk.Scale(outline_frame, from_=1, to=10, variable=self.outline_width, 
                 orient=tk.HORIZONTAL, length=150).grid(row=2, column=1, padx=5)
        ttk.Label(outline_frame, textvariable=self.outline_width).grid(row=2, column=2)
        
    def setup_naming_tab(self, parent):
        """Setup naming options tab"""
        naming_frame = ttk.Frame(parent, padding="10")
        naming_frame.pack(fill=tk.BOTH, expand=True)
        
        # Naming format
        format_frame = ttk.LabelFrame(naming_frame, text="File Naming Format", padding="10")
        format_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        
        ttk.Label(format_frame, text="Naming Format:").grid(row=0, column=0, sticky=tk.W)
        format_options = ["name_badge", "badge_name", "event_name_badge", "name_event", "custom"]
        ttk.Combobox(format_frame, textvariable=self.naming_format, 
                    values=format_options, width=20).grid(row=0, column=1, padx=5)
        
        ttk.Label(format_frame, text="Prefix:").grid(row=1, column=0, sticky=tk.W)
        ttk.Entry(format_frame, textvariable=self.badge_prefix, width=20).grid(row=1, column=1, padx=5)
        
        ttk.Label(format_frame, text="Suffix:").grid(row=2, column=0, sticky=tk.W)
        ttk.Entry(format_frame, textvariable=self.badge_suffix, width=20).grid(row=2, column=1, padx=5)
        
        ttk.Checkbutton(format_frame, text="Include Sequential Numbers", 
                       variable=self.include_numbers).grid(row=3, column=0, columnspan=2, sticky=tk.W)
        
        # Preview naming
        preview_frame = ttk.LabelFrame(naming_frame, text="Naming Preview", padding="10")
        preview_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        
        self.naming_preview = ttk.Label(preview_frame, text="")
        self.naming_preview.pack()
        
        ttk.Button(preview_frame, text="Update Preview", 
                  command=self.update_naming_preview).pack(pady=5)
                  
        # Configuration save/load
        config_frame = ttk.LabelFrame(naming_frame, text="Save/Load Configuration", padding="10")
        config_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        
        ttk.Button(config_frame, text="Save Settings", 
                  command=self.save_configuration).pack(side=tk.LEFT, padx=5)
        ttk.Button(config_frame, text="Load Settings", 
                  command=self.load_configuration).pack(side=tk.LEFT, padx=5)
                  
    def save_configuration(self):
        """Save current configuration to file"""
        config = {
            'event_name': self.event_name.get(),
            'font_size': self.font_size.get(),
            'font_color': self.font_color,
            'text_x': self.text_x.get(),
            'text_y': self.text_y.get(),
            'selected_font': self.selected_font.get(),
            'text_shadow': self.text_shadow.get(),
            'shadow_color': self.shadow_color,
            'shadow_offset_x': self.shadow_offset_x.get(),
            'shadow_offset_y': self.shadow_offset_y.get(),
            'text_outline': self.text_outline.get(),
            'outline_color': self.outline_color,
            'outline_width': self.outline_width.get(),
            'naming_format': self.naming_format.get(),
            'include_numbers': self.include_numbers.get(),
            'badge_prefix': self.badge_prefix.get(),
            'badge_suffix': self.badge_suffix.get()
        }
        
        filename = filedialog.asksaveasfilename(
            title="Save Configuration",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json")]
        )
        
        if filename:
            try:
                with open(filename, 'w') as f:
                    json.dump(config, f, indent=4)
                messagebox.showinfo("Success", "Configuration saved successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save configuration: {str(e)}")
                
    def load_configuration(self):
        """Load configuration from file"""
        filename = filedialog.askopenfilename(
            title="Load Configuration",
            filetypes=[("JSON files", "*.json")]
        )
        
        if filename:
            try:
                with open(filename, 'r') as f:
                    config = json.load(f)
                
                # Apply configuration
                self.event_name.set(config.get('event_name', ''))
                self.font_size.set(config.get('font_size', 48))
                self.font_color = config.get('font_color', '#000000')
                self.text_x.set(config.get('text_x', 100))
                self.text_y.set(config.get('text_y', 200))
                self.selected_font.set(config.get('selected_font', 'arial.ttf'))
                self.text_shadow.set(config.get('text_shadow', False))
                self.shadow_color = config.get('shadow_color', '#808080')
                self.shadow_offset_x.set(config.get('shadow_offset_x', 2))
                self.shadow_offset_y.set(config.get('shadow_offset_y', 2))
                self.text_outline.set(config.get('text_outline', False))
                self.outline_color = config.get('outline_color', '#FFFFFF')
                self.outline_width.set(config.get('outline_width', 2))
                self.naming_format.set(config.get('naming_format', 'name_badge'))
                self.include_numbers.set(config.get('include_numbers', True))
                self.badge_prefix.set(config.get('badge_prefix', ''))
                self.badge_suffix.set(config.get('badge_suffix', ''))
                
                # Update button colors
                self.color_button.config(bg=self.font_color)
                self.shadow_color_button.config(bg=self.shadow_color)
                self.outline_color_button.config(bg=self.outline_color)
                
                messagebox.showinfo("Success", "Configuration loaded successfully!")
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load configuration: {str(e)}")
        
    def select_template(self):
        """Select template image file"""
        filename = filedialog.askopenfilename(
            title="Select Badge Template",
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.bmp *.gif *.tiff")]
        )
        if filename:
            self.template_path.set(filename)
            
    def select_names_file(self):
        """Select names file"""
        filename = filedialog.askopenfilename(
            title="Select Names File",
            filetypes=[("All supported", "*.csv *.xlsx *.xls *.txt"), 
                      ("CSV files", "*.csv"), 
                      ("Excel files", "*.xlsx *.xls"),
                      ("Text files", "*.txt")]
        )
        if filename:
            self.names_file_path.set(filename)
            
    def select_output_dir(self):
        """Select output directory"""
        dirname = filedialog.askdirectory(title="Select Output Directory")
        if dirname:
            self.output_dir.set(dirname)
            
    def choose_color(self):
        """Choose text color"""
        color = colorchooser.askcolor(title="Choose text color")
        if color[1]:  # If a color was selected
            self.font_color = color[1]
            self.color_button.config(bg=self.font_color)
            
    def choose_shadow_color(self):
        """Choose shadow color"""
        color = colorchooser.askcolor(title="Choose shadow color")
        if color[1]:
            self.shadow_color = color[1]
            self.shadow_color_button.config(bg=self.shadow_color)
            
    def choose_outline_color(self):
        """Choose outline color"""
        color = colorchooser.askcolor(title="Choose outline color")
        if color[1]:
            self.outline_color = color[1]
            self.outline_color_button.config(bg=self.outline_color)
            
    def enable_click_positioning(self):
        """Enable click-to-position mode"""
        if not self.template_path.get():
            messagebox.showwarning("Warning", "Please select a template first!")
            return
            
        messagebox.showinfo("Click Positioning", 
                           "Preview a badge first, then click on the preview image to set text position!")
                           
    def update_naming_preview(self):
        """Update the naming preview"""
        sample_name = "John Doe"
        event = self.event_name.get() or "SampleEvent"
        
        filename = self.generate_filename(sample_name, 1, event)
        self.naming_preview.config(text=f"Example: {filename}")
        
    def generate_filename(self, name, index, event_name):
        """Generate filename based on naming format"""
        # Clean the name for filename
        clean_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).replace(' ', '_')
        clean_event = "".join(c for c in event_name if c.isalnum() or c in (' ', '-', '_')).replace(' ', '_')
        
        prefix = self.badge_prefix.get()
        suffix = self.badge_suffix.get()
        
        # Build filename based on format
        format_type = self.naming_format.get()
        
        if format_type == "name_badge":
            base_name = f"{clean_name}_badge"
        elif format_type == "badge_name":
            base_name = f"badge_{clean_name}"
        elif format_type == "event_name_badge":
            base_name = f"{clean_event}_{clean_name}_badge"
        elif format_type == "name_event":
            base_name = f"{clean_name}_{clean_event}"
        else:  # custom
            base_name = clean_name
            
        # Add prefix and suffix
        if prefix:
            base_name = f"{prefix}_{base_name}"
        if suffix:
            base_name = f"{base_name}_{suffix}"
            
        # Add number if enabled
        if self.include_numbers.get():
            base_name = f"{base_name}_{index:03d}"
            
        return f"{base_name}.png"
            
    def load_names(self, file_path):
        """Load names from file"""
        try:
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext == '.csv':
                df = pd.read_csv(file_path)
            elif file_ext in ['.xlsx', '.xls']:
                df = pd.read_excel(file_path)
            elif file_ext == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    names = [line.strip() for line in f if line.strip()]
                return names
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
            
            # Get the first column as names
            names = df.iloc[:, 0].dropna().astype(str).tolist()
            return names
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load names: {str(e)}")
            return []
            
    def get_font(self):
        """Get font object"""
        try:
            # Try to load the selected font
            font_path = self.selected_font.get()
            if not os.path.isabs(font_path):
                # Try to find font in Windows fonts directory
                windows_fonts = "C:/Windows/Fonts/"
                font_path = os.path.join(windows_fonts, font_path)
            
            return ImageFont.truetype(font_path, self.font_size.get())
        except (OSError, IOError):
            # Fallback to default font
            try:
                return ImageFont.truetype("arial.ttf", self.font_size.get())
            except (OSError, IOError):
                return ImageFont.load_default()
                
    def draw_text_with_effects(self, draw, text, x, y, font):
        """Draw text with shadow and outline effects"""
        # Draw shadow if enabled
        if self.text_shadow.get():
            shadow_x = x + self.shadow_offset_x.get()
            shadow_y = y + self.shadow_offset_y.get()
            draw.text((shadow_x, shadow_y), text, font=font, fill=self.shadow_color)
        
        # Draw outline if enabled
        if self.text_outline.get():
            outline_width = self.outline_width.get()
            for dx in range(-outline_width, outline_width + 1):
                for dy in range(-outline_width, outline_width + 1):
                    if dx != 0 or dy != 0:
                        draw.text((x + dx, y + dy), text, font=font, fill=self.outline_color)
        
        # Draw main text
        draw.text((x, y), text, font=font, fill=self.font_color)
                
    def create_badge(self, template_path, name, output_path):
        """Create a single badge with the given name"""
        try:
            # Open template image
            template = Image.open(template_path)
            
            # Create a copy to work with
            badge = template.copy()
            
            # Create drawing context
            draw = ImageDraw.Draw(badge)
            
            # Get font
            font = self.get_font()
            
            # Draw the name with effects
            self.draw_text_with_effects(draw, name, self.text_x.get(), self.text_y.get(), font)
            
            # Save the badge
            badge.save(output_path)
            return True
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to create badge for {name}: {str(e)}")
            return False
            
    def preview_badge(self):
        """Preview the first badge"""
        if not self.template_path.get():
            messagebox.showerror("Error", "Please select a template image")
            return
            
        if not self.names_file_path.get():
            messagebox.showerror("Error", "Please select a names file")
            return
            
        # Load names
        names = self.load_names(self.names_file_path.get())
        if not names:
            return
            
        # Create preview
        preview_name = names[0] if names else "Sample Name"
        preview_path = "preview_badge.png"
        
        if self.create_badge(self.template_path.get(), preview_name, preview_path):
            # Show preview
            try:
                preview_img = Image.open(preview_path)
                # Resize if too large for screen
                screen_width = self.root.winfo_screenwidth()
                screen_height = self.root.winfo_screenheight()
                
                img_width, img_height = preview_img.size
                max_width = min(800, screen_width - 100)
                max_height = min(600, screen_height - 100)
                
                if img_width > max_width or img_height > max_height:
                    ratio = min(max_width/img_width, max_height/img_height)
                    new_width = int(img_width * ratio)
                    new_height = int(img_height * ratio)
                    preview_img = preview_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                preview_img.show()
                os.remove(preview_path)  # Clean up
                
                # Update naming preview
                self.update_naming_preview()
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to show preview: {str(e)}")
                
    def generate_badges(self):
        """Generate all badges"""
        if not self.template_path.get():
            messagebox.showerror("Error", "Please select a template image")
            return
            
        if not self.names_file_path.get():
            messagebox.showerror("Error", "Please select a names file")
            return
            
        if not self.event_name.get():
            result = messagebox.askyesno("Event Name", 
                                       "No event name specified. Use 'DefaultEvent' as folder name?")
            if result:
                self.event_name.set("DefaultEvent")
            else:
                return
            
        # Load names
        names = self.load_names(self.names_file_path.get())
        if not names:
            return
            
        # Create event folder inside output directory
        event_folder_name = "".join(c for c in self.event_name.get() if c.isalnum() or c in (' ', '-', '_')).replace(' ', '_')
        event_output_dir = os.path.join(self.output_dir.get(), event_folder_name)
        os.makedirs(event_output_dir, exist_ok=True)
        
        # Setup progress bar
        self.progress['maximum'] = len(names)
        self.progress['value'] = 0
        
        successful = 0
        failed = 0
        
        for i, name in enumerate(names):
            self.status_label.config(text=f"Generating badge for: {name}")
            self.root.update()
            
            # Generate filename using new naming system
            filename = self.generate_filename(name, i + 1, self.event_name.get())
            output_path = os.path.join(event_output_dir, filename)
            
            if self.create_badge(self.template_path.get(), name, output_path):
                successful += 1
            else:
                failed += 1
                
            self.progress['value'] = i + 1
            self.root.update()
            
        # Show completion message
        message = ("Badge generation completed!\n"
                  f"Event: {self.event_name.get()}\n"
                  f"Output folder: {event_output_dir}\n"
                  f"Successful: {successful}\nFailed: {failed}")
        messagebox.showinfo("Completed", message)
        
        self.status_label.config(text="Ready to generate badges")
        self.progress['value'] = 0
        
        # Ask if user wants to open the output folder
        if messagebox.askyesno("Open Folder", "Would you like to open the output folder?"):
            os.startfile(event_output_dir)
        
    def run(self):
        """Run the application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = BadgeGenerator()
    app.run()
