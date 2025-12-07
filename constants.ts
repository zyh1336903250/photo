import { Photo } from './types';

export const GRID_PHOTOS: Photo[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `photo-${i}`,
  url: `https://picsum.photos/id/${15 + i}/800/600`,
  title: `记忆碎片 #${i + 1}`,
  description: "数据流解析完成。访问权限已授予。",
  width: 800,
  height: 600,
}));

// Gesture thresholds
// Distance is in normalized coordinates (0-1)
export const PINCH_START_THRESHOLD = 0.04; // Trigger pinch when distance is less than this
export const PINCH_RELEASE_THRESHOLD = 0.06; // Release pinch when distance is greater than this (Hysteresis)
export const MAX_PINCH_DISTANCE = 0.15; // Distance at which progress is 0

export const SMOOTHING_FACTOR = 0.12; // Lower = smoother but more lag. Higher = faster but jittery.

// Active Area configuration
// This defines a "virtual box" in the camera view that maps to the full screen.
// This allows reaching screen corners without moving hand to extreme camera edges.
export const ACTIVE_AREA_WIDTH = 0.7; // Use center 70% of camera width
export const ACTIVE_AREA_HEIGHT = 0.6; // Use center 60% of camera height
export const ACTIVE_AREA_Y_OFFSET = 0.0; // Vertical center offset