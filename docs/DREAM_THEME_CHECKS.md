# 本次更新验证

2026-09-15

- 头像改为用户上传的 512×512 JPG，昵称统一 omiki1。
- About 保留指定介绍，移除额外介绍、视觉基调、做事原则；后续章节重编号。
- Changelog 页面、导航、归档入口、页脚、搜索索引和 sitemap 引用已移除。
- 10 张图片统一为相册，大图/紧凑布局，不展示旧图片标题、日期或分类；图片来源折叠呈现。
- 浏览器验证相册切图、Esc 关闭和焦点返回原图片按钮；桌面无横向溢出。
- 日/夜主题按钮保存偏好；浏览器验证天气画布切换 sakura/rain。修复主题按钮 SSR hydration mismatch。
- Kenney CC0 星光/柔光已导入；指针光圈与点击星点/涟漪响应操作；触摸或减少动态效果时停用鼠标特效。
- 四段达妮娅中文原声已下载；浏览器点击泡泡后音频 readyState=4、paused=false，第一段长度约 3.16 秒。
- QQ 音乐改为官方外链 iframe，不再依赖本地 :3200 代理。环境音仍由本站播放器播放。
- 保留用户已添加的追番、分类、标签、侧栏、字体和首屏裁切图片。
- 构建及检查命令：npm run lint、npm run typecheck、npm run verify、node scripts/check-links.mjs。

未进行 Lighthouse 评分或公网部署。QQ 音乐接入说明见 MUSIC_INTEGRATION.md。
