export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  width: number;
  height: number;
}

export interface CursorState {
  x: number; // 0 to window.innerWidth
  y: number; // 0 to window.innerHeight
  isPinching: boolean;
  isActive: boolean; // True if hand is detected
  pinchProgress: number; // 0.0 to 1.0, where 1.0 is fully pinched
}

export interface HandLandmarkerResult {
  landmarks: { x: number; y: number; z: number }[][];
}