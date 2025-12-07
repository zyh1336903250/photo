import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { CursorState } from '../types';
import { 
  PINCH_START_THRESHOLD, 
  PINCH_RELEASE_THRESHOLD, 
  SMOOTHING_FACTOR,
  MAX_PINCH_DISTANCE,
  ACTIVE_AREA_WIDTH,
  ACTIVE_AREA_HEIGHT,
  ACTIVE_AREA_Y_OFFSET
} from '../constants';

export const useHandTracking = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    isPinching: false,
    isActive: false,
    pinchProgress: 0,
  });

  const lastCursorRef = useRef({ x: 0, y: 0 });
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();
  const isPinchingRef = useRef(false); // To handle hysteresis inside the loop without react state lag

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        handLandmarkerRef.current = handLandmarker;
        setIsModelLoading(false);
        startWebcam();
      } catch (err) {
        console.error("Error initializing MediaPipe:", err);
        setError("无法加载手势识别模型。请检查网络连接。");
        setIsModelLoading(false);
      }
    };

    setupMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  const startWebcam = async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: "user" 
        } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    } catch (err) {
      console.error("Webcam error:", err);
      setError("无法访问摄像头。请允许摄像头权限以使用手势控制。");
    }
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    
    if (!video || !landmarker) return;

    let startTimeMs = performance.now();
    
    if (video.currentTime > 0) {
      const results = landmarker.detectForVideo(video, startTimeMs);
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // --- 1. Remap Coordinates (Active Area Logic) ---
        // Raw MediaPipe x is 0-1 (0 is left, 1 is right).
        // Since webcam is mirrored typically in CSS, we treat 0 as right and 1 as left for user logic?
        // Actually, MediaPipe output for front camera matches video pixel coords.
        // If we flip the video with CSS scale-x-100, we need to flip the x coordinate here too for logic to match what user sees.
        
        const flippedX = 1 - indexTip.x;
        const rawY = indexTip.y;

        // Define the bounds of the "Active Area" within the camera frame
        const xMin = (1 - ACTIVE_AREA_WIDTH) / 2;
        const xMax = xMin + ACTIVE_AREA_WIDTH;
        const yMin = ((1 - ACTIVE_AREA_HEIGHT) / 2) + ACTIVE_AREA_Y_OFFSET;
        const yMax = yMin + ACTIVE_AREA_HEIGHT;

        // Normalize the coordinate to 0-1 within that box
        // Clamp values so cursor doesn't fly off too far
        const normalizedX = Math.min(Math.max((flippedX - xMin) / (xMax - xMin), 0), 1);
        const normalizedY = Math.min(Math.max((rawY - yMin) / (yMax - yMin), 0), 1);

        const targetX = normalizedX * window.innerWidth;
        const targetY = normalizedY * window.innerHeight;

        // --- 2. Smooth Movement ---
        const smoothedX = lastCursorRef.current.x + (targetX - lastCursorRef.current.x) * SMOOTHING_FACTOR;
        const smoothedY = lastCursorRef.current.y + (targetY - lastCursorRef.current.y) * SMOOTHING_FACTOR;
        
        lastCursorRef.current = { x: smoothedX, y: smoothedY };

        // --- 3. Detect Pinch with Hysteresis ---
        const distance = Math.sqrt(
          Math.pow(indexTip.x - thumbTip.x, 2) + 
          Math.pow(indexTip.y - thumbTip.y, 2)
        );

        // Hysteresis logic: hard to toggle, hard to untoggle
        if (isPinchingRef.current) {
          if (distance > PINCH_RELEASE_THRESHOLD) {
            isPinchingRef.current = false;
          }
        } else {
          if (distance < PINCH_START_THRESHOLD) {
            isPinchingRef.current = true;
          }
        }

        // Calculate progress (0% at MAX_DISTANCE, 100% at START_THRESHOLD)
        // This gives a visual cue as fingers get closer
        const pinchProgress = Math.max(0, Math.min(1, 
          1 - (distance - PINCH_START_THRESHOLD) / (MAX_PINCH_DISTANCE - PINCH_START_THRESHOLD)
        ));

        setCursorState({
          x: smoothedX,
          y: smoothedY,
          isPinching: isPinchingRef.current,
          isActive: true,
          pinchProgress: isPinchingRef.current ? 1 : pinchProgress
        });

      } else {
        setCursorState(prev => ({ ...prev, isActive: false, isPinching: false, pinchProgress: 0 }));
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return { videoRef, isModelLoading, error, cursorState };
};