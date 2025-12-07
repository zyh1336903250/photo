import { Photo } from './types';

// ==========================================
// [用户配置区] 在这里替换成你自己的照片
// ==========================================
const MY_PHOTOS_DATA = [
  {
    url: "https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=800&q=80",
    title: "霓虹街区",
    description: "2077年的夜之城，数据流在雨夜中穿梭。"
  },
  {
    url: "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?auto=format&fit=crop&w=800&q=80",
    title: "机械姬",
    description: "人工智能觉醒的瞬间，眼中闪烁着蓝色的代码。"
  },
  {
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    title: "矩阵网络",
    description: "深度链接已建立，正在解析加密协议。"
  },
  {
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    title: "赛博义肢",
    description: "人机融合的奇点，触觉反馈系统正常。"
  },
  {
    url: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&w=800&q=80",
    title: "虚拟现实",
    description: "潜入元宇宙的边缘，寻找遗失的记忆碎片。"
  },
  {
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80",
    title: "天空之城",
    description: "反重力引擎启动，悬浮于云端的避难所。"
  },
  {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    title: "量子芯片",
    description: "超越二进制的计算能力，核心温度稳定。"
  },
  {
    url: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=800&q=80",
    title: "光速传输",
    description: "信息以光速穿梭于光纤丛林之中。"
  },
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
// 手势控制参数配置 (可根据需要微调)
// ==========================================

// 捏合动作阈值 (距离是归一化的 0-1)
export const PINCH_START_THRESHOLD = 0.04; // 当手指距离小于此值时，触发捏合
export const PINCH_RELEASE_THRESHOLD = 0.06; // 当手指距离大于此值时，释放捏合 (防止抖动)
export const MAX_PINCH_DISTANCE = 0.15; // 进度条从 0% 开始计算的距离

// 平滑系数 (数值越小越平滑但延迟越高，数值越大响应越快但可能抖动)
export const SMOOTHING_FACTOR = 0.12;

// 摄像头活动区域映射 (Active Area)
// 这定义了摄像头画面中用于控制全屏光标的“虚拟方框”。
// 这样你不需要把手伸到摄像头边缘就能触达屏幕角落。
export const ACTIVE_AREA_WIDTH = 0.7; // 使用摄像头宽度的中间 70%
export const ACTIVE_AREA_HEIGHT = 0.6; // 使用摄像头高度的中间 60%
export const ACTIVE_AREA_Y_OFFSET = 0.0; // 垂直偏移量
