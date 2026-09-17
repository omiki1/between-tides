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

## 手记插图

两篇文章的插图由站主提供，转换后放在 `public/posts/`。原始文件不在仓库内。

| 本地文件 | 原始文件 | 原始尺寸 | 转换后 | 用途 |
| --- | --- | --- | --- | --- |
| public/posts/jwt-token-anatomy.webp | 站主提供（3.57 MB JPG） | 6952×4900 | 1600×1128，90 KB | 手记封面与正文插图（JWT） |
| public/posts/docker-layers.webp | 站主提供（1.36 MB PNG） | 803×1043 | 803×1043，109 KB | 手记封面与正文插图（Docker） |

转换规则：等比缩放到宽度上限（横幅 1600、竖幅保持原宽），WebP quality 82，不裁剪、不改变构图。横幅图从 3.57 MB 压到 90 KB，竖幅图从 1.36 MB 压到 109 KB。

## 装饰插图（知识图谱系列）

站主提供的八张壁纸，转换后放在 `public/gallery/kg/`，用作知识图谱系列的封面。原始文件约 20.8 MB，转换后合计 1.15 MB。

| 本地文件 | 原始尺寸 | 转换后 | 体积变化 |
| --- | --- | --- | --- |
| public/gallery/kg/bizhi.webp | 4096×2304 | 1600×900 | 1.25 MB → 200 KB |
| public/gallery/kg/Gv44.webp | 3840×2160 | 1600×900 | 3.49 MB → 134 KB |
| public/gallery/kg/tumblr-2796.webp | 4094×2580 | 1600×1008 | 7.32 MB → 137 KB |
| public/gallery/kg/tumblr-ed95.webp | 2048×1971 | 1400×1347 | 0.77 MB → 142 KB |
| public/gallery/kg/a8f213.webp | 2000×1402 | 1600×1122 | 2.57 MB → 141 KB |
| public/gallery/kg/yande-569346.webp | 4092×2893 | 1600×1131 | 4.18 MB → 103 KB |
| public/gallery/kg/yande-570868.webp | 1500×1060 | 1500×1060 | 0.28 MB → 111 KB |
| public/gallery/kg/leila-02.webp | 3500×2509 | 1600×1147 | 1.41 MB → 198 KB |

转换规则：等比缩放到宽度 1600 或原宽（取小），WebP quality 80，不裁剪、不改变构图。

**素材版权边界：** 这批图片含 Fate 系列与《亡国的阿基德》的同人 / 官方宣传图，属于个人非商业展示用途。与站点代码的许可证无关，不随代码分发。页面上的站内链接与转载建议参考 `config/site.ts` 的 copyright 字段说明。

## 概念图

知识图谱系列的技术图解**不是外部素材**，而是由本站的程序化生成器产出，因此与上面的摄影 / 插画性质不同：

- 生成器：`scripts/diagrams/kit.mjs`（SVG 图元库）+ `scripts/diagrams/NN-*.mjs`（各篇的图定义）
- 渲染：`node scripts/diagrams/render.mjs` → `public/posts/kg/*.webp`
- 版面自检：`node scripts/diagrams/check.mjs`

目前共 19 张，按篇分配：

| 篇目 | 图 |
| --- | --- |
| 00 总览 | `00-tech-stack`、`00-kg-vs-vector`、`00-pipeline` |
| 01 知识表示 | `01-representation-timeline`、`01-rdf-triple` |
| 02 知识建模 | `02-ontology-vs-schema`、`02-modeling-flow` |
| 03 知识抽取 | `03-extraction-tasks`、`03-ner-timeline` |
| 04 命名实体识别 | `04-ner-type-system`、`04-ner-open-problems` |
| 05 关系抽取 | `05-re-paradigms`、`05-distant-supervision-noise` |
| 06 事件抽取 | `06-relation-vs-event`、`06-event-graph-layers` |
| 07 知识融合 | `07-fusion-pipeline`、`07-blocking` |
| 08 表示学习与 KG×LLM | `08-onehot-to-dense`、`08-graphrag-vs-vector` |

配色取自 `styles/tokens.css` 的浅色主题取值并固定使用：文章插图不随主题反色是站点的既有约定，浅底深字在深色页面上表现为一张纸片，在浅色页面上与正文融为一体，两种主题下都可读。

### 校验能覆盖什么、不能覆盖什么

`scripts/diagrams/check.mjs` 检查四类问题：文字纵向越界、文字横向溢出、卡片部分重叠、图注与底边的余量。它**检查不出元素遮挡**（例如一个说明块压在另一块卡片上），这类问题只能靠几何测量或栅格化渲染确认。改动图解后如果拿不准，建议渲染出来看一眼。

`scripts/check-image-dims.mjs` 校验 Markdown 图片标题里的尺寸标注与文件实际尺寸一致。这个标注决定 `lib/markdown.ts` 是否给 `figure` 加 `is-tall`，写错会让竖幅图被当成横幅处理。**新增或修改图解后必须重新核对标注**，因为渲染出的高度取决于内容，无法预先估准。

### 两处已知的口径说明

- `03-ner-timeline` 里的 F1 数值是各代方法在通用英文基准上的代表性结果，**不是同一张评测表的连续读数**，口径并不统一。图注里已写明这一点，正文引用时不应把它当作可直接比较的序列。
- `04-ner-type-system` 的八个细分类口径随语料库而异（不同标注规范下的划分方式不同），图中给出的是常见做法。

关于各图承担的教学任务与「封面横幅取景」的实测换算，见本文件末尾的相关章节。

**竖幅处理说明：** Docker 篇的插图宽高比是 0.77，在 740px 正文列宽下会被拉到接近 1000px 高。因此 `lib/markdown.ts` 支持从 Markdown 图片标题读取尺寸（`![alt](/path "803x1043")`），宽高比小于 1 时给 `figure` 加 `is-tall` 类，由 `app/globals.css` 在桌面端限宽到 60% 并居中。

### 封面横幅的取景（coverPosition）

文章页顶部横幅是固定 330px 高的容器加 `object-fit: cover`，实际只显示原图纵向一小段。竖幅图（803×1043）在约 1040px 宽的容器里缩放系数由宽度决定（1.295），图高被拉到 1351px，**只露出原图纵向 24.4%**；横幅图（1600×1128）露出 45%。所以 `object-position` 的取值直接决定画面里留下什么。

用逐行像素统计定位主体（每行的亮度、饱和度与肤色像素占比）：

| 文章 | 肤色密度峰值区间（原图纵向） | coverPosition | 实际显示区间 |
| --- | --- | --- | --- |
| JWT | 21%–33% | `center 24%` | 13.2%–58.2%，主体完整，上方留白约占可视高度 17% |
| Docker | 41%–51% | 不使用横幅（`hideCover: true`） | — |

**Docker 篇为什么不放横幅：** 主体在图片纵向 41%–51% 处，而横幅只能显示 24.4% 的高度。要完整容纳主体，取景必须落在 30%–55% 之间，可选的 `object-position` 区间很窄；而顶部 0%–10% 是浅色背景（肤色像素 0%），从顶部取景只能拍到头发。因此这一篇直接在 frontmatter 里 `hideCover: true`，封面图仍保留给列表页缩略图，正文里以正常插图呈现。

排查方法可复现：对图片逐行统计亮度、饱和度与肤色像素占比，定位主体所在的纵向区间，再按下表查对应的取景位置。

Docker 封面 803×1043 在 1040×330 容器里的实测换算（缩放后 1040×1351，可移动余量 1021px）：

| coverPosition | 显示原图纵向区间 | 主体（41%–51%）是否完整 |
| --- | --- | --- |
| `0%`（top） | 0.0%–24.4% | 否，只有顶部背景与头发 |
| `20%` | 15.1%–39.5% | 否，主体刚好被下边缘切掉 |
| `35%` | 26.4%–50.9% | 是，上方留白约占可视高度 60% |
| `40%` | 30.2%–54.7% | 是，上方留白约占可视高度 44% |
| `50%`（默认） | 37.8%–62.2% | 是，但主体几乎贴顶 |
| `60%` | 45.3%–69.8% | 否，头顶被切 |

这张表的用处不只是记录结论：以后换图时，先统计新图的主体区间，再在这类表里找落到合适留白的值即可，不需要反复试。

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

## MediAtlas 界面截图（2026-09-16）

来源：站主提供的本地运行截图，目录 `C:\Users\freeing1\Desktop\33`。仅缩放并编码为 WebP，放入 `public/projects/mediatlas/`，用于项目正文说明，不是医疗宣传材料。

| 本地文件 | 原文件 | 画面 |
| --- | --- | --- |
| public/projects/mediatlas/login.webp | QQ20260916-121840.png | 登录页 |
| public/projects/mediatlas/workspace.webp | QQ20260916-121924.png | 知识问答工作台 |
| public/projects/mediatlas/answer.webp | QQ20260916-122704.png | 带出处编号的回答 |
| public/projects/mediatlas/source.webp | QQ20260916-122717.png | WHO 来源详情 |

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
