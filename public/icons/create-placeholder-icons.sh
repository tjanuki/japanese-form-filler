#!/bin/bash

# Create a simple 1x1 green PNG in base64
# This is a minimal PNG file (green pixel)
GREEN_PNG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Create 16x16 icon
echo $GREEN_PNG | base64 -d > temp.png
sips -z 16 16 temp.png --out icon16.png 2>/dev/null

# Create 48x48 icon
sips -z 48 48 temp.png --out icon48.png 2>/dev/null

# Create 128x128 icon
sips -z 128 128 temp.png --out icon128.png 2>/dev/null

# Clean up
rm temp.png

echo "Placeholder icons created successfully!"
