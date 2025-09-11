#!/usr/bin/env python3
"""
Professional Badge Generator
Automatically generates personalized badges from a template image and names list.
Features: Modern UI, Advanced Text Effects, Click Positioning, Event Organization
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, colorchooser
from PIL import Image, ImageDraw, ImageFont, ImageTk, ImageFilter
import pandas as pd
import os
import json
from pathlib import Path
import threading

class ProfessionalBadgeGenerator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🎫 Professional Badge Generator")
        self.root.geometry("1200x800")
        self.root.configure(bg='#f0f0f0')
        
        # Variables
        self.template_path = tk.StringVar()
        self.names_file_path = tk.StringVar()
        self.output_dir = tk.StringVar(value="output")
        self.event_name = tk.StringVar(value="My Event")
        
        # Text styling variables
        self.font_size = tk.IntVar(value=48)
        self.font_color = "#000000"
        self.text_x = tk.IntVar(value=400)
        self.text_y = tk.IntVar(value=300)
        
        # Advanced styling
        self.text_shadow = tk.BooleanVar(value=False)
        self.shadow_color = "#808080"
        self.shadow_offset_x = tk.IntVar(value=3)
        self.shadow_offset_y = tk.IntVar(value=3)
        self.shadow_blur = tk.IntVar(value=2)
        
        self.text_outline = tk.BooleanVar(value=False)
        self.outline_color = "#FFFFFF"
        self.outline_width = tk.IntVar(value=2)
        
        # Position presets
        self.position_preset = tk.StringVar(value="custom")
        
        # Text alignment
        self.text_align = tk.StringVar(value="center")
        
        # Font variables
        self.font_family = tk.StringVar(value="Arial")
        self.font_style = tk.StringVar(value="normal")
        self.font_weight = tk.StringVar(value="normal")
        
        # Text decorations
        self.text_underline = tk.BooleanVar(value=False)
        self.text_strikethrough = tk.BooleanVar(value=False)
        self.text_rotation = tk.IntVar(value=0)  # Text rotation angle
        
        # Available system fonts (commonly available on Windows)
        self.system_fonts = [
            "Arial", "Times New Roman", "Calibri", "Verdana", 
            "Georgia", "Trebuchet MS", "Comic Sans MS", "Impact", 
            "Tahoma", "Courier New", "Century Gothic", "Book Antiqua", 
            "Segoe UI", "Consolas", "Cambria", "Candara"
        ]
        
        # Template and preview
        self.template_image = None
        self.preview_canvas = None
        self.preview_photo = None
        self.canvas_scale = 1.0
        
        # Names list
        self.names_list = []
        
        # Click positioning
        self.click_positioning = False
        
        # Register validation functions
        self.validate_number = (self.root.register(self.validate_numeric_input), '%P')
        
        self.setup_gui()
    
    def validate_numeric_input(self, value):
        """Validate numeric input for entries"""
        if value == "":
            return True
        try:
            num = int(value)
            return 0 <= num <= 10000  # Reasonable bounds
        except ValueError:
            return False
        
    def setup_gui(self):
        """Setup the GUI interface"""
        # Main title
        title_frame = tk.Frame(self.root, bg='#2c3e50', height=60)
        title_frame.pack(fill=tk.X)
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(title_frame, text="🎫 Professional Badge Generator", 
                              font=('Arial', 16, 'bold'), fg='white', bg='#2c3e50')
        title_label.pack(expand=True)
        
        # Main container
        main_container = tk.Frame(self.root, bg='#ecf0f1')
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Left panel (controls)
        left_panel = tk.Frame(main_container, bg='white', width=450, relief='raised', bd=1)
        left_panel.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        left_panel.pack_propagate(False)
        
        # Right panel (preview)
        right_panel = tk.Frame(main_container, bg='white', relief='raised', bd=1)
        right_panel.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Setup panels
        self.setup_control_panel(left_panel)
        self.setup_preview_panel(right_panel)
    
    def setup_control_panel(self, parent):
        """Setup the control panel with tabs"""
        # Create notebook for tabs
        notebook = ttk.Notebook(parent)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create tabs
        files_tab = ttk.Frame(notebook)
        text_tab = ttk.Frame(notebook)
        effects_tab = ttk.Frame(notebook)
        position_tab = ttk.Frame(notebook)
        
        notebook.add(files_tab, text="📁 Files & Event")
        notebook.add(text_tab, text="📝 Text Style")
        notebook.add(effects_tab, text="✨ Effects")
        notebook.add(position_tab, text="📍 Position")
        
        self.setup_files_tab(files_tab)
        self.setup_text_tab(text_tab)
        self.setup_effects_tab(effects_tab)
        self.setup_position_tab(position_tab)
        
        # Action buttons at bottom
        self.setup_action_buttons(parent)
    
    def setup_files_tab(self, parent):
        """Setup files selection tab"""
        # Create scrollable frame
        canvas = tk.Canvas(parent)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Event name section
        event_frame = ttk.LabelFrame(scrollable_frame, text="🎉 Event Information", padding=15)
        event_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(event_frame, text="Event Name:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        event_entry = tk.Entry(event_frame, textvariable=self.event_name, width=35, font=('Arial', 10), relief='groove', bd=2)
        event_entry.grid(row=0, column=1, padx=10, pady=5)
        
        tk.Label(event_frame, text="(Creates a folder with this name)", 
                font=('Arial', 8), fg='gray').grid(row=1, column=1, sticky=tk.W, padx=10)
        
        # Template selection
        template_frame = ttk.LabelFrame(scrollable_frame, text="🖼️ Badge Template", padding=15)
        template_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(template_frame, text="Template Image:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        template_entry = tk.Entry(template_frame, textvariable=self.template_path, width=30, font=('Arial', 9), relief='groove', bd=2)
        template_entry.grid(row=1, column=0, padx=5, pady=5)
        
        browse_btn = tk.Button(template_frame, text="Browse", command=self.select_template,
                              bg='#3498db', fg='white', font=('Arial', 9, 'bold'), relief='flat')
        browse_btn.grid(row=1, column=1, padx=10)
        
        # Template info label
        self.template_info = tk.Label(template_frame, text="No template selected", 
                                     font=('Arial', 9), fg='gray')
        self.template_info.grid(row=2, column=0, columnspan=2, pady=5)
        
        # Names file selection
        names_frame = ttk.LabelFrame(scrollable_frame, text="📋 Names List", padding=15)
        names_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(names_frame, text="Names File (TXT/CSV/Excel):", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        names_entry = tk.Entry(names_frame, textvariable=self.names_file_path, width=30, font=('Arial', 9), relief='groove', bd=2)
        names_entry.grid(row=1, column=0, padx=5, pady=5)
        
        names_btn = tk.Button(names_frame, text="Browse", command=self.select_names_file,
                             bg='#3498db', fg='white', font=('Arial', 9, 'bold'), relief='flat')
        names_btn.grid(row=1, column=1, padx=10)
        
        # Names count label
        self.names_count = tk.Label(names_frame, text="No names loaded", 
                                   font=('Arial', 9), fg='gray')
        self.names_count.grid(row=2, column=0, columnspan=2, pady=5)
        
        # Output directory
        output_frame = ttk.LabelFrame(scrollable_frame, text="📂 Output Settings", padding=15)
        output_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(output_frame, text="Output Directory:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        output_entry = tk.Entry(output_frame, textvariable=self.output_dir, width=30, font=('Arial', 9), relief='groove', bd=2)
        output_entry.grid(row=1, column=0, padx=5, pady=5)
        
        output_btn = tk.Button(output_frame, text="Browse", command=self.select_output_dir,
                              bg='#3498db', fg='white', font=('Arial', 9, 'bold'), relief='flat')
        output_btn.grid(row=1, column=1, padx=10)
    
    def setup_text_tab(self, parent):
        """Setup text styling tab"""
        # Create scrollable frame
        canvas = tk.Canvas(parent)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Font selection
        font_frame = ttk.LabelFrame(scrollable_frame, text="🔤 Font Settings", padding=15)
        font_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Font family
        tk.Label(font_frame, text="Font Family:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        font_combo = ttk.Combobox(font_frame, textvariable=self.font_family, 
                                values=self.system_fonts, width=20, font=('Arial', 9))
        font_combo.grid(row=0, column=1, padx=10, pady=5)
        font_combo.bind('<<ComboboxSelected>>', lambda e: self.update_preview())
        
        # Font size with bigger range (12-300)
        tk.Label(font_frame, text="Font Size:", font=('Arial', 10, 'bold')).grid(row=1, column=0, sticky=tk.W, pady=5)
        size_frame = tk.Frame(font_frame)
        size_frame.grid(row=1, column=1, padx=10, pady=5)
        
        size_scale = tk.Scale(size_frame, from_=12, to=300, variable=self.font_size, 
                             orient=tk.HORIZONTAL, length=120, bg='#ecf0f1',
                             command=lambda v: self.update_preview())
        size_scale.pack(side=tk.LEFT)
        
        # Add entry for direct number input
        size_entry = tk.Entry(size_frame, textvariable=self.font_size, width=5, 
                             font=('Arial', 10), relief='groove', bd=1,
                             validate='key', validatecommand=self.validate_number)
        size_entry.pack(side=tk.LEFT, padx=5)
        size_entry.bind('<Return>', lambda e: self.update_preview())
        size_entry.bind('<FocusOut>', lambda e: self.update_preview())
        
        # Font style
        tk.Label(font_frame, text="Style:", font=('Arial', 10, 'bold')).grid(row=2, column=0, sticky=tk.W, pady=5)
        style_frame = tk.Frame(font_frame)
        style_frame.grid(row=2, column=1, padx=10, pady=5)
        
        style_combo = ttk.Combobox(style_frame, textvariable=self.font_style, 
                    values=["normal", "italic"], width=10, font=('Arial', 9), state="readonly")
        style_combo.pack(side=tk.LEFT, padx=2)
        style_combo.bind('<<ComboboxSelected>>', lambda e: self.update_preview())
        
        weight_combo = ttk.Combobox(style_frame, textvariable=self.font_weight, 
                    values=["normal", "bold"], width=10, font=('Arial', 9), state="readonly")
        weight_combo.pack(side=tk.LEFT, padx=2)
        weight_combo.bind('<<ComboboxSelected>>', lambda e: self.update_preview())
        
        # Text decorations
        decorations_frame = ttk.LabelFrame(scrollable_frame, text="🎨 Text Decorations", padding=15)
        decorations_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Underline and strikethrough checkboxes
        decoration_options = tk.Frame(decorations_frame)
        decoration_options.grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=5)
        
        underline_check = tk.Checkbutton(decoration_options, text="Underline", 
                                        variable=self.text_underline, font=('Arial', 10),
                                        command=self.update_preview)
        underline_check.pack(side=tk.LEFT, padx=10)
        
        strikethrough_check = tk.Checkbutton(decoration_options, text="Strikethrough", 
                                           variable=self.text_strikethrough, font=('Arial', 10),
                                           command=self.update_preview)
        strikethrough_check.pack(side=tk.LEFT, padx=10)
        
        # Text rotation
        tk.Label(decorations_frame, text="Text Rotation:", font=('Arial', 10, 'bold')).grid(row=1, column=0, sticky=tk.W, pady=5)
        rotation_frame = tk.Frame(decorations_frame)
        rotation_frame.grid(row=1, column=1, padx=10, pady=5)
        
        rotation_scale = tk.Scale(rotation_frame, from_=-180, to=180, variable=self.text_rotation, 
                                 orient=tk.HORIZONTAL, length=150, bg='#ecf0f1',
                                 command=lambda v: self.update_preview())
        rotation_scale.pack(side=tk.LEFT)
        
        # Add entry for direct number input
        rotation_entry = tk.Entry(rotation_frame, textvariable=self.text_rotation, width=5, 
                                 font=('Arial', 10), relief='groove', bd=1)
        rotation_entry.pack(side=tk.LEFT, padx=5)
        rotation_entry.bind('<Return>', lambda e: self.update_preview())
        rotation_entry.bind('<FocusOut>', lambda e: self.update_preview())
        
        # Font color
        color_frame = ttk.LabelFrame(scrollable_frame, text="🎨 Colors", padding=15)
        color_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(color_frame, text="Text Color:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        self.color_button = tk.Button(color_frame, text="Choose Color", 
                                    bg=self.font_color, fg='white', font=('Arial', 9, 'bold'),
                                    command=self.choose_color, width=15, relief='flat')
        self.color_button.grid(row=0, column=1, padx=10, pady=5)
        
        # Text alignment
        align_frame = ttk.LabelFrame(scrollable_frame, text="📐 Alignment", padding=15)
        align_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(align_frame, text="Text Alignment:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        align_combo = ttk.Combobox(align_frame, textvariable=self.text_align, 
                                 values=["left", "center", "right"], width=15, font=('Arial', 9), state="readonly")
        align_combo.grid(row=0, column=1, padx=10, pady=5)
        align_combo.bind('<<ComboboxSelected>>', lambda e: self.update_preview())
    
    def setup_effects_tab(self, parent):
        """Setup text effects tab"""
        # Create scrollable frame
        canvas = tk.Canvas(parent)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Shadow effects
        shadow_frame = ttk.LabelFrame(scrollable_frame, text="🌑 Shadow Effects", padding=15)
        shadow_frame.pack(fill=tk.X, padx=10, pady=10)
        
        shadow_check = tk.Checkbutton(shadow_frame, text="Enable Shadow", 
                                     variable=self.text_shadow, font=('Arial', 10, 'bold'),
                                     command=self.update_preview)
        shadow_check.grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=10)
        
        # Shadow color
        tk.Label(shadow_frame, text="Shadow Color:", font=('Arial', 10)).grid(row=1, column=0, sticky=tk.W, pady=5)
        self.shadow_color_button = tk.Button(shadow_frame, text="Choose", 
                                           bg=self.shadow_color, fg='white', font=('Arial', 9, 'bold'),
                                           command=self.choose_shadow_color, width=12, relief='flat')
        self.shadow_color_button.grid(row=1, column=1, padx=10, pady=5)
        
        # Shadow offset
        tk.Label(shadow_frame, text="Shadow Offset X:", font=('Arial', 10)).grid(row=2, column=0, sticky=tk.W, pady=5)
        shadow_x_scale = tk.Scale(shadow_frame, from_=-20, to=20, variable=self.shadow_offset_x, 
                 orient=tk.HORIZONTAL, length=120, bg='#ecf0f1',
                 command=lambda v: self.update_preview())
        shadow_x_scale.grid(row=2, column=1, padx=10, pady=5)
        
        tk.Label(shadow_frame, text="Shadow Offset Y:", font=('Arial', 10)).grid(row=3, column=0, sticky=tk.W, pady=5)
        shadow_y_scale = tk.Scale(shadow_frame, from_=-20, to=20, variable=self.shadow_offset_y, 
                 orient=tk.HORIZONTAL, length=120, bg='#ecf0f1',
                 command=lambda v: self.update_preview())
        shadow_y_scale.grid(row=3, column=1, padx=10, pady=5)
        
        tk.Label(shadow_frame, text="Shadow Blur:", font=('Arial', 10)).grid(row=4, column=0, sticky=tk.W, pady=5)
        shadow_blur_scale = tk.Scale(shadow_frame, from_=0, to=10, variable=self.shadow_blur, 
                 orient=tk.HORIZONTAL, length=120, bg='#ecf0f1',
                 command=lambda v: self.update_preview())
        shadow_blur_scale.grid(row=4, column=1, padx=10, pady=5)
        
        # Outline effects
        outline_frame = ttk.LabelFrame(scrollable_frame, text="⭕ Outline Effects", padding=15)
        outline_frame.pack(fill=tk.X, padx=10, pady=10)
        
        outline_check = tk.Checkbutton(outline_frame, text="Enable Outline", 
                                      variable=self.text_outline, font=('Arial', 10, 'bold'),
                                      command=self.update_preview)
        outline_check.grid(row=0, column=0, columnspan=2, sticky=tk.W, pady=10)
        
        # Outline color
        tk.Label(outline_frame, text="Outline Color:", font=('Arial', 10)).grid(row=1, column=0, sticky=tk.W, pady=5)
        self.outline_color_button = tk.Button(outline_frame, text="Choose", 
                                            bg=self.outline_color, fg='black', font=('Arial', 9, 'bold'),
                                            command=self.choose_outline_color, width=12, relief='flat')
        self.outline_color_button.grid(row=1, column=1, padx=10, pady=5)
        
        # Outline width
        tk.Label(outline_frame, text="Outline Width:", font=('Arial', 10)).grid(row=2, column=0, sticky=tk.W, pady=5)
        outline_width_scale = tk.Scale(outline_frame, from_=1, to=10, variable=self.outline_width, 
                 orient=tk.HORIZONTAL, length=120, bg='#ecf0f1',
                 command=lambda v: self.update_preview())
        outline_width_scale.grid(row=2, column=1, padx=10, pady=5)
    
    def setup_position_tab(self, parent):
        """Setup position settings tab"""
        # Create scrollable frame
        canvas = tk.Canvas(parent)
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Position presets
        preset_frame = ttk.LabelFrame(scrollable_frame, text="📍 Position Presets", padding=15)
        preset_frame.pack(fill=tk.X, padx=10, pady=10)
        
        presets = [
            ("Custom", "custom"),
            ("Top Left", "top_left"),
            ("Top Center", "top_center"),
            ("Top Right", "top_right"),
            ("Center Left", "center_left"),
            ("Center", "center"),
            ("Center Right", "center_right"),
            ("Bottom Left", "bottom_left"),
            ("Bottom Center", "bottom_center"),
            ("Bottom Right", "bottom_right")
        ]
        
        for i, (text, value) in enumerate(presets):
            row, col = divmod(i, 2)
            preset_radio = tk.Radiobutton(preset_frame, text=text, variable=self.position_preset, 
                          value=value, font=('Arial', 10),
                          command=self.apply_position_preset)
            preset_radio.grid(row=row, column=col, sticky=tk.W, padx=10, pady=5)
        
        # Custom position
        custom_frame = ttk.LabelFrame(scrollable_frame, text="🎯 Custom Position", padding=15)
        custom_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Label(custom_frame, text="X Position:", font=('Arial', 10, 'bold')).grid(row=0, column=0, sticky=tk.W, pady=5)
        x_frame = tk.Frame(custom_frame)
        x_frame.grid(row=0, column=1, padx=10, pady=5)
        
        x_scale = tk.Scale(x_frame, from_=0, to=2000, variable=self.text_x, 
                 orient=tk.HORIZONTAL, length=120, bg='#ecf0f1',
                 command=lambda v: self.update_preview())
        x_scale.pack(side=tk.LEFT)
        
        # Add entry for direct number input
        x_entry = tk.Entry(x_frame, textvariable=self.text_x, width=6, 
                          font=('Arial', 10), relief='groove', bd=1,
                          validate='key', validatecommand=self.validate_number)
        x_entry.pack(side=tk.LEFT, padx=5)
        x_entry.bind('<Return>', lambda e: self.update_preview())
        x_entry.bind('<FocusOut>', lambda e: self.update_preview())
        
        tk.Label(custom_frame, text="Y Position:", font=('Arial', 10, 'bold')).grid(row=1, column=0, sticky=tk.W, pady=5)
        y_frame = tk.Frame(custom_frame)
        y_frame.grid(row=1, column=1, padx=10, pady=5)
        
        y_scale = tk.Scale(y_frame, from_=0, to=2000, variable=self.text_y, 
                 orient=tk.HORIZONTAL, length=120, bg='#ecf0f1',
                 command=lambda v: self.update_preview())
        y_scale.pack(side=tk.LEFT)
        
        # Add entry for direct number input
        y_entry = tk.Entry(y_frame, textvariable=self.text_y, width=6, 
                          font=('Arial', 10), relief='groove', bd=1,
                          validate='key', validatecommand=self.validate_number)
        y_entry.pack(side=tk.LEFT, padx=5)
        y_entry.bind('<Return>', lambda e: self.update_preview())
        y_entry.bind('<FocusOut>', lambda e: self.update_preview())
        
        # Click to position button
        click_btn = tk.Button(custom_frame, text="📌 Click on Preview to Set Position", 
                  command=self.enable_click_positioning, 
                  bg='#e74c3c', fg='white', font=('Arial', 10, 'bold'), relief='flat')
        click_btn.grid(row=2, column=0, columnspan=2, pady=15)
    
    def setup_preview_panel(self, parent):
        """Setup the preview panel"""
        # Title
        title_frame = tk.Frame(parent, bg='white')
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        
        title_label = tk.Label(title_frame, text="🔍 Live Preview", 
                              font=('Arial', 14, 'bold'), fg='#2c3e50', bg='white')
        title_label.pack(side=tk.LEFT)
        
        # Preview canvas
        canvas_frame = tk.Frame(parent, bg='white')
        canvas_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Create canvas with scrollbars
        self.canvas_container = tk.Frame(canvas_frame, bg='#ecf0f1', relief='sunken', bd=2)
        self.canvas_container.pack(fill=tk.BOTH, expand=True)
        
        self.preview_canvas = tk.Canvas(self.canvas_container, bg='#ecf0f1', 
                                      highlightthickness=0, cursor='hand2')
        
        h_scrollbar = ttk.Scrollbar(self.canvas_container, orient=tk.HORIZONTAL, command=self.preview_canvas.xview)
        v_scrollbar = ttk.Scrollbar(self.canvas_container, orient=tk.VERTICAL, command=self.preview_canvas.yview)
        
        self.preview_canvas.configure(xscrollcommand=h_scrollbar.set, yscrollcommand=v_scrollbar.set)
        
        self.preview_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
        v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Bind canvas click
        self.preview_canvas.bind("<Button-1>", self.canvas_click)
        
        # Preview controls
        controls_frame = tk.Frame(parent, bg='white')
        controls_frame.pack(fill=tk.X, padx=10, pady=10)
        
        refresh_btn = tk.Button(controls_frame, text="🔄 Refresh Preview", 
                  command=self.update_preview, bg='#3498db', fg='white',
                  font=('Arial', 10, 'bold'), relief='flat')
        refresh_btn.pack(side=tk.LEFT, padx=5)
        
        # Zoom controls
        tk.Label(controls_frame, text="Zoom:", font=('Arial', 10, 'bold'), 
                bg='white', fg='#2c3e50').pack(side=tk.LEFT, padx=10)
        
        zoom_buttons = [("25%", 0.25), ("50%", 0.5), ("75%", 0.75), ("100%", 1.0), ("150%", 1.5)]
        for text, scale in zoom_buttons:
            zoom_btn = tk.Button(controls_frame, text=text, 
                      command=lambda s=scale: self.set_zoom(s),
                      bg='#95a5a6', fg='white', font=('Arial', 9, 'bold'), relief='flat')
            zoom_btn.pack(side=tk.LEFT, padx=2)
    
    def setup_action_buttons(self, parent):
        """Setup action buttons"""
        button_frame = tk.Frame(parent, bg='white')
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        preview_btn = tk.Button(button_frame, text="👁️ Preview Single Badge", 
                  command=self.preview_single_badge, 
                  bg='#f39c12', fg='white', font=('Arial', 11, 'bold'), relief='flat')
        preview_btn.pack(fill=tk.X, pady=3)
        
        generate_btn = tk.Button(button_frame, text="🚀 Generate All Badges", 
                  command=self.generate_all_badges, 
                  bg='#27ae60', fg='white', font=('Arial', 11, 'bold'), relief='flat')
        generate_btn.pack(fill=tk.X, pady=3)
        
        save_btn = tk.Button(button_frame, text="💾 Save Configuration", 
                  command=self.save_configuration, 
                  bg='#8e44ad', fg='white', font=('Arial', 11, 'bold'), relief='flat')
        save_btn.pack(fill=tk.X, pady=3)
        
        load_btn = tk.Button(button_frame, text="📁 Load Configuration", 
                  command=self.load_configuration, 
                  bg='#34495e', fg='white', font=('Arial', 11, 'bold'), relief='flat')
        load_btn.pack(fill=tk.X, pady=3)
    
    def select_template(self):
        """Select badge template image"""
        file_path = filedialog.askopenfilename(
            title="Select Badge Template",
            filetypes=[
                ("Image files", "*.png *.jpg *.jpeg *.gif *.bmp *.tiff"),
                ("All files", "*.*")
            ]
        )
        if file_path:
            self.template_path.set(file_path)
            self.load_template()
    
    def load_template(self):
        """Load and display template information"""
        try:
            self.template_image = Image.open(self.template_path.get())
            width, height = self.template_image.size
            self.template_info.config(text=f"✅ Size: {width}x{height} pixels", fg='green')
            
            # Update position sliders max values
            self.update_position_ranges(width, height)
            self.update_preview()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load template: {str(e)}")
            self.template_info.config(text="❌ Failed to load template", fg='red')
    
    def update_position_ranges(self, width, height):
        """Update position slider ranges based on template size"""
        # Find all scale widgets and update their ranges
        def update_scales(widget):
            if isinstance(widget, tk.Scale):
                if widget.cget('variable') == str(self.text_x):
                    widget.config(to=width)
                elif widget.cget('variable') == str(self.text_y):
                    widget.config(to=height)
            
            # Recursively check children
            for child in widget.winfo_children():
                update_scales(child)
        
        update_scales(self.root)
    
    def select_names_file(self):
        """Select names file"""
        file_path = filedialog.askopenfilename(
            title="Select Names File",
            filetypes=[
                ("Text files", "*.txt"),
                ("CSV files", "*.csv"),
                ("Excel files", "*.xlsx *.xls"),
                ("All files", "*.*")
            ]
        )
        if file_path:
            self.names_file_path.set(file_path)
            self.load_names()
    
    def load_names(self):
        """Load names from file"""
        try:
            file_path = self.names_file_path.get()
            if not file_path:
                return
            
            if file_path.endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.names_list = [line.strip() for line in f if line.strip()]
            elif file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
                self.names_list = df.iloc[:, 0].astype(str).tolist()  # First column
            elif file_path.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path)
                self.names_list = df.iloc[:, 0].astype(str).tolist()  # First column
            
            self.names_count.config(text=f"✅ Loaded {len(self.names_list)} names", fg='green')
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load names: {str(e)}")
            self.names_count.config(text="❌ Failed to load names", fg='red')
    
    def select_output_dir(self):
        """Select output directory"""
        directory = filedialog.askdirectory(title="Select Output Directory")
        if directory:
            self.output_dir.set(directory)
    
    def choose_color(self):
        """Choose text color"""
        color = colorchooser.askcolor(color=self.font_color)[1]
        if color:
            self.font_color = color
            self.color_button.config(bg=color)
            self.update_preview()
    
    def choose_shadow_color(self):
        """Choose shadow color"""
        color = colorchooser.askcolor(color=self.shadow_color)[1]
        if color:
            self.shadow_color = color
            self.shadow_color_button.config(bg=color)
            self.update_preview()
    
    def choose_outline_color(self):
        """Choose outline color"""
        color = colorchooser.askcolor(color=self.outline_color)[1]
        if color:
            self.outline_color = color
            self.outline_color_button.config(bg=color)
            self.update_preview()
    
    def apply_position_preset(self):
        """Apply position preset"""
        if not self.template_image:
            return
        
        preset = self.position_preset.get()
        width, height = self.template_image.size
        
        positions = {
            "top_left": (width * 0.1, height * 0.1),
            "top_center": (width * 0.5, height * 0.1),
            "top_right": (width * 0.9, height * 0.1),
            "center_left": (width * 0.1, height * 0.5),
            "center": (width * 0.5, height * 0.5),
            "center_right": (width * 0.9, height * 0.5),
            "bottom_left": (width * 0.1, height * 0.9),
            "bottom_center": (width * 0.5, height * 0.9),
            "bottom_right": (width * 0.9, height * 0.9),
        }
        
        if preset in positions:
            x, y = positions[preset]
            self.text_x.set(int(x))
            self.text_y.set(int(y))
            self.update_preview()
    
    def enable_click_positioning(self):
        """Enable click positioning mode"""
        self.click_positioning = True
        self.preview_canvas.config(cursor='crosshair')
        messagebox.showinfo("Click Positioning", 
                           "✨ Click on the preview image to set the text position!\n\n"
                           "The crosshair cursor shows you're in positioning mode.")
    
    def canvas_click(self, event):
        """Handle canvas click for positioning"""
        if self.click_positioning and self.template_image:
            # Convert canvas coordinates to image coordinates
            canvas_x = self.preview_canvas.canvasx(event.x)
            canvas_y = self.preview_canvas.canvasy(event.y)
            
            # Account for zoom
            image_x = int(canvas_x / self.canvas_scale)
            image_y = int(canvas_y / self.canvas_scale)
            
            # Ensure coordinates are within image bounds
            image_x = max(0, min(image_x, self.template_image.width))
            image_y = max(0, min(image_y, self.template_image.height))
            
            # Update position
            self.text_x.set(image_x)
            self.text_y.set(image_y)
            self.position_preset.set("custom")
            
            self.click_positioning = False
            self.preview_canvas.config(cursor='hand2')
            self.update_preview()
            
            messagebox.showinfo("Position Set", f"✅ Text position set to: ({image_x}, {image_y})")
    
    def set_zoom(self, scale):
        """Set preview zoom level"""
        self.canvas_scale = scale
        self.update_preview()
    
    def get_font(self):
        """Get font object with proper fallback and size/style support"""
        font_size = self.font_size.get()
        font_family = self.font_family.get()
        font_style = self.font_style.get()
        font_weight = self.font_weight.get()
        
        # Ensure minimum readable font size
        font_size = max(8, font_size)
        
        try:
            # Strategy 1: Try loading font by name (works for system-installed fonts)
            font_attempts = self.generate_font_attempts(font_family, font_style, font_weight)
            
            for font_attempt in font_attempts:
                try:
                    font = ImageFont.truetype(font_attempt, font_size)
                    # Test if the font actually works
                    font.getbbox("Test")
                    return font
                except:
                    continue
            
            # Strategy 2: Try basic font names without paths
            basic_attempts = [font_family, "Arial", "arial", "DejaVuSans", "Liberation Sans"]
            for font_name in basic_attempts:
                try:
                    font = ImageFont.truetype(font_name, font_size) 
                    font.getbbox("Test")  # Test if it works
                    return font
                except:
                    continue
                    
        except Exception as e:
            print(f"Font loading error: {e}")
        
        # Strategy 3: Use fallback font that properly handles size
        return self.create_working_fallback_font(font_size)
    
    def generate_font_attempts(self, font_family, font_style, font_weight):
        """Generate list of font file names to try"""
        font_attempts = []
        
        # Windows font file mappings
        font_paths = {
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
            "Century Gothic": "gothic",
            "Book Antiqua": "bkant",
            "Segoe UI": "segoeui",
            "Consolas": "consola",
            "Cambria": "cambria",
            "Candara": "candara"
        }
        
        if font_family in font_paths:
            base_name = font_paths[font_family]
            
            # Generate style variations
            if font_weight == "bold" and font_style == "italic":
                font_attempts.extend([
                    f"{base_name}bi.ttf",
                    f"{base_name}z.ttf",
                    f"{base_name}_bold_italic.ttf"
                ])
            elif font_weight == "bold":
                font_attempts.extend([
                    f"{base_name}bd.ttf",
                    f"{base_name}b.ttf",
                    f"{base_name}_bold.ttf"
                ])
            elif font_style == "italic":
                font_attempts.extend([
                    f"{base_name}i.ttf",
                    f"{base_name}it.ttf",
                    f"{base_name}_italic.ttf"
                ])
            
            # Always try the base font
            font_attempts.append(f"{base_name}.ttf")
            
        # Also try the direct font family name
        font_attempts.insert(0, font_family)
        
        return font_attempts
    
    def create_working_fallback_font(self, font_size):
        """Create a working fallback font that handles size changes properly"""
        try:
            # Try to get any working TrueType font
            working_fonts = ['arial.ttf', 'Arial', 'times.ttf', 'Times New Roman', 'calibri.ttf', 'Calibri']
            for font_name in working_fonts:
                try:
                    font = ImageFont.truetype(font_name, font_size)
                    font.getbbox("Test")  # Verify it works
                    return font
                except:
                    continue
        except Exception as e:
            print(f"Font loading error: {e}")
        
        # Ultimate fallback - create a default font that respects size
        try:
            # Try to load default PIL font
            default_font = ImageFont.load_default()
            # Create a wrapper that scales the font
            return self.create_scaled_default_font(font_size)
        except:
            # Create a completely custom font object
            return self.create_fallback_font(font_size)
    
    def create_scaled_default_font(self, font_size):
        """Create a scaled version of the default font"""
        try:
            # For very small sizes, use default
            if font_size <= 11:
                return ImageFont.load_default()
            else:
                # Try to find a basic system font that works
                basic_fonts = ['arial.ttf', 'Arial', 'DejaVuSans.ttf', 'Liberation Sans']
                for font_name in basic_fonts:
                    try:
                        return ImageFont.truetype(font_name, font_size)
                    except:
                        continue
                # If nothing works, return default
                return ImageFont.load_default()
        except:
            return ImageFont.load_default()
    
    def create_fallback_font(self, font_size):
        """Create a fallback font object that supports basic operations"""
        class FallbackFont:
            def __init__(self, size):
                self.size = size
                self.base_width = max(6, size // 2)  # Scale width with size
                self.base_height = max(8, size)      # Scale height with size
            
            def getsize(self, text):
                return (len(text) * self.base_width, self.base_height)
            
            def getbbox(self, text):
                width = len(text) * self.base_width
                return (0, 0, width, self.base_height)
            
            def getmask(self, text, mode='', *args, **kwargs):
                # Create a simple bitmap for the text
                from PIL import Image
                width = len(text) * self.base_width
                height = self.base_height
                return Image.new('L', (width, height), 255)  # White mask
        
        return FallbackFont(font_size)
    
    def get_text_dimensions(self, draw, text, font):
        """Get text dimensions with multiple fallback methods"""
        try:
            # Modern Pillow method
            bbox = draw.textbbox((0, 0), text, font=font)
            return (bbox[2] - bbox[0], bbox[3] - bbox[1])
        except:
            try:
                # Older Pillow method
                return draw.textsize(text, font=font)
            except:
                try:
                    # Font object method
                    return font.getsize(text)
                except:
                    try:
                        # Font object bbox method
                        bbox = font.getbbox(text)
                        return (bbox[2] - bbox[0], bbox[3] - bbox[1])
                    except:
                        # Ultimate fallback - estimate based on font size
                        font_size = getattr(font, 'size', self.font_size.get())
                        char_width = max(6, font_size * 0.6)  # Approximate character width
                        return (int(len(text) * char_width), font_size)
    
    def draw_text_with_effects(self, image, text, x, y):
        """Draw text with shadow, outline effects, decorations, and rotation"""
        # Convert image to RGBA for transparency support
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        # Check if rotation is needed - use simpler approach if no rotation
        rotation_angle = self.text_rotation.get()
        
        if rotation_angle == 0:
            # Simple approach without rotation
            return self.draw_simple_text_with_effects(image, text, x, y)
        
        # Complex approach with rotation
        # Create a temporary larger image for effects and rotation
        padding = 200  # Increased padding for rotation
        temp_width = image.width + padding * 2
        temp_height = image.height + padding * 2
        
        # Create even larger canvas for rotation to prevent clipping
        diagonal = int((temp_width**2 + temp_height**2)**0.5)
        rot_width = rot_height = diagonal + padding
        temp_image = Image.new('RGBA', (rot_width, rot_height), (0, 0, 0, 0))
        # Paste original image at center
        paste_x = (rot_width - image.width) // 2
        paste_y = (rot_height - image.height) // 2
        temp_image.paste(image, (paste_x, paste_y))
        # Adjust coordinates for centered positioning
        temp_x = x + paste_x
        temp_y = y + paste_y
        
        draw = ImageDraw.Draw(temp_image)
        font = self.get_font()
        
        # Calculate text alignment offset
        text_width, text_height = self.get_text_dimensions(draw, text, font)
        
        # Adjust x position based on alignment
        if self.text_align.get() == "center":
            x_offset = -text_width // 2
        elif self.text_align.get() == "right":
            x_offset = -text_width
        else:  # left alignment
            x_offset = 0
        
        final_x = temp_x + x_offset
        final_y = temp_y
        
        # Create text layer for rotation
        if rotation_angle != 0:
            # Create a separate image for the text
            text_img = Image.new('RGBA', (temp_image.width, temp_image.height), (0, 0, 0, 0))
            text_draw = ImageDraw.Draw(text_img)
        else:
            text_img = temp_image
            text_draw = draw
        
        # Draw shadow on text layer
        if self.text_shadow.get():
            shadow_x = final_x + self.shadow_offset_x.get()
            shadow_y = final_y + self.shadow_offset_y.get()
            
            # Create shadow on separate layer
            shadow_image = Image.new('RGBA', (text_img.width, text_img.height), (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow_image)
            
            # Ensure shadow color has proper alpha
            shadow_color = self.shadow_color
            if isinstance(shadow_color, str):
                # Convert hex color to RGBA tuple
                if shadow_color.startswith('#'):
                    shadow_color = shadow_color[1:]
                    if len(shadow_color) == 6:
                        r, g, b = int(shadow_color[0:2], 16), int(shadow_color[2:4], 16), int(shadow_color[4:6], 16)
                        shadow_color = (r, g, b, 200)  # Add some transparency
            
            shadow_draw.text((shadow_x, shadow_y), text, font=font, fill=shadow_color)
            
            # Apply blur if specified
            if self.shadow_blur.get() > 0:
                try:
                    shadow_image = shadow_image.filter(ImageFilter.GaussianBlur(self.shadow_blur.get()))
                except:
                    pass  # Skip blur if it fails
            
            # Composite shadow
            text_img = Image.alpha_composite(text_img, shadow_image)
            text_draw = ImageDraw.Draw(text_img)
        
        # Draw outline on text layer
        if self.text_outline.get():
            outline_width = self.outline_width.get()
            # Draw outline by drawing text multiple times around the main position
            for dx in range(-outline_width, outline_width + 1):
                for dy in range(-outline_width, outline_width + 1):
                    if dx != 0 or dy != 0:  # Don't draw at center position
                        text_draw.text((final_x + dx, final_y + dy), text, 
                                     font=font, fill=self.outline_color)
        
        # Draw main text on text layer
        text_draw.text((final_x, final_y), text, font=font, fill=self.font_color)
        
        # Draw text decorations
        if self.text_underline.get() or self.text_strikethrough.get():
            line_width = max(1, self.font_size.get() // 20)  # Scale line width with font size
            
            if self.text_underline.get():
                # Draw underline
                underline_y = final_y + text_height + line_width
                text_draw.rectangle([
                    final_x, underline_y,
                    final_x + text_width, underline_y + line_width
                ], fill=self.font_color)
            
            if self.text_strikethrough.get():
                # Draw strikethrough
                strike_y = final_y + text_height // 2
                text_draw.rectangle([
                    final_x, strike_y,
                    final_x + text_width, strike_y + line_width
                ], fill=self.font_color)
        
        # Apply rotation if needed
        if rotation_angle != 0:
            # Rotate the text layer
            text_img = text_img.rotate(-rotation_angle, expand=False, fillcolor=(0, 0, 0, 0))
            # Composite rotated text onto main image
            temp_image = Image.alpha_composite(temp_image, text_img)
        
        # Convert back and crop to original size
        if rotation_angle != 0:
            # Crop back to original size considering rotation padding
            crop_x = (temp_image.width - image.width) // 2
            crop_y = (temp_image.height - image.height) // 2
            result_image = temp_image.crop((crop_x, crop_y, 
                                          crop_x + image.width, crop_y + image.height))
        else:
            result_image = temp_image.crop((padding, padding, temp_width - padding, temp_height - padding))
        
        return result_image.convert('RGB')
    
    def draw_simple_text_with_effects(self, image, text, x, y):
        """Draw text with effects without rotation (simpler, more reliable approach)"""
        # Create a temporary larger image for effects
        padding = 100
        temp_width = image.width + padding * 2
        temp_height = image.height + padding * 2
        temp_image = Image.new('RGBA', (temp_width, temp_height), (0, 0, 0, 0))
        
        # Paste original image onto temporary image
        temp_image.paste(image, (padding, padding))
        draw = ImageDraw.Draw(temp_image)
        
        font = self.get_font()
        
        # Calculate text alignment offset with better fallback handling
        text_width, text_height = self.get_text_dimensions(draw, text, font)
        
        # Adjust x position based on alignment
        if self.text_align.get() == "center":
            x_offset = -text_width // 2
        elif self.text_align.get() == "right":
            x_offset = -text_width
        else:  # left alignment
            x_offset = 0
        
        # Adjust coordinates for padding and alignment
        temp_x = x + padding + x_offset
        temp_y = y + padding
        
        # Draw shadow
        if self.text_shadow.get():
            shadow_x = temp_x + self.shadow_offset_x.get()
            shadow_y = temp_y + self.shadow_offset_y.get()
            
            # Simple shadow drawing
            try:
                draw.text((shadow_x, shadow_y), text, font=font, fill=self.shadow_color)
            except:
                # Fallback shadow color
                draw.text((shadow_x, shadow_y), text, font=font, fill='gray')
        
        # Draw outline
        if self.text_outline.get():
            outline_width = self.outline_width.get()
            # Draw outline by drawing text multiple times around the main position
            for dx in range(-outline_width, outline_width + 1):
                for dy in range(-outline_width, outline_width + 1):
                    if dx != 0 or dy != 0:  # Don't draw at center position
                        try:
                            draw.text((temp_x + dx, temp_y + dy), text, 
                                    font=font, fill=self.outline_color)
                        except:
                            # Fallback outline color
                            draw.text((temp_x + dx, temp_y + dy), text, 
                                    font=font, fill='white')
        
        # Draw main text
        try:
            draw.text((temp_x, temp_y), text, font=font, fill=self.font_color)
        except:
            # Fallback text color
            draw.text((temp_x, temp_y), text, font=font, fill='black')
        
        # Draw text decorations
        if self.text_underline.get() or self.text_strikethrough.get():
            line_width = max(1, self.font_size.get() // 20)  # Scale line width with font size
            
            if self.text_underline.get():
                # Draw underline
                underline_y = temp_y + text_height + line_width
                draw.rectangle([
                    temp_x, underline_y,
                    temp_x + text_width, underline_y + line_width
                ], fill=self.font_color)
            
            if self.text_strikethrough.get():
                # Draw strikethrough
                strike_y = temp_y + text_height // 2
                draw.rectangle([
                    temp_x, strike_y,
                    temp_x + text_width, strike_y + line_width
                ], fill=self.font_color)
        
        # Convert back and crop to original size
        result_image = temp_image.crop((padding, padding, temp_width - padding, temp_height - padding))
        
        return result_image.convert('RGB')
    
    def update_preview(self):
        """Update the preview canvas"""
        if not self.template_image:
            return
        
        try:
            # Create preview image
            preview_image = self.template_image.copy()
            sample_text = "Sample Name"
            
            # Apply text with effects
            preview_image = self.draw_text_with_effects(
                preview_image, sample_text, 
                self.text_x.get(), self.text_y.get()
            )
            
            # Scale for display
            display_width = int(preview_image.width * self.canvas_scale)
            display_height = int(preview_image.height * self.canvas_scale)
            
            if abs(self.canvas_scale - 1.0) > 0.01:  # Avoid floating point comparison
                display_image = preview_image.resize((display_width, display_height), Image.Resampling.LANCZOS)
            else:
                display_image = preview_image
            
            # Convert to PhotoImage
            self.preview_photo = ImageTk.PhotoImage(display_image)
            
            # Update canvas
            self.preview_canvas.delete("all")
            self.preview_canvas.create_image(0, 0, anchor=tk.NW, image=self.preview_photo)
            self.preview_canvas.configure(scrollregion=self.preview_canvas.bbox("all"))
            
        except Exception as e:
            print(f"Preview error: {e}")
    
    def preview_single_badge(self):
        """Preview a single badge with first name"""
        if not self.names_list:
            messagebox.showwarning("Warning", "Please load names first!")
            return
        
        if not self.template_image:
            messagebox.showwarning("Warning", "Please select a template first!")
            return
        
        try:
            name = self.names_list[0]
            preview_image = self.template_image.copy()
            
            result_image = self.draw_text_with_effects(
                preview_image, name, 
                self.text_x.get(), self.text_y.get()
            )
            
            self.show_preview_window(result_image, name)
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to create preview: {str(e)}")
    
    def show_preview_window(self, image, name):
        """Show preview in a new window"""
        preview_window = tk.Toplevel(self.root)
        preview_window.title(f"Preview: {name}")
        preview_window.configure(bg='#2c3e50')
        
        # Convert to PhotoImage
        photo = ImageTk.PhotoImage(image)
        
        # Create label with image
        label = tk.Label(preview_window, image=photo, bg='#2c3e50')
        label.image = photo  # Keep reference
        label.pack(padx=20, pady=20)
        
        # Center window
        preview_window.geometry(f"{image.width + 40}x{image.height + 60}")
        preview_window.transient(self.root)
        preview_window.grab_set()
    
    def generate_all_badges(self):
        """Generate all badges with event folder organization"""
        if not self.names_list:
            messagebox.showwarning("Warning", "Please load names first!")
            return
        
        if not self.template_image:
            messagebox.showwarning("Warning", "Please select a template first!")
            return
        
        if not self.event_name.get().strip():
            messagebox.showwarning("Warning", "Please enter an event name!")
            return
        
        # Create event folder
        event_folder = os.path.join(self.output_dir.get(), self.event_name.get().strip())
        os.makedirs(event_folder, exist_ok=True)
        
        # Progress dialog
        progress_window = self.create_progress_window()
        
        def generate_in_thread():
            try:
                total_names = len(self.names_list)
                
                for i, name in enumerate(self.names_list):
                    # Update progress
                    progress = (i + 1) / total_names * 100
                    progress_window.children['!progressbar']['value'] = progress
                    progress_window.children['!label2'].config(
                        text=f"Generating badge {i + 1} of {total_names}: {name}")
                    progress_window.update()
                    
                    # Generate badge
                    badge_image = self.template_image.copy()
                    result_image = self.draw_text_with_effects(
                        badge_image, str(name),
                        self.text_x.get(), self.text_y.get()
                    )
                    
                    # Create safe filename
                    safe_name = "".join(c for c in str(name) if c.isalnum() or c in (' ', '_', '-')).strip()
                    safe_name = safe_name.replace(' ', '_')
                    filename = f"{safe_name}_badge.png"
                    filepath = os.path.join(event_folder, filename)
                    
                    # Save badge
                    result_image.save(filepath, 'PNG')
                
                progress_window.destroy()
                
                success_msg = (f"🎉 Success!\n\n"
                             f"Generated {total_names} badges successfully!\n"
                             f"Event: {self.event_name.get()}\n"
                             f"Saved to: {event_folder}\n\n"
                             f"Would you like to open the output folder?")
                
                if messagebox.askyesno("Success", success_msg):
                    os.startfile(event_folder)
                
            except Exception as e:
                progress_window.destroy()
                messagebox.showerror("Error", f"Failed to generate badges: {str(e)}")
        
        # Start generation in thread
        threading.Thread(target=generate_in_thread, daemon=True).start()
    
    def create_progress_window(self):
        """Create progress dialog"""
        progress_window = tk.Toplevel(self.root)
        progress_window.title("Generating Badges...")
        progress_window.geometry("450x120")
        progress_window.configure(bg='#2c3e50')
        progress_window.transient(self.root)
        progress_window.grab_set()
        
        # Center window
        progress_window.geometry("+{}+{}".format(
            self.root.winfo_rootx() + 200,
            self.root.winfo_rooty() + 200
        ))
        
        # Title
        title_label = tk.Label(progress_window, text="🚀 Generating Badges...", 
                              font=('Arial', 12, 'bold'), fg='white', bg='#2c3e50')
        title_label.pack(pady=10)
        
        # Progress bar
        progress_bar = ttk.Progressbar(progress_window, length=400, mode='determinate')
        progress_bar.pack(pady=10)
        
        # Status label
        status_label = tk.Label(progress_window, text="Starting...", 
                               font=('Arial', 10), fg='white', bg='#2c3e50')
        status_label.pack()
        
        return progress_window
    
    def save_configuration(self):
        """Save current configuration to JSON file"""
        config = {
            'template_path': self.template_path.get(),
            'names_file_path': self.names_file_path.get(),
            'output_dir': self.output_dir.get(),
            'event_name': self.event_name.get(),
            'font_family': self.font_family.get(),
            'font_size': self.font_size.get(),
            'font_style': self.font_style.get(),
            'font_weight': self.font_weight.get(),
            'font_color': self.font_color,
            'text_x': self.text_x.get(),
            'text_y': self.text_y.get(),
            'text_align': self.text_align.get(),
            'text_shadow': self.text_shadow.get(),
            'shadow_color': self.shadow_color,
            'shadow_offset_x': self.shadow_offset_x.get(),
            'shadow_offset_y': self.shadow_offset_y.get(),
            'shadow_blur': self.shadow_blur.get(),
            'text_outline': self.text_outline.get(),
            'outline_color': self.outline_color,
            'outline_width': self.outline_width.get(),
            'position_preset': self.position_preset.get(),
            'text_underline': self.text_underline.get(),
            'text_strikethrough': self.text_strikethrough.get(),
            'text_rotation': self.text_rotation.get()
        }
        
        file_path = filedialog.asksaveasfilename(
            title="Save Configuration",
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'w') as f:
                    json.dump(config, f, indent=2)
                messagebox.showinfo("Success", "✅ Configuration saved successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save configuration: {str(e)}")
    
    def load_configuration(self):
        """Load configuration from JSON file"""
        file_path = filedialog.askopenfilename(
            title="Load Configuration",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, 'r') as f:
                    config = json.load(f)
                
                # Apply configuration
                for key, value in config.items():
                    if hasattr(self, key):
                        attr = getattr(self, key)
                        if hasattr(attr, 'set'):
                            attr.set(value)
                        else:
                            setattr(self, key, value)
                
                # Update UI colors
                self.color_button.config(bg=self.font_color)
                self.shadow_color_button.config(bg=self.shadow_color)
                self.outline_color_button.config(bg=self.outline_color)
                
                # Reload files
                if self.template_path.get():
                    self.load_template()
                if self.names_file_path.get():
                    self.load_names()
                
                messagebox.showinfo("Success", "✅ Configuration loaded successfully!")
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load configuration: {str(e)}")
    
    def run(self):
        """Run the application"""
        # Show welcome message
        welcome_msg = (
            "🎫 Welcome to Professional Badge Generator!\n\n"
            "Quick Start Guide:\n"
            "1️⃣ Enter your event name\n"
            "2️⃣ Select your badge template image\n"
            "3️⃣ Load your names list (TXT/CSV/Excel)\n"
            "4️⃣ Customize text style and position\n"
            "5️⃣ Click 'Generate All Badges' to create them!\n\n"
            "✨ New Features:\n"
            "• 25+ professional fonts available\n"
            "• Text decorations (underline, strikethrough)\n"
            "• Text rotation (-180° to +180°)\n"
            "• Click-to-position text placement\n"
            "• Advanced text effects (shadow, outline, blur)\n"
            "• Font sizes up to 300px\n"
            "• Event-based folder organization\n"
            "• Live preview with zoom controls\n"
            "• Save/Load configurations\n\n"
            "Ready to create amazing badges? 🚀"
        )
        
        messagebox.showinfo("Welcome", welcome_msg)
        
        self.root.mainloop()

if __name__ == "__main__":
    app = ProfessionalBadgeGenerator()
    app.run()
