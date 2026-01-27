---
name: StreamMix Pro Development
description: Expert guide for maintaining and developing the StreamMix Pro recording application, covering critical audio/video sync strategies, performance optimizations, and fallback mechanisms.
---

# StreamMix Pro Development Guide

This skill encapsulates the critical technical knowledge required to maintain StreamMix Pro (v1.1.0+).

## 🔊 Audio Engine & Synchronization

### The "Drift" Problem & Solution
**Issue:** Using a fixed `sampleRate: 48000` in `AudioContext` causes audio to drift (speed up/desync) after ~30s on devices running at 44.1kHz.
**Solution:**
1. **Native Rate:** NEVER force a `sampleRate` in `new AudioContext()` or `getUserMedia()`. Let the browser use the hardware native rate.
2. **Interactive Latency:** ALWAYS use `latencyHint: 'interactive'` in `AudioContext`. This forces the audio clock to sync tightly with the system clock.
   ```typescript
   const ctx = new AudioContext({ latencyHint: 'interactive' });
   ```
3. **Keep-Alive:** You MUST monitor `ctx.state` and call `resume()` if it suspends (common in Chrome/Autoplay policies).

### Microphone Quality
- **Gain:** Set input gain to **0.8** (not 1.0) to prevent clipping.
- **Defaults:** Mute microphone by default on app launch.

## 🎥 Video Pipeline & Trimming

### The "Black Screen" / "Save Failed" Problem
**Issue:** `MediaRecorder` or `captureStream` fails if the source video element is not "alive" in the DOM.
**Solution:**
- **DOM Insertion:** Always append the source `<video>` element to `document.body` (even if offscreen with `left: -9999px`) before capturing its stream.
- **Cleanup:** Always `removeChild` after processing is complete.

### Frame Rate Consistency
- **Fixed FPS:** Always call `captureStream(30)` to enforce constant 30fps.
  ```typescript
  // Bad
  const stream = video.captureStream();
  // Good
  const stream = video.captureStream(30);
  ```

### Trimming & Fallbacks
- **Browser Compatibility:** Direct `MediaRecorder` trimming is safer than FFmpeg.wasm for this use case.
- **Fallback Strategy:** Wrap trim operations in a `try/catch`. On error, ALWAYS save the original file with a suffix (e.g., `_full.webm`) so the user loses nothing.

## 🚀 Performance & Storage

### Memory Management
**Issue:** Storing all chunks in RAM causes crashes on long recordings (>1h).
**Solution:**
- **IndexedDB:** Use a transaction-based DB (StreamMixDB).
- **Batching:** Don't save on every `ondataavailable`. Buffer chunks and save in batches (e.g., every 5 seconds) to unblock the main thread.

## 📦 Versioning & Release (Git)

- **Master:** Latest development code.
- **Stage:** Stable, verified releases.
- **Tags:** Use semantic versioning (e.g., `v1.1.0-stable`).
- **UI:** The app reads `__APP_VERSION__` (injected via Vite) to display the version in the bottom-left corner.

## 🛠️ Common Workflows

### Reseting State
If the recorder gets stuck:
1. Call `discardPreview()`
2. Clear IndexedDB (`clearDB()`)
3. Reset `MediaRecorder` instance.
