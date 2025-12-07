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
  const [landmarks, setLandmarks] = useState<{x: number, y: number, z: number}[] | null>(null);
  
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    isPinching: false,
    isActive: false,
    pinchProgress: 0,
  });

  const lastCursorRef = useRef({ x: 0, y: 0 });
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const isPinchingRef = useRef(false);
  const lastVideoTimeRef = useRef<number>(-1);

  useEffect(() => {
    let isUnmounted = false;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        if (isUnmounted) return;

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (isUnmounted) {
          handLandmarker.close();
          return;
        }
        
        handLandmarkerRef.current = handLandmarker;
        setIsModelLoading(false);
        startWebcam();
      } catch (err) {
        if (!isUnmounted) {
          console.error("Error initializing MediaPipe:", err);
          setError("无法加载手势识别模型。请检查网络连接。");
          setIsModelLoading(false);
        }
      }
    };

    setupMediaPipe();

    return () => {
      isUnmounted = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
    };
  }, []);

  const startWebcam = async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: "user" 
        } 
      });
      
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // Assigning to onloadeddata handles potential race conditions better than addEventListener if called multiple times
        video.onloadeddata = () => {
          predictWebcam();
        };
        // Explicitly play the video
        video.play().catch(e => console.error("Video play failed:", e));
      }
    } catch (err) {
      console.error("Webcam error:", err);
      setError("无法访问摄像头。请允许摄像头权限以使用手势控制。");
    }
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;
    
    // Safety checks
    if (!video || !landmarker) {
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
    }

    // Ensure dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
    }

    try {
        // Only process if the video frame has changed
        if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;
            const startTimeMs = performance.now();
            
            const results = landmarker.detectForVideo(video, startTimeMs);
            
            if (results.landmarks && results.landmarks.length > 0) {
              const handLandmarks = results.landmarks[0];
              setLandmarks(handLandmarks);

              const indexTip = handLandmarks[8];
              const thumbTip = handLandmarks[4];

              // --- Active Area Logic ---
              // Mirror X
              const flippedX = 1 - indexTip.x;
              const rawY = indexTip.y;

              const xMin = (1 - ACTIVE_AREA_WIDTH) / 2;
              const xMax = xMin + ACTIVE_AREA_WIDTH;
              const yMin = ((1 - ACTIVE_AREA_HEIGHT) / 2) + ACTIVE_AREA_Y_OFFSET;
              const yMax = yMin + ACTIVE_AREA_HEIGHT;

              const normalizedX = Math.min(Math.max((flippedX - xMin) / (xMax - xMin), 0), 1);
              const normalizedY = Math.min(Math.max((rawY - yMin) / (yMax - yMin), 0), 1);

              const targetX = normalizedX * window.innerWidth;
              const targetY = normalizedY * window.innerHeight;

              const smoothedX = lastCursorRef.current.x + (targetX - lastCursorRef.current.x) * SMOOTHING_FACTOR;
              const smoothedY = lastCursorRef.current.y + (targetY - lastCursorRef.current.y) * SMOOTHING_FACTOR;
              
              lastCursorRef.current = { x: smoothedX, y: smoothedY };

              // --- Pinch Logic ---
              const distance = Math.sqrt(
                Math.pow(indexTip.x - thumbTip.x, 2) + 
                Math.pow(indexTip.y - thumbTip.y, 2)
              );

              if (isPinchingRef.current) {
                if (distance > PINCH_RELEASE_THRESHOLD) isPinchingRef.current = false;
              } else {
                if (distance < PINCH_START_THRESHOLD) isPinchingRef.current = true;
              }

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
              setLandmarks(null);
              setCursorState(prev => ({ ...prev, isActive: false, isPinching: false, pinchProgress: 0 }));
            }
        }
    } catch (e) {
        console.warn("Prediction frame skipped:", e);
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return { videoRef, isModelLoading, error, cursorState, landmarks };
};