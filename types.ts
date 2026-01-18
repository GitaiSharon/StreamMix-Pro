
export enum RecorderStatus {
  IDLE = 'IDLE',
  COUNTDOWN = 'COUNTDOWN',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
}

export interface RecorderState {
  status: RecorderStatus;
  errorMessage: string | null;
  duration: number; // in seconds
}

export type VideoResolution = '720p' | '1080p' | '4k';
export type FrameRate = 30 | 60;
export type RecordingMode = 'native' | 'studio';

export interface RecorderSettings {
  quality: VideoResolution;
  frameRate: FrameRate;
  enableAudio: boolean;
  hideCursor: boolean;
  mimeType: string;
  countdownDuration: number;
  bitrate: number; // bps
  recordingMode: RecordingMode;
}

export interface FormatOption {
  label: string;
  value: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
}

export interface WebcamConfig {
  active: boolean;
  x: number;
  y: number;
  size: number; // diameter
  stream?: MediaStream;
}

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  maxRadius: number;
}
