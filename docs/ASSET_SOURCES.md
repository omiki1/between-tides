# 素材来源

## 使用边界

本网站默认为个人、非商业用途。所有运行时图片都放在本地路径下，没有远程热链。

## 原有站点画面（图集）

五张画面由站主提供并直接放入项目主目录，已转为 WebP 并归入 `public/gallery/`。它们是站点自己的视觉，因此页面上不标注外部作者，也不生成原始出处链接；原始 PNG 备份保留在 `.research/hero-originals/`（该目录已被 `.gitignore` 排除，不参与构建）。

| 本地文件 | 原始文件（备份名） | 尺寸 | 用途 |
| --- | --- | --- | --- |
| public/gallery/bubble-dream.webp | bubble-dream.png | 1506×847 | 图集、浅色主题取色 |
| public/gallery/iridescent-tide.webp | iridescent-tide.png | 1149×646 | 图集、手记封面（音乐随笔） |
| public/gallery/moonlit-shadow.webp | moonlit-shadow.png | 1084×609 | 图集、随记配图 |
| public/gallery/echoes-at-dusk.webp | echoes-at-dusk.png | 1296×729 | 图集 |
| public/gallery/deep-tide.webp | deep-tide.png | 1088×612 | 图集、手记封面（RAG 笔记）、音乐封面 |

转换规则：仅做 WebP 编码（quality 84，保留 alpha），不裁剪、不重绘、不改变构图。像素统计可复现：`node scripts/analyse-images.mjs public/gallery/*.webp`。

## 音频

### 本站原创环境音

`public/audio/moonlit-current.wav` 与 `public/audio/quiet-orbit.wav` 为本站用程序合成的原创环境音示例，署名固定写作「Between Tides · 原创环境音」，在任何位置都不标注为鸣潮 OST。

### 达妮娅游戏语音（4 条）

Hero 场景使用的角色语音来自游戏音频镜像，逐条记录在 `data/denia-voices.json`，本地文件由 `node scripts/fetch-voices.mjs` 下载到 `public/audio/denia/zh/`。文件头校验为真实 MP3（ID3），体积 38–75KB。

| 本地文件 | 游戏内触发 | 原始镜像地址 |
| --- | --- | --- |
| public/audio/denia/zh/1210189.mp3 | 滑翔 · 一 | api.encore.moe / play_favor_word_daniya_com_fly_01.mp3 |
| public/audio/denia/zh/1210190.mp3 | 滑翔 · 二 | api.encore.moe / play_favor_word_daniya_com_fly_02.mp3 |
| public/audio/denia/zh/1210191.mp3 | 感知 | api.encore.moe / play_favor_word_daniya_com_scan.mp3 |
| public/audio/denia/zh/1210196.mp3 | 获得补给 · 一 | api.encore.moe / play_favor_word_daniya_com_openbox_02.mp3 |

镜像站为第三方收录，非官方 CDN；语音与角色版权归 Kuro Games 所有，本站仅作个人非商业展示，不声明可商用，也不把它标成鸣潮原声带曲目。

## 鸣潮 / Kuro Games

本次按站主请求加入其提供的 Denia 透明立绘，不从镜像站另行取得角色图片。原文件完整保留在 `public/artwork/denia-original.png`；网页版本 `public/artwork/denia.webp` 只去除透明留白、缩放并编码为 WebP，未重绘人物。角色素材与第三方免费装饰素材分开记录；角色不属于 CC0 素材，相关名称与角色版权归原权利方，本站与官方无关联。

## 检索记录（历史，仅存档）

已检索：鸣潮 达妮娅 官方；鸣潮 达妮娅 立绘；鸣潮 达妮娅 壁纸；Wuthering Waves Denia；Denia transparent png；达妮娅 透明背景。相关镜像与官方发布页曾用于确认素材出处，相关文件已从站点移除。

后续新增的图片与音频来源继续记录在本文末尾。

## 星潮入梦：AI 共创背景

2026-09-15 使用内置 `image_gen` 工具，以用户本次立绘的浅粉、冰蓝和珍珠色作为配色参考生成无人物的星空海面。原始输出为 `public/artwork/dream-tide-original.png`（1536×1024），网页版本为 `public/artwork/dream-tide.webp`（约 149 KB）。用于首页背景与图集，图集标注「AI 共创」，不是官方游戏美术。最终完整提示词见 [IMAGE_PROMPT.md](IMAGE_PROMPT.md)。

免费第三方素材的授权、候选用途与实际接入状态见 [FREE_ASSETS.md](FREE_ASSETS.md)。

## Aemeath / Firefly 开源复用（MIT）

本地副本：`C:\workspace\refs\Aemeath`。许可证为 MIT（Copyright saicaca / CuteLeaf）。本站只复用主题能力，不搬运对方文章、头像与鸣潮角色立绘。

| 复用项 | 来源 | 本站位置 |
| --- | --- | --- |
| 鼠标 default.cur / pointer.cur | `public/mouse` | `public/mouse/` + `styles/mouse.css` |
| 樱花贴图与飘落逻辑 | `SakuraEffect.astro` | `components/effects/Sakura.tsx` |
| 霞鹜文楷 + 「文」切换 | `FontSetup.astro` / `FontSwitch.svelte` | `lxgw-wenkai-screen-webfont` + `FontSwitch.tsx` |
| 时间问候卡片 | `TimeGreeting.astro` | `components/home/TimeGreeting.tsx` |
| 三栏网格与资料卡 | `MainGridLayout.astro` | `HomeShell` / `anime-shell` |
| 首页开屏构图（快门 + 立绘 + 对开字 + 上掀） | `HomePortfolioIntro.astro` 与文《作品展示页动画实现原理》 | `components/effects/HomeIntro.tsx` |

开屏不搬运对方角色立绘、横幅与「鸣潮 / 往复」文案。人物用本站 `public/artwork/denia.webp`，上下条用已裁切的 Kuro 公开宣传图 `banner-top.webp` / `banner-bottom.webp`。

## 达妮娅桌面素材裁切（2026-09-15）

源目录：`C:\Users\freeing1\Desktop\达妮娅-网站素材`。运行 `node scripts/prepare-denia-assets.mjs` 可复现。官方宣传图仅裁切、缩放并编码为 WebP，未重绘人物。

| 本地文件 | 来源 | 用途 |
| --- | --- | --- |
| public/assets/denia/character/avatar.webp | generated/denia_gen_avatar.png 中心裁切 | 资料卡头像 |
| public/assets/denia/character/portrait.webp | official-reference/denia_official_profile_02.jpg 头像区 | 备用肖像 |
| public/assets/denia/character/stagecraft-crop.webp | official-reference/denia_official_profile_01.jpg | 立绘裁切 |
| public/assets/denia/gallery/classroom-dream.webp | generated/denia_gen_sleeping.png | 图集 |
| public/assets/denia/gallery/stagecraft.webp | denia_official_profile_01.jpg | 图集 |
| public/assets/denia/gallery/curtain-call.webp | denia_splash_01.jpg | 图集 |
| public/assets/denia/gallery/name-of-someone.webp | denia_wallpaper_desktop_01.jpg | 图集 |
| public/assets/denia/hero/banner-top.webp / banner-bottom.webp | denia_splash_01.jpg 上下条 | Hero 截景 |
| public/assets/denia/hero/celebration.webp | official-reference/denia_wallpaper_mobile_02.png | 首页精选、角色相册 |

未使用 `denia_splash_02_drip.jpg`（画面并非达妮娅）以及过长的技能说明长图。

## 风景壁纸（2026-09-15）

源目录在桌面「风景壁纸」（文件系统名可能是乱码 `椋庢櫙澹佺焊`）。运行 `node scripts/import-landscapes.mjs` 可复现：按子文件夹枫桥 / 海港 / 雪乡 / 雪地转为 WebP（最长边 1920，quality 82），写入 `public/gallery/landscapes/`，清单在 `data/landscape-import.json`。原图由站主提供，页面不标注外部作者。

## 追番数据

`data/bangumi.json` 由 `python scripts/fetch-bangumi.py` 从哔哩哔哩公开接口拉取，UID `41883170`（空间页 A1478L，Edge 历史中访问最多且存在 `/bangumi` 页面）。封面仍指向 `hdslb.com`，页面使用 `referrerPolicy="no-referrer"`。

## 新增页面与结构（P1）

| 路由 | 内容 | 数据来源 |
| --- | --- | --- |
| /categories/ 与 /categories/[slug]/ | 分类总览（带占比条）与分类详情 | 文章 frontmatter 的 category（缺省取第一个标签） |
| /tags/ 与 /tags/[slug]/ | 标签云（按频次分级）与标签详情 | 全部文章的 tags |
| /archive/ | 按年份归档，非最新年份折叠 | 文章日期 |
| /changelog/ | 站点更新日志，含版本徽标与 NEW/IMPROVE/FIX 分类 | data/changelog.ts |

导航扩到 10 项；窗口变窄时导航项按顺序隐藏（1280/1100/1060/960 四档），900px 以下换成展开式菜单。分类快捷栏（category-bar）出现在手记列表与归档页顶部。

搜索索引现在包含 页面 / 日志 / 分类 / 标签 / 文章 / 项目 / 图集 / 随记 八类，共 37 条，全部由内容源在构建期派生。

## 2026-09-15 新头像与语音

- `public/avatar.jpg`：用户本次上传的头像原图，512×512，未重绘。
- `public/audio/denia/zh/*.mp3`：Encore 资料库的达妮娅中文台词，来源及对应文本见 `data/denia-voices.json`，角色和音频版权归 Kuro Games。
- Kenney Particle Pack 已导入 CC0 星光与柔光素材，详见 `docs/FREE_ASSETS.md`。
- QQ 音乐歌单及封面来自用户指定的公开歌单，详见 `docs/MUSIC_INTEGRATION.md`。音源不保存到本站。

## 2026-09-16 Q 版开场动画

- 用户参考图：项目根目录的 `648dc880a408cad6dd3c11277beaac2b288340088.png`，抱西瓜的 Q 版人物。原图未改动。
- 新背景：内置 image_gen 生成的粉蓝水面/天空插画。网页文件 `public/artwork/intro/water-sky.webp`（65,294 字节）。
- Q 版角色：内置 image_gen 按用户图像生成透明背景版本。网页文件 `public/artwork/intro/denia-chibi.webp`（88,446 字节，保留 alpha）。不是官方新发布美术。
- 两份生成原图保留于 `assets/intro-originals/`，完整提示词见 `docs/INTRO_IMAGE_PROMPTS.md`。
- 网页将原立绘与透明 Q 版作为两张独立图层，用 CSS 3D 翻转过渡；素材不含烘焙动画。
