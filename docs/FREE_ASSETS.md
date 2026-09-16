# 梦境主题：免费素材筛选

核对日期：2026-09-15。下列授权针对各自素材，不适用于用户提供的游戏角色立绘。

| 来源 | 官方授权 | 适合的元素 | 本次状态 |
| --- | --- | --- | --- |
| [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) | CC0，80 个 512×512 粒子 | 少量星光、柔光点、光环；避免烟雾、火焰等强效果 | 已从用户下载的 ZIP 导入，使用 2 个星光遮罩和 1 个柔光纹理 |
| [Poly Haven](https://polyhaven.com/license) | 素材 CC0 | 后续 3D 玻璃场景中的环境光和反射 | 已调研，当前 2D 页面不加载 HDRI |
| [ambientCG](https://docs.ambientcg.com/license/) | 素材 CC0 | 后续 3D 水面材质、细微法线变化 | 已调研，当前水面使用轻量 CSS 涟漪 |
| [Lucide](https://lucide.dev/license) | ISC；包含 Feather 衍生部分的 MIT 声明 | Sparkles、细线箭头、音乐与导航图标 | 已在项目安装并实际使用，授权保留在 `public/licenses/lucide.txt` |
| Manrope / Fontsource | SIL OFL 1.1 | 英文标题、小字号坐标与界面标签 | 已在项目安装，本地字体；授权保留在 `public/licenses/manrope.txt` |

## 取舍

人物是首屏视觉中心。粒子保持稀疏，流星间歇出现，玻璃只用于光环与小卡片。没有加入 WebGL 引擎；日夜天气使用单个 Canvas，页面隐藏或偏好减少动态效果时停止绘制。星空海面使用单张本地背景图，人物使用透明 WebP，水面、轨道、泡泡与流星由 CSS 绘制。

## 角色与背景

- `public/artwork/denia-original.png`：用户本次提供的完整原图，2048×2032。
- `public/artwork/denia.webp`：网页版本；按 alpha 边界去除透明留白，缩放至 1400 像素高，保留透明通道。没有改变人物设计。
- AI 背景与角色素材分别管理；AI 作品不标注为游戏官方美术。

## Kenney 下载记录

官方下载链接：<https://kenney.nl/media/pages/assets/particle-pack/f8fe0f8cb8-1677578741/kenney_particle-pack.zip>。

用户提供的 kenney_particle-pack.zip 已解压至 assets/third-party/kenney-particle-pack。选取 PNG (Transparent) 中 star_04、star_06、flare_01，分别用于首屏星光、鼠标点击星点和光环。仅使用图片，授权保留在 public/licenses/kenney-particles.txt。
