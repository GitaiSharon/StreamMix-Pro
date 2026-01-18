
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RecorderStatus, RecorderSettings, FormatOption, DrawingPath, WebcamConfig, Point, Ripple } from '../types';

const DB_NAME = 'StreamMixDB';
const STORE_NAME = 'chunks';

interface UseRecorderReturn {
  status: RecorderStatus;
  errorMessage: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  micAnalyser: AnalyserNode | null;
  startRecording: (settings: RecorderSettings) => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  recordingTime: number;
  supportedFormats: FormatOption[];
  countdownValue: number;
  isWebcamOn: boolean;
  toggleWebcam: () => void;
  isDrawingMode: boolean;
  toggleDrawingMode: () => void;
  brushColor: string;
  setBrushColor: (c: string) => void;
  clearCanvas: () => void;
  isMicMuted: boolean;
  toggleMicMute: () => void;
  isSystemAudioMuted: boolean;
  toggleSystemAudioMute: () => void;
  handleCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleCanvasMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  hasRecoverableRecording: boolean;
  recoverRecording: () => void;
  discardRecovery: () => void;
  previewBlob: Blob | null;
  saveRecording: (fileName: string) => void;
  trimAndSaveRecording: (fileName: string, start: number, end: number) => Promise<void>;
  discardPreview: () => void;
  setWatermarkFile: (file: File | null) => void;
}

export const useRecorder = (): UseRecorderReturn => {
  const [status, setStatus] = useState<RecorderStatus>(RecorderStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdownValue, setCountdownValue] = useState(0);
  const [supportedFormats, setSupportedFormats] = useState<FormatOption[]>([]);

  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#ef4444');
  const [hasRecoverableRecording, setHasRecoverableRecording] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSystemAudioMuted, setIsSystemAudioMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const webcamConfigRef = useRef<WebcamConfig>({ active: false, x: 50, y: 50, size: 200 });
  const annotationsRef = useRef<DrawingPath[]>([]);
  const currentPathRef = useRef<DrawingPath | null>(null);
  const isDraggingWebcamRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const ripplesRef = useRef<Ripple[]>([]);
  const watermarkImgRef = useRef<HTMLImageElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>("");

  const micGainRef = useRef<GainNode | null>(null);
  const sysGainRef = useRef<GainNode | null>(null);

  const initDB = async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e: any) => {
        e.target.result.createObjectStore(STORE_NAME, { autoIncrement: true });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const checkRecovery = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const count = await new Promise<number>((resolve) => {
        const req = tx.objectStore(STORE_NAME).count();
        req.onsuccess = () => resolve(req.result);
      });
      if (count > 0) setHasRecoverableRecording(true);
    } catch (e) { }
  };

  const saveChunkToDB = async (chunk: Blob) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).add(chunk);
    } catch (e) { }
  };

  const clearDB = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      setHasRecoverableRecording(false);
    } catch (e) { }
  };

  const getAllChunksFromDB = async (): Promise<Blob[]> => {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result);
    });
  };

  useEffect(() => {
    const checkFormats = () => {
      const options: FormatOption[] = [];
      // Prioritize MP4 for better seeking support
      const types = [
        { label: 'MP4 (H.264)', mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2' },
        { label: 'MP4', mime: 'video/mp4' },
        { label: 'WebM (VP9)', mime: 'video/webm;codecs=vp9,opus' },
        { label: 'WebM (VP8)', mime: 'video/webm;codecs=vp8,opus' },
        { label: 'WebM', mime: 'video/webm' }
      ];

      const addedLabels = new Set();
      for (const type of types) {
        if (!addedLabels.has(type.label) && MediaRecorder.isTypeSupported(type.mime)) {
          options.push({ label: type.label, value: type.mime });
          addedLabels.add(type.label);
        }
      }
      setSupportedFormats(options);
    };
    checkFormats();
    checkRecovery();
  }, []);

  useEffect(() => {
    if (status === RecorderStatus.RECORDING) {
      timerRef.current = window.setInterval(() => setRecordingTime(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (status === RecorderStatus.IDLE) setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => { webcamConfigRef.current.active = isWebcamOn; }, [isWebcamOn]);

  const startCompositingLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false, willReadFrequently: true });
    if (!canvas || !ctx) return;

    const draw = () => {
      if (screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
        const video = screenVideoRef.current;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        let drawW = canvas.width, drawH = canvas.height, offsetX = 0, offsetY = 0;
        if (videoRatio > canvasRatio) { drawH = canvas.width / videoRatio; offsetY = (canvas.height - drawH) / 2; }
        else { drawW = canvas.height * videoRatio; offsetX = (canvas.width - drawW) / 2; }
        ctx.drawImage(video, offsetX, offsetY, drawW, drawH);

        if (watermarkImgRef.current?.complete) {
          const img = watermarkImgRef.current;
          const targetWidth = 150;
          const targetHeight = img.naturalHeight * (targetWidth / img.naturalWidth);
          ctx.save(); ctx.globalAlpha = 0.7; ctx.drawImage(img, canvas.width - targetWidth - 20, canvas.height - targetHeight - 20, targetWidth, targetHeight); ctx.restore();
        }

        if (ripplesRef.current.length > 0) {
          ctx.save(); ctx.lineWidth = 3;
          for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
            const ripple = ripplesRef.current[i];
            ctx.beginPath(); ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(250, 204, 21, ${ripple.alpha})`; ctx.stroke();
            ripple.radius += 2.5; ripple.alpha -= 0.03;
            if (ripple.alpha <= 0) ripplesRef.current.splice(i, 1);
          }
          ctx.restore();
        }

        annotationsRef.current.forEach(path => {
          if (path.points.length < 2) return;
          ctx.beginPath(); ctx.strokeStyle = path.color; ctx.lineWidth = path.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) ctx.lineTo(path.points[i].x, path.points[i].y);
          ctx.stroke();
        });
        if (currentPathRef.current) {
          const path = currentPathRef.current;
          ctx.beginPath(); ctx.strokeStyle = path.color; ctx.lineWidth = path.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) ctx.lineTo(path.points[i].x, path.points[i].y);
          ctx.stroke();
        }

        const wc = webcamConfigRef.current;
        if (wc.active && webcamVideoRef.current && webcamVideoRef.current.readyState >= 2) {
          ctx.save(); ctx.beginPath(); ctx.arc(wc.x + wc.size / 2, wc.y + wc.size / 2, wc.size / 2, 0, Math.PI * 2); ctx.clip();
          const v = webcamVideoRef.current;
          const sSize = Math.min(v.videoWidth, v.videoHeight);
          ctx.drawImage(v, (v.videoWidth - sSize) / 2, (v.videoHeight - sSize) / 2, sSize, sSize, wc.x, wc.y, wc.size, wc.size);
          ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.restore();
        }
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const setupAudio = async (micStream: MediaStream | null, sysStream: MediaStream | null, useDelay: boolean) => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass({ sampleRate: 48000, latencyHint: 'playback' });
    if (ctx.state === 'suspended') await ctx.resume();
    audioContextRef.current = ctx;

    const dest = ctx.createMediaStreamDestination();
    dest.channelCount = 2;

    let outputNode: AudioNode = dest;
    if (useDelay) {
      const delayNode = ctx.createDelay(1.0);
      delayNode.delayTime.value = 0.1;
      delayNode.connect(dest);
      outputNode = delayNode;
    }

    if (sysStream?.getAudioTracks().length) {
      const sysSource = ctx.createMediaStreamSource(sysStream);
      const sysGain = ctx.createGain();
      sysGain.gain.value = isSystemAudioMuted ? 0 : 1.0;
      sysSource.connect(sysGain).connect(outputNode);
      sysGainRef.current = sysGain;
    }

    if (micStream?.getAudioTracks().length) {
      const micSource = ctx.createMediaStreamSource(micStream);
      const micGain = ctx.createGain();
      micGain.gain.value = isMicMuted ? 0 : 1.0;
      micSource.connect(micGain).connect(outputNode);
      micGainRef.current = micGain;
      const analyser = ctx.createAnalyser(); analyser.fftSize = 256; micGain.connect(analyser);
      setMicAnalyser(analyser);
    } else setMicAnalyser(null);

    return dest.stream.getAudioTracks()[0];
  };

  const startRecording = async (settings: RecorderSettings) => {
    try {
      setErrorMessage(null); setPreviewBlob(null); setStatus(RecorderStatus.PROCESSING);
      await clearDB(); chunksRef.current = []; transcriptRef.current = "";

      let width = 1920, height = 1080;
      if (settings.quality === '4k') { width = 3840; height = 2160; }
      else if (settings.quality === '720p') { width = 1280; height = 720; }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width, height, frameRate: settings.frameRate },
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });

      let micStream: MediaStream | null = null;
      if (settings.enableAudio) {
        try { micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 } }); } catch (e) { }
      }

      const mixedAudioTrack = await setupAudio(micStream, screenStream, settings.recordingMode === 'studio');

      // Create screen video element and add to DOM (critical for Chrome playback)
      const screenVid = document.createElement('video');
      screenVid.muted = true;
      screenVid.playsInline = true;  // Important for mobile/modern browsers
      screenVid.autoplay = true;     // Ensure auto-playback
      screenVid.style.position = 'absolute';
      screenVid.style.top = '-9999px';  // Hide offscreen but keep in DOM
      screenVid.style.left = '-9999px';
      screenVid.style.pointerEvents = 'none';
      document.body.appendChild(screenVid);

      screenVid.srcObject = screenStream;
      await screenVid.play();

      // Wait for video metadata to ensure it's ready
      await new Promise((resolve) => {
        if (screenVid.readyState >= 2) resolve(null);
        else screenVid.onloadedmetadata = () => resolve(null);
      });

      screenVideoRef.current = screenVid;

      if (canvasRef.current) {
        canvasRef.current.width = screenVid.videoWidth; canvasRef.current.height = screenVid.videoHeight;
        webcamConfigRef.current.x = screenVid.videoWidth - 300; webcamConfigRef.current.y = 50;
      }

      let finalStream: MediaStream;
      if (settings.recordingMode === 'native') {
        const tracks = [screenStream.getVideoTracks()[0]];
        if (mixedAudioTrack) tracks.push(mixedAudioTrack);
        finalStream = new MediaStream(tracks);
        startCompositingLoop();
      } else {
        if (isWebcamOn) {
          try {
            const camStream = await navigator.mediaDevices.getUserMedia({ video: true });

            // Create webcam video element and add to DOM
            const camVid = document.createElement('video');
            camVid.muted = true;
            camVid.playsInline = true;
            camVid.autoplay = true;
            camVid.style.position = 'absolute';
            camVid.style.top = '-9999px';
            camVid.style.left = '-9999px';
            camVid.style.pointerEvents = 'none';
            document.body.appendChild(camVid);

            camVid.srcObject = camStream;
            await camVid.play();

            // Wait for webcam metadata
            await new Promise((resolve) => {
              if (camVid.readyState >= 2) resolve(null);
              else camVid.onloadedmetadata = () => resolve(null);
            });

            webcamVideoRef.current = camVid;
            webcamConfigRef.current.stream = camStream;
          } catch (e) { setIsWebcamOn(false); }
        }
        startCompositingLoop();
        const canvasStream = canvasRef.current!.captureStream(settings.frameRate);
        const combinedTracks = [canvasStream.getVideoTracks()[0]];
        if (mixedAudioTrack) combinedTracks.push(mixedAudioTrack);
        finalStream = new MediaStream(combinedTracks);
      }

      streamRef.current = finalStream;
      setStatus(RecorderStatus.COUNTDOWN);
      for (let i = settings.countdownDuration; i > 0; i--) { setCountdownValue(i); await new Promise(r => setTimeout(r, 1000)); }

      // Enhanced MediaRecorder options for better seeking support
      const opts: MediaRecorderOptions = {
        mimeType: settings.mimeType || 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: settings.quality === '4k' ? 15000000 : (settings.quality === '1080p' ? 8000000 : 5000000),
        audioBitsPerSecond: 320000
      };

      const recorder = new MediaRecorder(finalStream, opts);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) { chunksRef.current.push(e.data); saveChunkToDB(e.data); } };
      recorder.onstop = async () => { cleanup(); await preparePreview(); };

      screenStream.getVideoTracks()[0].onended = () => stopRecording();
      // Use 100ms timeslice for better seeking granularity
      recorder.start(100);
      setStatus(RecorderStatus.RECORDING);
    } catch (err: any) {
      setStatus(RecorderStatus.ERROR); setErrorMessage(err.message || "Recording failed."); cleanup();
    }
  };

  const pauseRecording = () => { if (mediaRecorderRef.current?.state === 'recording') { mediaRecorderRef.current.pause(); setStatus(RecorderStatus.PAUSED); } };
  const resumeRecording = () => { if (mediaRecorderRef.current?.state === 'paused') { mediaRecorderRef.current.resume(); setStatus(RecorderStatus.RECORDING); } };
  const stopRecording = () => { if (mediaRecorderRef.current?.state !== 'inactive') { setStatus(RecorderStatus.PROCESSING); mediaRecorderRef.current!.stop(); } };

  const toggleMicMute = () => { setIsMicMuted(prev => { const n = !prev; if (micGainRef.current) micGainRef.current.gain.value = n ? 0 : 1; return n; }); };
  const toggleSystemAudioMute = () => { setIsSystemAudioMuted(prev => { const n = !prev; if (sysGainRef.current) sysGainRef.current.gain.value = n ? 0 : 1; return n; }); };

  const preparePreview = async (recoveredChunks?: Blob[]) => {
    const blobs = recoveredChunks || chunksRef.current;
    if (blobs.length === 0) { setStatus(RecorderStatus.IDLE); return; }
    setPreviewBlob(new Blob(blobs, { type: blobs[0].type }));
    setStatus(RecorderStatus.IDLE);
  };

  const saveRecording = (fileName: string) => {
    if (!previewBlob) return;
    const url = URL.createObjectURL(previewBlob);
    const a = document.createElement('a'); a.href = url; a.download = `${fileName || 'recording'}.${previewBlob.type.includes('mp4') ? 'mp4' : 'webm'}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url); clearDB(); setPreviewBlob(null);
  };

  const trimAndSaveRecording = async (fileName: string, start: number, end: number) => {
    if (!previewBlob) return;
    setStatus(RecorderStatus.PROCESSING);
    const video = document.createElement('video');
    video.src = URL.createObjectURL(previewBlob);
    video.muted = false; video.volume = 1.0;
    await new Promise(r => video.onloadedmetadata = r);

    let stream: MediaStream;
    // @ts-ignore
    if (video.captureStream) stream = video.captureStream();
    // @ts-ignore
    else if (video.mozCaptureStream) stream = video.mozCaptureStream();
    else { saveRecording(fileName); setStatus(RecorderStatus.IDLE); return; }

    const recorder = new MediaRecorder(stream, { mimeType: previewBlob.type, audioBitsPerSecond: 320000, videoBitsPerSecond: 8000000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const b = new Blob(chunks, { type: previewBlob.type });
      const url = URL.createObjectURL(b);
      const a = document.createElement('a'); a.href = url; a.download = `${fileName}_trimmed.${b.type.includes('mp4') ? 'mp4' : 'webm'}`;
      a.click(); discardPreview(); setStatus(RecorderStatus.IDLE);
    };

    video.currentTime = start;
    await new Promise(r => video.onseeked = r);
    recorder.start(); video.play();
    const check = () => { if (video.currentTime >= end || video.ended) { recorder.stop(); video.pause(); } else requestAnimationFrame(check); };
    check();
  };

  const discardPreview = useCallback(() => { setPreviewBlob(null); clearDB(); setStatus(RecorderStatus.IDLE); }, []);
  const recoverRecording = async () => { setStatus(RecorderStatus.PROCESSING); preparePreview(await getAllChunksFromDB()); setHasRecoverableRecording(false); };
  const discardRecovery = async () => { await clearDB(); setHasRecoverableRecording(false); };

  const setWatermarkFile = (file: File | null) => {
    if (!file) { watermarkImgRef.current = null; return; }
    const img = new Image(); img.src = URL.createObjectURL(file); img.onload = () => { watermarkImgRef.current = img; };
  };

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    // Clean up screen video - remove from DOM
    if (screenVideoRef.current) {
      screenVideoRef.current.pause();
      screenVideoRef.current.srcObject = null;
      if (screenVideoRef.current.parentNode) {
        screenVideoRef.current.parentNode.removeChild(screenVideoRef.current);
      }
      screenVideoRef.current = null;
    }

    // Clean up webcam video - remove from DOM
    if (webcamVideoRef.current) {
      webcamVideoRef.current.pause();
      webcamVideoRef.current.srcObject = null;
      if (webcamVideoRef.current.parentNode) {
        webcamVideoRef.current.parentNode.removeChild(webcamVideoRef.current);
      }
      webcamVideoRef.current = null;
    }

    if (audioContextRef.current) { audioContextRef.current.close().catch(() => { }); audioContextRef.current = null; }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (webcamConfigRef.current.stream) webcamConfigRef.current.stream.getTracks().forEach(t => t.stop());
  }, []);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
  };

  return {
    status, errorMessage, canvasRef, micAnalyser, startRecording, stopRecording, pauseRecording, resumeRecording,
    recordingTime, supportedFormats, countdownValue, isWebcamOn, toggleWebcam: () => setIsWebcamOn(p => !p),
    isDrawingMode, toggleDrawingMode: () => setIsDrawingMode(p => !p), brushColor, setBrushColor, clearCanvas: () => { annotationsRef.current = []; },
    isMicMuted, toggleMicMute, isSystemAudioMuted, toggleSystemAudioMute, hasRecoverableRecording, recoverRecording, discardRecovery,
    previewBlob, saveRecording, trimAndSaveRecording, discardPreview, setWatermarkFile,
    handleCanvasMouseDown: (e) => {
      const p = getCanvasPoint(e); const wc = webcamConfigRef.current;
      ripplesRef.current.push({ x: p.x, y: p.y, radius: 10, alpha: 1.0, maxRadius: 50 });
      if (isWebcamOn) {
        const dx = p.x - (wc.x + wc.size / 2), dy = p.y - (wc.y + wc.size / 2);
        if (dx * dx + dy * dy < (wc.size / 2) * (wc.size / 2)) { isDraggingWebcamRef.current = true; dragOffsetRef.current = { x: p.x - wc.x, y: p.y - wc.y }; return; }
      }
      if (isDrawingMode) currentPathRef.current = { points: [p], color: brushColor, width: 5 };
    },
    handleCanvasMouseMove: (e) => {
      const p = getCanvasPoint(e);
      if (isDraggingWebcamRef.current) { webcamConfigRef.current.x = p.x - dragOffsetRef.current.x; webcamConfigRef.current.y = p.y - dragOffsetRef.current.y; }
      else if (isDrawingMode && currentPathRef.current) currentPathRef.current.points.push(p);
    },
    handleCanvasMouseUp: () => { isDraggingWebcamRef.current = false; if (currentPathRef.current) { annotationsRef.current.push(currentPathRef.current); currentPathRef.current = null; } }
  };
};
