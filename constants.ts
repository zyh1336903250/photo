import { Photo } from './types';

// ==========================================
// [用户配置区] 默认照片数据
// ==========================================
const MY_PHOTOS_DATA = [
 
];

// 自动生成 Photo 对象结构
export const GRID_PHOTOS: Photo[] = MY_PHOTOS_DATA.map((item, i) => ({
  id: `photo-${i}`,
  url: item.url,
  title: item.title,
  description: item.description,
  width: 800,
  height: 600,
}));

// ==========================================
// 手势控制参数配置
// ==========================================
export const PINCH_START_THRESHOLD = 0.04; 
export const PINCH_RELEASE_THRESHOLD = 0.06; 
export const MAX_PINCH_DISTANCE = 0.15; 
export const SMOOTHING_FACTOR = 0.12;
export const ACTIVE_AREA_WIDTH = 0.7; 
export const ACTIVE_AREA_HEIGHT = 0.6; 
export const ACTIVE_AREA_Y_OFFSET = 0.0;
