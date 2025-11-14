# Extension Icons

This directory should contain the following icon files:

- `icon16.png` - 16x16 pixels (toolbar icon, small)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store, installation)

## Creating Icons

You can create icons using any graphics software (Photoshop, GIMP, Figma, etc.) or use the provided SVG template.

### Quick Icon Creation

For development/testing purposes, you can create simple placeholder icons using online tools or image editors.

### Icon Design Suggestions

- Use Japanese-themed imagery (e.g., Japanese characters 「日」, form/document icon)
- Primary color: Green (#4CAF50) to match the extension theme
- Keep the design simple and recognizable at small sizes
- Ensure the icon is visible on both light and dark backgrounds

### Temporary Placeholder

If you need temporary icons for testing, you can use any square image and resize it to the required dimensions.

## Converting SVG to PNG

If you have the `icon-template.svg` file, you can convert it to PNG using:

```bash
# Using ImageMagick
convert -background none icon-template.svg -resize 16x16 icon16.png
convert -background none icon-template.svg -resize 48x48 icon48.png
convert -background none icon-template.svg -resize 128x128 icon128.png

# Or use an online SVG to PNG converter
```
