import { Photo } from './types';

// ==========================================
// [用户配置区] 默认照片数据
// ==========================================
const MY_PHOTOS_DATA = [
  {
    url: "https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=800&q=80",
    title: "霓虹街区",
    description: "2077年的夜之城，数据流在雨夜中穿梭。每当夜幕降临，全息广告牌便将天空染成迷幻的色彩。"
  },
  {
    url: "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?auto=format&fit=crop&w=800&q=80",
    title: "机械姬",
    description: "人工智能觉醒的瞬间，眼中闪烁着蓝色的代码。她开始思考存在的意义，以及灵魂是否仅仅是复杂的算法。"
  },
  {
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    title: "矩阵网络",
    description: "深度链接已建立，正在解析加密协议。在这个虚拟的维度里，信息就是货币，而加密则是最强的护盾。"
  },
  {
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    title: "赛博义肢",
    description: "人机融合的奇点，触觉反馈系统正常。钢铁与血肉的结合，不仅增强了力量，更重塑了人类的定义。"
  },
  {
    url: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&w=800&q=80",
    title: "虚拟现实",
    description: "潜入元宇宙的边缘，寻找遗失的记忆碎片。在这里，重力只是一个可选项，而想象力是唯一的限制。"
  },
  {
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80",
    title: "天空之城",
    description: "反重力引擎启动，悬浮于云端的避难所。远离地面的喧嚣，这里的空气纯净而稀薄，是精英阶层的最后堡垒。"
  },
  {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    title: "量子芯片",
    description: "超越二进制的计算能力，核心温度稳定。每一个逻辑门都蕴含着宇宙的奥秘，计算着未来的无数种可能。"
  },
  {
    url: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=800&q=80",
    title: "光速传输",
    description: "信息以光速穿梭于光纤丛林之中。在这个时代，距离不再是障碍，唯有带宽才是连接彼此的桥梁。"
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
// 手势控制参数配置
// ==========================================
export const PINCH_START_THRESHOLD = 0.04; 
export const PINCH_RELEASE_THRESHOLD = 0.06; 
export const MAX_PINCH_DISTANCE = 0.15; 
export const SMOOTHING_FACTOR = 0.12;
export const ACTIVE_AREA_WIDTH = 0.7; 
export const ACTIVE_AREA_HEIGHT = 0.6; 
export const ACTIVE_AREA_Y_OFFSET = 0.0;