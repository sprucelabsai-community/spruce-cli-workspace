#!/bin/bash

# Font Bundler Script
# Enables support for Bun --compile and --minify flags with the `cfonts` module

# Function to generate FONT_MAP from JSON files
generate_font_map() {
    local dir="$1"
    local fonts_dir="$dir/cfonts/fonts"
    local font_map="const FONT_MAP = {\n"

    for json_file in "$fonts_dir"/*.json; do
        local font_name=$(basename "$json_file" .json)
        font_map+="  '${font_name}': require('../fonts/${font_name}.json'),\n"
    done

    font_map+="};"
    echo -e "$font_map"
}

validate_directory() {
    local dir="$1"
    
    # Check if node_modules directory exists
    if [ ! -d "$dir" ]; then
        echo "Error: The specified node_modules directory does not exist: $dir"
        exit 1
    fi

    # Check if cfonts directory exists
    if [ ! -d "$dir/cfonts" ]; then
        echo "Error: cfonts module not found in $dir"
        exit 1
    fi

    # Check if fonts directory exists
    if [ ! -d "$dir/cfonts/fonts" ]; then
        echo "Error: fonts directory not found in cfonts module"
        exit 1
    fi

    # Check if GetFont.js exists
    if [ ! -f "$dir/cfonts/lib/GetFont.js" ]; then
        echo "Error: GetFont.js not found in cfonts module"
        exit 1
    fi

    # Check if there are any JSON files in the fonts directory
    if [ -z "$(ls -A "$dir/cfonts/fonts/"*.json 2>/dev/null)" ]; then
        echo "Error: No JSON files found in cfonts/fonts directory"
        exit 1
    fi

    echo "Directory validation successful"
}


# Function to update GetFont.js with FONT_MAP
update_getfont_js() {
    local dir="$1"
    local getfont_js="$dir/cfonts/lib/GetFont.js"
    local font_map="$2"
    local marker="// FONT_MAP_INLINE"

    # Check if FONT_MAP has already been added
    if grep -q "$marker" "$getfont_js"; then
        echo "FONT_MAP already exists in GetFont.js. Skipping FONT_MAP addition."
    else
        # Create a backup of the original file
        cp "$getfont_js" "${getfont_js}.bak"

        # Append FONT_MAP to GetFont.js
        echo -e "\n$marker" >> "$getfont_js"
        echo "$font_map" >> "$getfont_js"

        echo "Successfully added FONT_MAP to GetFont.js."
    fi

    # Check if FONTFACE line has already been modified
    if grep -q "let FONTFACE = FONT_MAP\[font\] ||" "$getfont_js"; then
        echo "FONTFACE line has already been modified. Skipping replacement."
    else
        # Replace the FONTFACE line
        sed -i.bak 's/let FONTFACE = /let FONTFACE = FONT_MAP[font] || /' "$getfont_js"

        if [ $? -eq 0 ]; then
            echo "Successfully replaced FONTFACE line in GetFont.js."
        else
            echo "Error: Failed to replace FONTFACE line in GetFont.js."
            exit 1
        fi
    fi
}


# Set default value for NODE_MODULES_DIR
NODE_MODULES_DIR="./node_modules"

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --nodeModulesDir) NODE_MODULES_DIR="$2"; shift ;;
        -h|--help) usage ;;
        *) echo "Unknown parameter: $1"; usage ;;
    esac
    shift
done

echo "Node modules directory: $NODE_MODULES_DIR"

# Validate the node_modules directory
validate_directory "$NODE_MODULES_DIR"

# Generate FONT_MAP
FONT_MAP=$(generate_font_map "$NODE_MODULES_DIR")

echo "FONT_MAP generated successfully."

# Update GetFont.js with FONT_MAP
update_getfont_js "$NODE_MODULES_DIR" "$FONT_MAP"