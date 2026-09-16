# 参考调研 — XinghuisamaBlogs

调研日期：2026-09-15。只借鉴信息架构，不复制源码、素材或布局。

## 实际读取

- [线上网站](https://www.xinghuisama.top/)：浏览器实际观察首页，包含窄屏及桌面视口；其余内页结论来自源代码，未冒充全站视觉验收。
- [GitHub](https://github.com/heiehiehi/XinghuisamaBlogs)：README、XHBlogs/package.json、siteConfig.ts、app/page.tsx、app/globals.css。
- components：ProfileCard、SearchBar、MusicProvider、PageTransition、AboutClient。
- 内页：app/posts/[slug]/page.tsx、photowall/PhotoWallClient、projects/ProjectsBoard。

## 结构与体验

| 维度 | 观察 | 本站决策 |
| --- | --- | --- |
| 首页层级 | 搜索开场，12 列网格中个人信息 7 / 音乐 5；后续文章 4 / 照片与动态 8 | 开放 Hero 开场；播放器降权；文章采用 7:5 杂志布局 |
| 视觉 | 壁纸背景、大面积玻璃、圆角与投影，紫粉装饰 | 深蓝黑基底、少量玻璃、小圆角；用空白和细分隔线组织内容 |
| 信息密度 | 多种入口集中在两组网格，文章与动态轮播节省空间 | 不自动轮播文章；精选一篇、旁列两篇，信息可扫读 |
| 音乐 | MusicProvider 管理 Audio、进度、歌词与远程 API | 本地音频、跨路由保留播放器状态，无自动播放 |
| 阅读 | 文件系统 Markdown、GFM、代码高亮、数学、目录与侧栏 | 服务端预渲染；正文 740px，中文 1.95 行高；目录来自同一 AST |
| 图片 | 相册与 CSS columns 瀑布流，点击放大 | 图片来源可见；原生 dialog 实现灯箱、左右键、Esc、焦点恢复 |
| 动态 | 首页聚合短内容；Markdown 内容按日期排序 | JSON 时间线，标签与可选图片 |
| About | Markdown 简介与活动标签页 | 文字主导，兴趣、工作方式与配置化联系入口 |
| Projects | 数据驱动、名称/描述/技术栈筛选、双列布局 | 强化项目优先级，展示原型状态、技术栈与可选真实链接 |
| 动效 | Framer Motion 页面淡入上移 20px / 0.8s；卡片缩放 | 0.55s / 14px，hover 上移 2px；角色视差 ≤8px |
| 深浅主题 | dark: 样式、主题切换区、背景图影响对比度 | 完整语义 token，两主题分别设计，不反色图片 |
| 手机 | 栅格重排，间距/头像/字号调整；播放器依旧占较多高度 | Hero 角色移到右侧独立视觉区，正文在前；导航折叠，音乐紧凑 |

## 架构取舍

参考代码包括独立本地后台、富文本编辑、远程音乐服务、评论与 3D 功能。本站第一版不引入这些运行时负担。内容存储在 Markdown / TypeScript / JSON 中，Next.js 静态生成；所有搜索记录从同一内容源派生。组件中不放账号密钥；原始 HTML 默认不执行。未使用参考项目任何实现代码。
