# Chrome To-Do Extension

A beautiful and minimalist Chrome extension that replaces the new tab page with a clean dashboard featuring a digital clock and a to-do list.

## Features

- **Digital Clock**: Displays the current time with a smooth animation effect
- **To-Do List**: Simple and elegant to-do list with drag-and-drop functionality
- **Background Images**: Beautiful background images from Unsplash that change daily
- **Limit of 8 Tasks**: Keeps your to-do list focused and manageable

## Technical Details

- The extension uses Chrome's storage API to persist to-do items across sessions
- Random background images are fetched from Unsplash and cached for 24 hours
- Only 24 API calls are made to Unsplash per day, regardless of how many tabs are opened

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension will now replace your new tab page

## Development

- `newtab.html` - The main HTML structure
- `style.css` - All styling and animations
- `script.js` - JavaScript functionality including clock, to-do list, and background images
- `manifest.json` - Extension configuration 