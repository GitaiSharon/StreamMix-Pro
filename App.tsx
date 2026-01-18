
import React, { useState, useEffect, useRef } from 'react';
import { useRecorder } from './hooks/useRecorder';
import { AudioVisualizer } from './components/AudioVisualizer';
import { FloatingControls } from './components/FloatingControls';
import { RecorderStatus, RecorderSettings, VideoResolution, FrameRate, RecordingMode } from './types';

// --- Icons (Lucide-style) ---
const IconSettings = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);
const IconMic = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>);
const IconMicOff = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" x2="23" y1="1" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" x2="12" y1="19" y2="22" /></svg>);
const IconVideo = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>);
const IconVideoOff = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20" /><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L22 8v4" /><line x1="1" x2="1" y1="1" y2="1" /></svg>);
const IconMonitor = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>);
const IconVolume2 = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>);
const IconVolumeX = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" x2="17" y1="9" y2="15" /><line x1="17" x2="23" y1="9" y2="15" /></svg>);
const IconPen = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>);
const IconPlay = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>);
const IconPause = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>);
const IconSquare = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>);
const IconX = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>);
const IconDownload = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>);
const IconTrash2 = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>);
const IconFileText = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>);
const IconRocket = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>);
const IconZap = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);
const IconImage = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>);
const IconCheck = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const IconRefresh = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>);

// Helper for tooltips/labels
const Tooltip = ({ children, text }: React.PropsWithChildren<{ text: string }>) => (
    <div className="group relative flex items-center justify-center">
        {children}
        <div className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-zinc-800 text-xs text-white rounded border border-zinc-700 whitespace-nowrap shadow-xl z-50 animate-in fade-in slide-in-from-bottom-1">
            {text}
        </div>
    </div>
);

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

function App() {
    const {
        status,
        errorMessage,
        canvasRef,
        micAnalyser,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        recordingTime,
        supportedFormats,
        countdownValue,
        isWebcamOn,
        toggleWebcam,
        isDrawingMode,
        toggleDrawingMode,
        brushColor,
        setBrushColor,
        clearCanvas,
        handleCanvasMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseUp,
        hasRecoverableRecording,
        recoverRecording,
        discardRecovery,
        isMicMuted,
        toggleMicMute,
        isSystemAudioMuted,
        toggleSystemAudioMute,
        previewBlob,
        saveRecording,
        trimAndSaveRecording,
        discardPreview,
        setWatermarkFile
    } = useRecorder();

    const isRecording = status === RecorderStatus.RECORDING;
    const isPaused = status === RecorderStatus.PAUSED;
    const isCountdown = status === RecorderStatus.COUNTDOWN;
    const isProcessing = status === RecorderStatus.PROCESSING;
    const isBusy = isRecording || isCountdown || isProcessing || isPaused;

    // Settings State
    const [settings, setSettings] = useState<RecorderSettings>({
        quality: '1080p',
        frameRate: 60,
        enableAudio: true,
        hideCursor: false,
        mimeType: '',
        countdownDuration: 3,
        bitrate: 3000000,
        recordingMode: 'native'
    });

    // Teleprompter State
    const [showTeleprompter, setShowTeleprompter] = useState(false);
    const [teleprompterText, setTeleprompterText] = useState('');
    const [teleprompterFontSize, setTeleprompterFontSize] = useState(18);
    const [teleprompterPos, setTeleprompterPos] = useState({ x: 50, y: 50 });
    const [isDraggingPrompter, setIsDraggingPrompter] = useState(false);
    const prompterDragStart = useRef({ x: 0, y: 0 });

    // Modal & Trimming State
    const [fileName, setFileName] = useState('');
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [isPlayingSelection, setIsPlayingSelection] = useState(false);

    useEffect(() => {
        if (supportedFormats.length > 0 && !settings.mimeType) {
            const mp4 = supportedFormats.find(f => f.value.includes('mp4'));
            const defaultFormat = mp4 ? mp4.value : supportedFormats[0].value;
            setSettings(s => ({ ...s, mimeType: defaultFormat }));
        }
    }, [supportedFormats]);

    // Handle Preview Blob
    useEffect(() => {
        if (previewBlob && previewVideoRef.current) {
            const date = new Date();
            setFileName(`Recording_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getHours()}${date.getMinutes()}`);
            const video = previewVideoRef.current;
            video.src = URL.createObjectURL(previewBlob);
            video.onloadedmetadata = () => {
                setVideoDuration(video.duration);
                setTrimStart(0);
                setTrimEnd(video.duration);
            };
            setIsPlayingSelection(false);
        }
        setShowDiscardConfirm(false);
    }, [previewBlob]);

    // Time update for trimming loop
    const handleTimeUpdate = () => {
        const v = previewVideoRef.current;
        if (!v) return;

        // Only loop if we are specifically previewing the selection
        if (isPlayingSelection) {
            if (v.currentTime >= trimEnd) {
                v.pause();
                v.currentTime = trimStart;
                v.play();
            }
        }
    };

    const playPreview = () => {
        const v = previewVideoRef.current;
        if (v) {
            setIsPlayingSelection(true);
            v.currentTime = trimStart;
            v.play();
        }
    };

    const resetTrim = () => {
        const v = previewVideoRef.current;
        if (v) {
            setIsPlayingSelection(false);
            v.pause();
            setTrimStart(0);
            setTrimEnd(videoDuration);
            v.currentTime = 0;
        }
    };

    // Teleprompter Dragging
    const handlePrompterMouseDown = (e: React.MouseEvent) => {
        setIsDraggingPrompter(true);
        prompterDragStart.current = { x: e.clientX - teleprompterPos.x, y: e.clientY - teleprompterPos.y };
    };
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingPrompter) setTeleprompterPos({ x: e.clientX - prompterDragStart.current.x, y: e.clientY - prompterDragStart.current.y });
        };
        const handleMouseUp = () => setIsDraggingPrompter(false);
        if (isDraggingPrompter) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [isDraggingPrompter]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Alt+R: Start/Stop Recording
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                if (!isRecording && !isBusy) {
                    startRecording(settings);
                } else if (isRecording) {
                    stopRecording();
                }
            }
            // Space: Pause/Resume (only when recording)
            if (e.code === 'Space' && isRecording && !previewBlob) {
                e.preventDefault();
                if (isPaused) resumeRecording();
                else pauseRecording();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isRecording, isPaused, isBusy, previewBlob, settings]);


    return (
        <div className="h-screen w-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-hidden">

            {/* --- Background Ambient Glow --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-1/4 w-[50vw] h-[50vh] bg-indigo-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-1/4 w-[50vw] h-[50vh] bg-violet-900/10 blur-[120px] rounded-full" />
            </div>

            {/* --- Top Configuration Bar --- */}
            <header className="relative z-10 w-full px-3 md:px-6 py-2 md:py-3 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-inner" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-xs md:text-sm font-bold tracking-tight text-zinc-100">StreamMix <span className="text-indigo-400">Pro</span></h1>
                        <span className="text-[9px] md:text-[10px] text-zinc-500 font-medium tracking-wide uppercase">Studio Edition</span>
                    </div>
                </div>

                <div className={`flex items-center gap-2 md:gap-4 transition-opacity duration-300 ${isBusy ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    {/* Mode Switcher */}
                    <div className="hidden md:flex bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setSettings(s => ({ ...s, recordingMode: 'native' }))}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${settings.recordingMode === 'native' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <IconZap size={14} /> Performance
                        </button>
                        <button
                            onClick={() => setSettings(s => ({ ...s, recordingMode: 'studio' }))}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${settings.recordingMode === 'studio' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <IconMonitor size={14} /> Studio
                        </button>
                    </div>

                    <div className="hidden md:block h-4 w-px bg-white/10" />

                    {/* Quick Settings */}
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        {/* Format Selector */}
                        {supportedFormats.length > 0 && (
                            <select
                                value={settings.mimeType}
                                onChange={(e) => setSettings(s => ({ ...s, mimeType: e.target.value }))}
                                className="bg-zinc-900 text-xs font-medium text-zinc-200 border border-white/10 rounded px-2 py-1 outline-none cursor-pointer max-w-[120px]"
                            >
                                {supportedFormats.map(f => (
                                    <option key={f.value} value={f.value} className="bg-zinc-900 text-zinc-200">
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        <span className="text-zinc-700 text-xs">•</span>
                        <select
                            value={settings.quality}
                            onChange={(e) => setSettings(s => ({ ...s, quality: e.target.value as VideoResolution }))}
                            className="bg-zinc-900 text-xs font-medium text-zinc-200 border border-white/10 rounded px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="720p" className="bg-zinc-900 text-zinc-200">720p</option>
                            <option value="1080p" className="bg-zinc-900 text-zinc-200">1080p</option>
                            <option value="4k" className="bg-zinc-900 text-zinc-200">4K UHD</option>
                        </select>
                        <span className="text-zinc-700 text-xs">•</span>
                        <select
                            value={settings.frameRate}
                            onChange={(e) => setSettings(s => ({ ...s, frameRate: parseInt(e.target.value) as FrameRate }))}
                            className="bg-zinc-900 text-xs font-medium text-zinc-200 border border-white/10 rounded px-2 py-1 outline-none cursor-pointer"
                        >
                            <option value="30" className="bg-zinc-900 text-zinc-200">30 FPS</option>
                            <option value="60" className="bg-zinc-900 text-zinc-200">60 FPS</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* --- Main Stage --- */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 md:p-4 lg:p-6 overflow-hidden">

                <div className="relative w-full max-w-[95vw] lg:max-w-6xl aspect-video bg-black/40 rounded-xl md:rounded-2xl border border-white/5 shadow-2xl ring-1 ring-black/50 overflow-hidden group">

                    {/* Teleprompter Overlay */}
                    {showTeleprompter && (
                        <div
                            style={{ left: teleprompterPos.x, top: teleprompterPos.y }}
                            className="absolute z-50 w-80 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/50"
                        >
                            <div
                                onMouseDown={handlePrompterMouseDown}
                                className="bg-zinc-800/50 px-3 py-2 cursor-grab active:cursor-grabbing flex justify-between items-center select-none border-b border-white/5"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                                    <IconFileText size={12} /> Script
                                </div>
                                <button onClick={() => setShowTeleprompter(false)} className="text-zinc-500 hover:text-white"><IconX size={12} /></button>
                            </div>
                            <textarea
                                value={teleprompterText}
                                onChange={(e) => setTeleprompterText(e.target.value)}
                                style={{ fontSize: `${teleprompterFontSize}px` }}
                                placeholder="Paste script here..."
                                className="w-full h-48 bg-transparent text-zinc-100 p-4 outline-none resize-none font-medium leading-relaxed placeholder:text-zinc-600"
                            />
                            <div className="bg-zinc-950/30 px-3 py-2 border-t border-white/5">
                                <input type="range" min="12" max="32" value={teleprompterFontSize} onChange={(e) => setTeleprompterFontSize(parseInt(e.target.value))} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                        </div>
                    )}

                    {/* Zero State / Canvas */}
                    {!isBusy && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                                <IconMonitor size={32} className="text-zinc-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-200 mb-2">Ready to Capture</h2>
                            <p className="text-sm text-zinc-500 max-w-md text-center">
                                Select a mode from the top bar, configure your microphone, and press Record to begin.
                            </p>
                            <p className="text-xs text-zinc-600 mt-3 flex items-center gap-2">
                                <IconMonitor size={14} />
                                💡 Tip: Choose "Entire Screen" for fullscreen recording
                            </p>
                        </div>
                    )}

                    {/* Processing State */}
                    {isProcessing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm font-medium text-zinc-300 animate-pulse">Processing your recording...</p>
                            </div>
                        </div>
                    )}

                    {/* Countdown */}
                    {isCountdown && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                            <div className="text-9xl font-black text-white animate-bounce drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                {countdownValue}
                            </div>
                        </div>
                    )}

                    {/* Live Canvas */}
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        className={`w-full h-full object-contain transition-opacity duration-500 ${isBusy ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Drawing Hint */}
                    {isDrawingMode && isRecording && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900/80 backdrop-blur rounded-full text-xs font-medium text-pink-400 border border-pink-500/20 shadow-lg pointer-events-none flex items-center gap-2">
                            <IconPen size={12} /> Drawing Enabled
                        </div>
                    )}
                </div>
            </main>

            {/* --- Floating Control Dock --- */}
            <div className="fixed bottom-2 md:bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95vw] md:w-auto max-w-[95vw]">
                <div className="flex items-center gap-1 md:gap-3 p-1 md:p-2 pl-2 md:pl-4 pr-1 md:pr-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-black/50 transition-all hover:scale-[1.01] justify-center">

                    {/* Timer & Status */}
                    <div className="flex flex-col mr-1 md:mr-2 min-w-[50px] md:min-w-[60px]">
                        {isRecording ? (
                            <>
                                <span className="text-[10px] md:text-xs font-mono font-bold text-red-400 tabular-nums tracking-wider">{formatTime(recordingTime)}</span>
                                <span className="text-[8px] md:text-[9px] font-bold text-red-500/50 uppercase tracking-widest animate-pulse">REC</span>
                            </>
                        ) : (
                            <span className="text-[10px] md:text-xs font-medium text-zinc-500">Ready</span>
                        )}
                    </div>

                    <div className="hidden md:block w-px h-8 bg-white/5 mx-1" />

                    {/* Main Record Button */}
                    {!isRecording ? (
                        <Tooltip text="Start Recording (Alt+R)">
                            <button onClick={() => startRecording(settings)} className="group relative w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all shadow-lg shadow-red-900/20 hover:scale-105 active:scale-95">
                                <div className="w-4 h-4 rounded bg-white transition-all group-hover:rounded-sm" />
                            </button>
                        </Tooltip>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Tooltip text={isPaused ? "Resume" : "Pause"}>
                                <button onClick={isPaused ? resumeRecording : pauseRecording} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-all">
                                    {isPaused ? <IconPlay size={18} /> : <IconPause size={18} />}
                                </button>
                            </Tooltip>
                            <Tooltip text="Stop Recording">
                                <button onClick={stopRecording} className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/30 flex items-center justify-center transition-all">
                                    <IconSquare size={20} fill="currentColor" />
                                </button>
                            </Tooltip>
                        </div>
                    )}

                    <div className="w-px h-8 bg-white/5 mx-1" />

                    {/* Toggles */}
                    <div className="flex items-center gap-1">
                        <Tooltip text={isMicMuted ? "Unmute Mic" : "Mute Mic"}>
                            <button
                                onClick={toggleMicMute}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!isMicMuted ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                            >
                                {!isMicMuted ? <IconMic size={18} /> : <IconMicOff size={18} />}
                            </button>
                        </Tooltip>

                        <Tooltip text={isSystemAudioMuted ? "Unmute System" : "Mute System"}>
                            <button
                                onClick={toggleSystemAudioMute}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!isSystemAudioMuted ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'}`}
                            >
                                {!isSystemAudioMuted ? <IconVolume2 size={18} /> : <IconVolumeX size={18} />}
                            </button>
                        </Tooltip>

                        <div className="w-px h-4 bg-white/5 mx-1" />

                        <Tooltip text="Toggle Webcam">
                            <button
                                disabled={settings.recordingMode === 'native'}
                                onClick={toggleWebcam}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isWebcamOn ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            >
                                {isWebcamOn ? <IconVideo size={18} /> : <IconVideoOff size={18} />}
                            </button>
                        </Tooltip>

                        <Tooltip text="Draw (Studio Mode)">
                            <button
                                disabled={settings.recordingMode === 'native'}
                                onClick={toggleDrawingMode}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDrawingMode ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                            >
                                <IconPen size={18} />
                            </button>
                        </Tooltip>

                        {/* Color Picker Popover (Only when drawing active) */}
                        {isDrawingMode && settings.recordingMode !== 'native' && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-2 bg-zinc-900 border border-white/10 rounded-full shadow-xl flex gap-2 animate-in slide-in-from-bottom-2 fade-in">
                                {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff'].map(c => (
                                    <button key={c} onClick={() => setBrushColor(c)} className={`w-5 h-5 rounded-full border border-white/10 hover:scale-110 transition-transform ${brushColor === c ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: c }} />
                                ))}
                                <div className="w-px h-5 bg-white/10" />
                                <button onClick={clearCanvas} className="p-1 hover:text-red-400 text-zinc-500"><IconTrash2 size={14} /></button>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-8 bg-white/5 mx-1" />

                    {/* Extra Tools Dropup/Menu */}
                    <Tooltip text="Teleprompter">
                        <button
                            onClick={() => setShowTeleprompter(p => !p)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showTeleprompter ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                        >
                            <IconFileText size={18} />
                        </button>
                    </Tooltip>

                    <Tooltip text="Watermark">
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all overflow-hidden ${settings.recordingMode === 'native' ? 'opacity-30' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                            <input type="file" accept="image/*" disabled={settings.recordingMode === 'native'} onChange={(e) => setWatermarkFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                            <IconImage size={18} className="text-zinc-400" />
                        </div>
                    </Tooltip>

                    {settings.enableAudio && <AudioVisualizer analyser={micAnalyser} isActive={!isMicMuted && (isRecording || status === RecorderStatus.IDLE)} />}

                </div>
            </div>

            {/* --- Floating Control Window (During Recording) --- */}
            {(isRecording || isPaused) && (
                <FloatingControls
                    status={status}
                    recordingTime={recordingTime}
                    onStop={stopRecording}
                    onPause={pauseRecording}
                    onResume={resumeRecording}
                />
            )}

            {/* --- Preview & Save Modal --- */}
            {previewBlob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-zinc-950/95 via-indigo-950/90 to-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-300 p-2 md:p-4 overflow-hidden">
                    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-[98vw] lg:max-w-7xl h-[96vh] p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4 ring-1 ring-white/5 overflow-hidden">

                        {/* Header */}
                        <div className="flex justify-between items-center border-b border-white/5 pb-2 md:pb-3 shrink-0">
                            <h2 className="text-base md:text-xl font-bold text-zinc-100 flex items-center gap-2">
                                <span className="w-1.5 h-4 md:w-2 md:h-6 bg-indigo-500 rounded-full"></span>
                                <span className="hidden sm:inline">Review Recording</span>
                                <span className="sm:hidden">Review</span>
                            </h2>
                            <div className="px-2 md:px-3 py-0.5 md:py-1 bg-zinc-800 rounded-full text-[10px] md:text-xs font-mono text-zinc-400">
                                {previewBlob.type.split(';')[0]}
                            </div>
                        </div>

                        {/* Main Content - Horizontal Layout */}
                        <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 overflow-hidden">

                            {/* Left Side - Video Player */}
                            <div className="flex-1 lg:w-[62%] flex flex-col gap-3 overflow-hidden">
                                <div className="flex-1 bg-black rounded-lg md:rounded-xl overflow-hidden shadow-2xl relative ring-1 ring-white/10">
                                    <video
                                        ref={previewVideoRef}
                                        controls
                                        className="w-full h-full object-contain"
                                        onTimeUpdate={handleTimeUpdate}
                                    />
                                </div>
                            </div>

                            {/* Right Side - Controls & Settings */}
                            <div className="lg:w-[38%] flex flex-col gap-3 overflow-y-auto overflow-x-hidden pr-1">

                                {/* Trimming UI */}
                                <div className="bg-zinc-950/50 rounded-lg md:rounded-xl p-3 md:p-4 border border-white/5 flex flex-col gap-3 shrink-0">
                                    <div className="flex justify-between items-start text-sm">
                                        <span className="font-medium text-zinc-400">Timeline Trim</span>
                                        <button onClick={resetTrim} className="text-indigo-400 hover:text-white flex items-center gap-1 text-xs">
                                            <IconRefresh size={10} /> Reset
                                        </button>
                                    </div>

                                    <div className="flex gap-3 font-mono text-xs text-zinc-500">
                                        <span>START: <span className="text-zinc-200">{trimStart.toFixed(1)}s</span></span>
                                        <span>END: <span className="text-zinc-200">{trimEnd.toFixed(1)}s</span></span>
                                    </div>

                                    {/* Scrub Bar */}
                                    <div className="relative h-2 bg-zinc-800 rounded-full w-full">
                                        <div
                                            className="absolute h-full bg-indigo-500/50 rounded-full"
                                            style={{ left: `${(trimStart / videoDuration) * 100}%`, width: `${((trimEnd - trimStart) / videoDuration) * 100}%` }}
                                        />
                                        <div className="absolute h-4 w-4 bg-white rounded-full shadow cursor-pointer top-1/2 -translate-y-1/2 -ml-2 hover:scale-110 transition-transform" style={{ left: `${(trimStart / videoDuration) * 100}%` }} title="Start Point" />
                                        <div className="absolute h-4 w-4 bg-white rounded-full shadow cursor-pointer top-1/2 -translate-y-1/2 -ml-2 hover:scale-110 transition-transform" style={{ left: `${(trimEnd / videoDuration) * 100}%` }} title="End Point" />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => setTrimStart(previewVideoRef.current?.currentTime || 0)} className="flex-1 text-xs px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-indigo-300 rounded border border-white/5 transition-colors">Set Start</button>
                                            <button onClick={() => setTrimEnd(previewVideoRef.current?.currentTime || 0)} className="flex-1 text-xs px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-indigo-300 rounded border border-white/5 transition-colors">Set End</button>
                                        </div>
                                        <button onClick={playPreview} className="text-xs flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded border border-indigo-500/20 transition-all">
                                            <IconPlay size={12} /> Preview Selection
                                        </button>
                                    </div>
                                </div>

                                {/* Project Name */}
                                <div className="flex flex-col gap-2 shrink-0">
                                    <label className="text-xs text-zinc-500 font-medium ml-1 uppercase tracking-wider">Project Name</label>
                                    <input
                                        type="text"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 mt-auto shrink-0">
                                    {!showDiscardConfirm ? (
                                        <button onClick={() => setShowDiscardConfirm(true)} className="text-sm text-zinc-500 hover:text-red-400 transition-colors text-left">Discard Recording</button>
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 bg-red-500/5 rounded border border-red-500/20">
                                            <span className="text-sm text-zinc-400 flex-1">Confirm delete?</span>
                                            <button onClick={discardPreview} className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded text-xs font-bold transition-all">Yes</button>
                                            <button onClick={() => setShowDiscardConfirm(false)} className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 text-xs transition-all">No</button>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => saveRecording(fileName)}
                                            className="w-full px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                                        >
                                            Save Original
                                        </button>
                                        <button
                                            onClick={() => trimAndSaveRecording(fileName, trimStart, trimEnd)}
                                            disabled={isProcessing}
                                            className="w-full px-4 py-3 bg-zinc-100 text-zinc-950 hover:bg-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isProcessing ? <IconSettings className="animate-spin" /> : <IconDownload size={18} />}
                                            {isProcessing ? 'Processing...' : 'Save Trimmed'}
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            )}

            {/* Recover Modal */}
            {hasRecoverableRecording && !isBusy && !previewBlob && (
                <div className="fixed bottom-4 right-4 z-50 bg-amber-500/10 backdrop-blur border border-amber-500/20 p-4 rounded-xl shadow-2xl flex flex-col gap-2 max-w-xs animate-in slide-in-from-right-10 fade-in">
                    <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2"><IconZap size={14} /> Recovery Available</h4>
                    <p className="text-xs text-amber-200/60">An unsaved recording was found.</p>
                    <div className="flex gap-2 mt-1">
                        <button onClick={recoverRecording} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded text-xs font-bold transition-colors">Restore</button>
                        <button onClick={discardRecovery} className="px-3 py-1.5 hover:bg-amber-500/10 text-amber-200 rounded text-xs transition-colors">Dismiss</button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default App;
