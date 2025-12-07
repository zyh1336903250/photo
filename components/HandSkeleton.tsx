import React, { useRef, useEffect } from 'react';

interface HandSkeletonProps {
  landmarks: { x: number; y: number; z: number }[] | null;
}

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
];

const HandSkeleton: React.FC<HandSkeletonProps> = ({ landmarks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks) return;

    // Drawing settings
    const lineColor = '#FF9F1C'; // Codemao Orange
    const pointColor = '#F9D423'; // Codemao Yellow
    const lineWidth = 3;
    const pointRadius = 4;

    // Draw Connections
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      // Mirror X because we mirrored the container logic (user view)
      // Landmarks are 0-1. Canvas size matches container.
      const startX = (1 - start.x) * canvas.width;
      const startY = start.y * canvas.height;
      const endX = (1 - end.x) * canvas.width;
      const endY = end.y * canvas.height;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });

    // Draw Points
    ctx.fillStyle = pointColor;
    landmarks.forEach((landmark) => {
      const x = (1 - landmark.x) * canvas.width;
      const y = landmark.y * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
      // Optional: Add a small white shine
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, 1, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = pointColor; // Reset
    });

  }, [landmarks]);

  return (
    <canvas 
      ref={canvasRef}
      width={320}
      height={240}
      className="w-full h-full object-contain"
    />
  );
};

export default HandSkeleton;