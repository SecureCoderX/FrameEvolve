# FrameEvolve
=======
# 🎥 Frame Evolve

<div align="center">

**Professional AI-Powered Video Upscaler & Enhancer**

*Transform your videos with cutting-edge enhancement technology*

![Frame Evolve Logo](https://img.shields.io/badge/Frame%20Evolve-v1.0.0-blue?style=for-the-badge&logo=electron)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=flat-square&logo=electron)](https://electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Required-007808?style=flat-square&logo=ffmpeg)](https://ffmpeg.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Development](#-development) • [Disclaimer](#-disclaimer)

</div>

---

## ⚠️ Disclaimer

**Frame Evolve is intended for personal use only.** This software is provided for educational and personal video enhancement purposes. Users are responsible for ensuring they have the appropriate rights to process any video content and must comply with all applicable copyright laws and regulations in their jurisdiction.

**Not for commercial use without proper licensing.**

---

## 🌟 Overview

Frame Evolve is a professional-grade desktop application that transforms your videos using advanced AI-powered enhancement algorithms. Built with modern web technologies and powered by FFmpeg, it delivers studio-quality results with an intuitive, sleek interface.

### ✨ Why Frame Evolve?

- 🎯 **Professional Quality**: Cinema-grade enhancement algorithms
- ⚡ **Smart Processing**: Intelligent resource management prevents system overload
- 🎨 **Modern Interface**: Beautiful, frameless design with real-time preview
- 🔒 **Secure**: Context-isolated architecture with robust error handling
- 🌍 **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux
- 🏠 **Personal Use**: Perfect for enhancing your home videos and personal content

---

## 🚀 Features

### 🎥 Video Enhancement
- **Multi-Scale Upscaling**: 2x, 3x, 4x with automatic optimization
- **Enhancement Modes**: Sharp, Smooth, Anime, and Standard algorithms
- **Quality Presets**: High, Ultra, and Lossless output options
- **Noise Reduction**: Adjustable strength (0-100%) for cleaner results
- **Smart Resolution**: Automatic limiting to prevent system crashes

### 🎛️ Processing Engine
- **Real-Time Progress**: Live FFmpeg feedback with FPS and speed metrics
- **Memory Management**: Buffer limits and thread optimization
- **Graceful Cancellation**: Stop processing at any time
- **Format Support**: MP4, AVI, MOV, MKV, WMV, FLV, WebM, M4V
- **Metadata Extraction**: Detailed video information display

### 🎨 User Experience
- **Drag & Drop**: Intuitive file upload interface
- **Live Preview**: Real-time video playback with metadata
- **Smart Recommendations**: Processing suggestions based on input
- **Toast Notifications**: Professional user feedback system
- **Settings Persistence**: Remembers your preferences

### 🏗️ Technical Excellence
- **Modular Architecture**: Clean separation of concerns
- **Event-Driven**: Loosely coupled components
- **Error Boundaries**: Comprehensive error handling
- **Resource Optimization**: Prevents memory leaks and crashes
- **Security First**: No direct Node.js API exposure

---

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, or Ubuntu 18.04+
- **RAM**: 4 GB (8 GB recommended)
- **Storage**: 2 GB free space
- **CPU**: Dual-core processor (Quad-core recommended)

### Required Dependencies
- **Node.js**: 18.0.0 or higher
- **FFmpeg**: Latest stable version
- **NPM**: 8.0.0 or higher

---

## 🛠️ Installation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/frame-evolve.git
cd frame-evolve

# Install dependencies
npm install

# Install FFmpeg (platform-specific)
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS (with Homebrew)
brew install ffmpeg

# Windows - Download from https://ffmpeg.org/download.html

# Start the application
npm run dev
```

### FFmpeg Installation Guide

<details>
<summary>🐧 Linux (Ubuntu/Debian)</summary>

```bash
sudo apt update
sudo apt install ffmpeg
# Verify installation
ffmpeg -version
```
</details>

<details>
<summary>🍎 macOS</summary>

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg
brew install ffmpeg

# Verify installation
ffmpeg -version
```
</details>

<details>
<summary>🪟 Windows</summary>

1. Download FFmpeg from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH
4. Restart command prompt and verify: `ffmpeg -version`
</details>

### Alternative Package Managers

<details>
<summary>📦 Using Yarn or PNPM</summary>

#### Using Yarn
```bash
yarn install
yarn dev
```

#### Using PNPM
```bash
pnpm install
pnpm dev
```
</details>

---

## 🎯 Usage

### Basic Workflow

1. **Launch Frame Evolve**
   ```bash
   npm run dev
   ```

2. **Load Your Video**
   - Drag & drop a video file onto the interface
   - Or click "Browse Files" to select manually
   - Supported formats: MP4, AVI, MOV, MKV, WMV, FLV, WebM, M4V

3. **Configure Enhancement Settings**
   ```
   Scale Factor: Choose 2x, 3x, or 4x upscaling
   Enhancement Mode: Select Sharp, Smooth, Anime, or Standard
   Quality: Pick High, Ultra, or Lossless output
   Noise Reduction: Adjust from 0-100%
   ```

4. **Process Video**
   - Click "Start Enhancement"
   - Choose output location and filename
   - Monitor real-time progress with FPS and speed metrics
   - Cancel anytime if needed

5. **Enjoy Enhanced Results**
   - Enhanced video saved to chosen location
   - Compare with original for quality improvements

### 🎛️ Enhancement Modes Explained

| Mode | Best For | Algorithm | Processing Speed |
|------|----------|-----------|------------------|
| **Sharp** | General content, text, graphics | Lanczos + Unsharp | Fast |
| **Smooth** | Natural scenes, faces, landscapes | Bicubic + Blur | Medium |
| **Anime** | Animation, cartoons, drawings | Spline + Optimized | Fast |
| **Standard** | Balanced enhancement | Bicubic | Fastest |

### 📊 Quality Settings

| Setting | CRF Value | Preset | File Size | Best For |
|---------|-----------|--------|-----------|----------|
| **High** | 23 | Medium | Moderate | Daily use, sharing |
| **Ultra** | 20 | Slow | Large | Professional work |
| **Lossless** | 0 | Very Slow | Very Large | Archival, editing |

### 💡 Pro Tips

- **Start with 2x scaling** for testing, then increase if needed
- **Use High quality** for most personal videos (faster processing)
- **Sharp mode** works best for phone videos and screen recordings
- **Anime mode** is perfect for cartoons and animated content
- **Monitor system resources** during processing to avoid overload

---

## 🎨 Interface Overview

### Main Interface Features
- **Clean Design**: Modern, distraction-free interface
- **Dark Theme**: Easy on the eyes during long processing sessions
- **Drag & Drop Zone**: Simply drop your video files to begin
- **Real-time Preview**: See your video with metadata before processing
- **Progress Tracking**: Detailed progress with time estimates and FPS

### Navigation Tabs
- **Enhance**: Main video processing interface
- **Settings**: Configure default preferences
- **About**: Application information and system details

### Processing Feedback
- **Smart Warnings**: Alerts for potentially resource-intensive operations
- **Progress Bar**: Visual progress with percentage completion
- **Live Metrics**: Real-time FPS, processing speed, and time remaining
- **File Information**: Detailed metadata including resolution, duration, codec

---

## 🏗️ Development

### Project Structure

```
frame-evolve/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── managers/         # Window, Menu, IPC managers
│   │   ├── services/         # Video processing, file handling
│   │   ├── config/           # Configuration management
│   │   └── preload/          # Secure bridge scripts
│   └── renderer/             # Frontend application
│       ├── js/               # Application logic
│       │   ├── core/         # Main app controller
│       │   ├── components/   # UI components
│       │   └── utils/        # Utility functions
│       ├── styles/           # CSS styling
│       └── assets/           # Static resources
├── assets/                   # Build assets and icons
├── docs/                     # Documentation
└── tests/                    # Test suites
```

### Development Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS  
npm run build:linux  # Linux

# Code quality
npm run lint         # ESLint
npm run format       # Prettier
npm test            # Jest tests
```

### Architecture Highlights

- **Main Process**: Handles system integration, file I/O, and video processing
- **Renderer Process**: Manages UI, user interactions, and real-time updates
- **IPC Communication**: Secure bridge between main and renderer processes
- **Service Layer**: Encapsulates business logic and external integrations
- **Component System**: Modular, reusable UI components
- **Configuration Management**: File-based settings with automatic persistence

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary>❌ FFmpeg not found</summary>

**Problem**: Error message about FFmpeg not being found

**Solutions**:
- Ensure FFmpeg is installed (see installation guide above)
- Check that FFmpeg is in your system PATH
- Restart your terminal/command prompt after installation
- On Windows, verify PATH environment variable includes FFmpeg bin directory
</details>

<details>
<summary>⚡ Processing too slow</summary>

**Problem**: Video processing takes too long

**Solutions**:
- Reduce scale factor (try 2x instead of 4x)
- Use "High" quality instead of "Ultra" or "Lossless"
- Close other applications to free up system resources
- Process shorter video segments for testing
</details>

<details>
<summary>💾 Out of memory errors</summary>

**Problem**: Application crashes or runs out of memory

**Solutions**:
- Reduce scale factor to 2x or 3x maximum
- Use "High" quality setting instead of "Ultra"
- Ensure sufficient disk space for output file
- Close other applications to free RAM
- Process shorter videos (under 5 minutes for testing)
</details>

<details>
<summary>🚫 Permission errors</summary>

**Problem**: Cannot save output file

**Solutions**:
- Choose a different output directory (like Desktop or Documents)
- Ensure you have write permissions to the selected folder
- Run as administrator (Windows) or with sudo (Linux) if necessary
- Check available disk space
</details>

---

## 🤝 Contributing

We welcome contributions for personal use and educational purposes! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/frame-evolve.git
   cd frame-evolve
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make Changes & Test**
   ```bash
   npm run dev
   npm test
   ```

5. **Submit Pull Request**

### 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/yourusername/frame-evolve/issues) with:
- System information (OS, Node.js version, FFmpeg version)
- Steps to reproduce the issue
- Expected vs actual behavior
- Console logs if available

### 💡 Feature Requests

Have ideas for personal use features? We'd love to hear them! [Request features](https://github.com/yourusername/frame-evolve/issues/new) or start a [discussion](https://github.com/yourusername/frame-evolve/discussions).

---

## 🔄 Roadmap

### v1.1.0 - Enhanced Personal Features
- [ ] Batch processing for multiple personal videos
- [ ] Custom filter presets for different content types
- [ ] Improved progress estimation
- [ ] Better error recovery and resumption

### v1.2.0 - User Experience
- [ ] Preset saving and sharing
- [ ] Before/after comparison view
- [ ] Processing history and favorites
- [ ] Improved file organization

### v2.0.0 - Advanced Personal Tools
- [ ] Simple timeline editing
- [ ] Basic color correction
- [ ] Audio enhancement options
- [ ] Export presets for different devices

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Important**: While the source code is MIT licensed, users must ensure they have appropriate rights to process any video content and comply with copyright laws.

---

## 🙏 Acknowledgments

- **FFmpeg Team** - For the incredible multimedia framework that powers video processing
- **Electron Team** - For making cross-platform desktop apps accessible
- **Open Source Community** - For inspiration, libraries, and educational resources
- **Contributors** - Everyone who helps improve Frame Evolve for personal use

---

## 📞 Support

<div align="center">

**Need Help?**

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=flat-square&logo=github)](https://github.com/yourusername/frame-evolve/issues)
[![Discussions](https://img.shields.io/badge/GitHub-Discussions-purple?style=flat-square&logo=github)](https://github.com/yourusername/frame-evolve/discussions)

**For personal use questions and community support**

</div>

---

## ⚖️ Legal Notice

Frame Evolve is designed for personal, non-commercial use. Users are solely responsible for:
- Ensuring they own or have permission to process video content
- Complying with local copyright and intellectual property laws
- Understanding that enhanced videos may still be subject to original content rights
- Using the software within the bounds of applicable laws and regulations

This software is provided "as-is" for educational and personal enhancement purposes only.

---

<div align="center">

**Made with ❤️ for Personal Video Enhancement**

⭐ **Star this repo if you find it useful for your personal projects!** ⭐

*Enhance your memories, not copyrighted content*

</div>