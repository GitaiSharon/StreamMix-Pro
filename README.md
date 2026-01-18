# StreamMix Pro 🎬

<div align="center">

![StreamMix Pro Logo](https://img.shields.io/badge/StreamMix-Pro-6366f1?style=for-the-badge&logo=video&logoColor=white)

**Professional Screen Recording with Studio-Quality Features**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Keyboard Shortcuts](#%EF%B8%8F-keyboard-shortcuts)

</div>

---

## 📖 Overview

StreamMix Pro is a powerful, browser-based screen recording application that brings professional-grade features to your fingertips. Record your screen, webcam, and audio with studio-quality controls, real-time editing, and advanced trimming capabilities—all without installing any software.

### Why StreamMix Pro?

- 🎯 **Zero Installation** - Runs entirely in your browser
- 🎨 **Modern UI** - Beautiful, responsive design with glassmorphism effects
- ⚡ **Performance Mode** - Choose between native recording or studio compositing
- 🎬 **Live Editing** - Draw, annotate, and use teleprompter during recording
- ✂️ **Smart Trimming** - Export exactly what you need with frame-accurate trim
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile devices
- ⌨️ **Keyboard Shortcuts** - Fast workflow with hotkeys
- 💾 **Multiple Formats** - Support for MP4, WebM (VP9, VP8) with optimized seeking

---

## ✨ Features

### 🎥 Recording Modes

#### Performance Mode (Native)
- Direct screen capture without canvas processing
- Minimal CPU usage
- Perfect for long recordings or lower-end devices
- Maintains original quality

#### Studio Mode (Advanced)
- Canvas-based compositing
- Real-time webcam overlay with drag-and-drop positioning
- Drawing and annotation tools
- Teleprompter overlay
- Custom visual effects

### 🎛️ Recording Controls

- **Webcam Integration** - Picture-in-picture webcam overlay
- **Audio Mixing** - Separate controls for microphone and system audio
- **Real-time Drawing** - Annotate your screen during recording
- **Teleprompter** - On-screen script overlay with adjustable positioning
- **Countdown Timer** - Configurable 3-5 second countdown before recording
- **Pause/Resume** - Take breaks without stopping your recording

### 🎬 Post-Recording Features

#### Smart Video Editor
- **Timeline Trimming** - Visual scrub bar with precise start/end points
- **Live Preview** - Preview your trimmed selection before saving
- **Dual Save Options**:
  - Save Original - Keep the full recording
  - Save Trimmed - Export only the selected portion
- **Format Preservation** - Maintains video quality and format

#### Video Optimization
- **Seekable Videos** - 100ms timeslice for frame-accurate seeking
- **Multiple Codecs** - MP4 (H.264), WebM (VP9, VP8)
- **Quality Presets** - 720p, 1080p, 4K recording options
- **Frame Rate Control** - 30, 60, or 120 FPS
- **Smart Bitrate** - Automatic bitrate adjustment per quality level

### 🎨 User Interface

- **Glassmorphism Design** - Modern, translucent interface
- **Dark Mode** - Easy on the eyes for long sessions
- **Responsive Layout** - Adapts to any screen size
- **Keyboard Shortcuts** - Speed up your workflow
- **Horizontal Modal** - Video on left, controls on right (no scrolling!)
- **Smooth Animations** - Polished transitions and hover effects

### 📱 Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| Desktop (1920×1080+) | ✅ Full | Optimal experience |
| Laptop (1366×768+) | ✅ Full | Responsive layout |
| Tablet (768×1024) | ✅ Full | Touch-optimized |
| Mobile (375×667+) | ✅ Basic | Vertical layout |

---

## 🚀 Demo

### Recording Flow
```
1. Select Recording Mode (Performance/Studio)
2. Configure quality (720p/1080p/4K) and format (MP4/WebM)
3. Enable webcam, audio as needed
4. Click Record → Countdown → Recording starts
5. Use controls: Pause, Draw, Teleprompter
6. Stop recording → Preview with trim editor
7. Save Original or Trimmed version
```

### Sample Screenshots

**Main Interface**
- Clean dashboard with ambient background glow
- Floating control dock with recording timer
- Real-time preview canvas

**Preview Modal**
- Horizontal layout: video (62%) + controls (38%)
- Timeline scrubber with visual trim indicators
- Save options and project naming

---

## 🛠️ Installation

### Option 1: Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/GitaiSharon/StreamMix-Pro.git

# Navigate to project directory
cd StreamMix-Pro

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

### Option 2: Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

### System Requirements

- Modern browser with MediaRecorder API support:
  - Chrome 49+
  - Firefox 29+
  - Edge 79+
  - Safari 14.1+
- 4GB RAM minimum (8GB recommended for 4K)
- Stable internet connection (for CDN resources)

---

## 📘 Usage

### Basic Recording

1. **Choose Quality**: Select 720p, 1080p, or 4K
2. **Select Format**: MP4 (best seeking) or WebM (smaller file)
3. **Enable Sources**:
   - Webcam (Picture-in-Picture)
   - Microphone (with gain control)
   - System Audio (screen audio)
4. **Click Record**: 3-second countdown begins
5. **Record Your Content**: Use pause, draw, teleprompter as needed
6. **Stop**: Click stop when finished

### Advanced Features

#### Drawing Mode
- Enable during recording
- Draw directly on screen
- Great for emphasis and annotations

#### Teleprompter
- Click teleprompter icon
- Enter your script
- Drag to position on screen
- Adjust scroll speed

#### Webcam Overlay
- Enable webcam in studio mode
- Drag to reposition
- Resize from corner
- Mute video while keeping audio

#### Trimming
1. After recording, use timeline scrubber
2. Click "Set Start" at desired beginning
3. Seek to end, click "Set End"
4. Preview selection
5. Save Trimmed

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + R` | Start/Stop Recording |
| `Space` | Pause/Resume (during recording) |

*More shortcuts coming soon!*

---

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Lucide-style custom SVG
- **Storage**: IndexedDB for recording chunks
- **APIs**: MediaRecorder, getUserMedia, getDisplayMedia

### Project Structure

```
streammix-pro/
├── App.tsx                 # Main application component
├── hooks/
│   └── useRecorder.ts      # Recording logic hook
├── components/
│   ├── AudioVisualizer.tsx # Audio level visualization
│   └── FloatingControls.tsx # Recording control window
├── types.ts                # TypeScript definitions
├── index.tsx               # Entry point
├── index.html              # HTML template
├── index.css               # Global styles
└── package.json            # Dependencies
```

### Key Components

#### `useRecorder` Hook
- Handles MediaRecorder lifecycle
- Manages audio/video streams
- Canvas compositing for studio mode
- IndexedDB chunk storage
- Trim and export functionality

#### `App.tsx`
- Main UI layout
- Settings management
- Preview modal
- Timeline editor

#### `FloatingControls`
- Overlay control panel during recording
- Pause/Resume/Stop buttons
- Audio visualizer

---

## 🎨 Customization

### Changing Colors

Edit `index.html` Tailwind configuration:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#0ea5e9', // Your primary color
          600: '#0284c7',
        }
      }
    }
  }
}
```

### Adding Custom Animations

```javascript
animation: {
  'custom-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

---

## 🐛 Troubleshooting

### Video Preview Not Showing
- **Chrome**: Ensure video elements are in DOM (already fixed)
- **Firefox**: Clear browser cache
- **Safari**: Update to latest version

### Recording Not Starting
- Check browser permissions for screen/audio
- Ensure MediaRecorder API is supported
- Try different format (MP4 vs WebM)

### Unable to Seek in Saved Video
- Use MP4 format (better seeking support)
- Ensure file is fully downloaded
- Try different video player

### Performance Issues
- Switch to Performance mode (Native)
- Lower recording quality (720p)
- Close other applications
- Disable webcam overlay

---

## 🔒 Privacy & Security

- **No Server Upload**: All recording happens locally in your browser
- **No Tracking**: Zero analytics or user tracking
- **No External APIs**: Everything runs client-side
- **IndexedDB Storage**: Recording chunks stored locally
- **Auto-Cleanup**: Chunks cleared after save/discard

---

## 🚧 Roadmap

### Planned Features
- [ ] Cloud export (Google Drive, Dropbox)
- [ ] More keyboard shortcuts
- [ ] Custom watermarks
- [ ] Background blur for webcam
- [ ] Virtual backgrounds
- [ ] Auto-generated captions
- [ ] Multi-track audio mixer
- [ ] Scheduled recordings
- [ ] Browser extension

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

```bash
# Install dependencies
npm install

# Run TypeScript check
npx tsc --noEmit

# Start dev server
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite for blazing-fast build tooling
- Tailwind CSS for utility-first styling
- MediaRecorder API for making this possible

---

## 📧 Contact

**Sharon Gitai** - [@GitaiSharon](https://github.com/GitaiSharon)

Project Link: [https://github.com/GitaiSharon/StreamMix-Pro](https://github.com/GitaiSharon/StreamMix-Pro)

---

<div align="center">

**Made with ❤️ and ☕**

⭐ Star this repo if you find it useful!

</div>
