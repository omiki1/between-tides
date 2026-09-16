# 实现记录 — 汐间 / BETWEEN TIDES

记录首页之后补齐的页面、内容管线与验收方式。目标是让下一个人（或下一次的自己）不必重新推理一遍。

## 站点结构

| 路由 | 类型 | 内容来源 |
| --- | --- | --- |
| `/` | 静态 | `components/home/*` |
| `/blog/` | 静态 | `content/posts/*.md` + `lib/posts.ts` |
| `/blog/[slug]/` | SSG（`generateStaticParams`） | 同一份 Markdown，服务端渲染为 HTML |
| `/projects/` | 静态 | `data/projects.ts` |
| `/gallery/` | 静态 | `data/gallery.ts`（客户端负责筛选与灯箱） |
| `/notes/` | 静态 | `content/notes/notes.json` + `lib/notes.ts` |
| `/about/` | 静态 | `config/site.ts` |
| `/search.json` | 静态 Route Handler | `lib/search.ts` |
| `/rss.xml`、`/sitemap.xml`、`/robots.txt` | 静态 Route Handler | `lib/posts.ts` + `config/site.ts` |
| `/api/visits` | Cloudflare Worker + KV | `worker/index.ts`，绑定 `VISITS`（`omiki1-home-visits`） |

`next.config.ts` 使用 `output: "export"`、`images.unoptimized: true`、`trailingSlash: true`，因此所有路由必须在构建期完成：动态路由必须提供 `generateStaticParams`，Route Handler 必须声明 `export const dynamic = "force-static"`（参考 `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`）。

## 内容管线

Markdown 在构建期由 `lib/markdown.ts` 转成 HTML：`remark-parse` → `remark-gfm` → `remark-math` → `remark-rehype` → `rehype-slug` → `rehype-highlight` → `rehype-katex` → `rehype-stringify`。三个自定义 handler 决定输出形态：

- `image`：包成 `<figure class="prose-figure">`，`figcaption` 保留 alt 文本里的署名；外链图片额外给出「原始文件 ↗」。
- `paragraph`：只包含一张图片的段落直接输出 figure，避免 `<p><figure>` 这种非法嵌套。
- `link`：外链自动带 `target="_blank"` 与 `rel="noreferrer noopener"`。

原始 HTML 不执行（`allowDangerousHtml:false`），KaTeX 的字体与样式来自 `katex/dist/katex.min.css`，代码高亮的 hljs 类名在 `app/globals.css` 中用站点 token 重新着色，而不是引入现成主题。

目录（TOC）与正文来自同一次渲染：`extractHeadings` 从生成的 HTML 里读取 `<h2>/<h3>` 的 id 与文本，因此锚点不会和 `rehype-slug` 的结果脱节。搜索结果同样从内容源派生（`lib/search.ts` 汇总文章、项目、图集、随记与页面），没有第二份手工维护的索引。

新增内容时只需要：

- 新文章：往 `content/posts/` 放一个带 frontmatter（`title`、`date` 必填）的 `.md`，路由、RSS、sitemap、搜索索引会自动包含。
- 新随记：往 `content/notes/notes.json` 追加一条 `{id,date,text,tags}`。
- 新图片：加入 `data/gallery.ts` 并同时在 `docs/ASSET_SOURCES.md` 记录作者与原始链接。

## 交互实现

- 访客量：布局里的 `VisitRecorder` 在进页后请求 `/api/visits`。同一浏览器（IP + UA 指纹）只加一次，计数存在 KV `omiki1-home-visits`。本地 `next dev` 没有 Worker，改记在 `localStorage`。首页和追番页的「站点速记」读取同一个数字。
- 搜索：`components/search/SearchDialog.tsx`，原生 `<dialog>`，`Cmd/Ctrl + K` 或导航栏按钮打开，`↑ ↓` 选择、`Enter` 打开、`Esc` 关闭；索引按需 `fetch("/search.json")`，加载失败时退化为站点栏目导航提示。
- 灯箱：`components/gallery/GalleryBoard.tsx` 内嵌 `<dialog>`，方向键切换、Esc 关闭（原生行为）、关闭后焦点回到触发按钮；图集卡片使用固定宽高避免布局跳动。
- 入场动效：`components/effects/Reveal.tsx` 统一 0.55s / 14px；`Providers` 的 `MotionConfig reducedMotion="user"` 与 `@media (prefers-reduced-motion)` 共同保证弱动效偏好生效。
- 阅读页：顶部进度条按滚动比例缩放；右侧 TOC 用 IntersectionObserver 标注当前位置，移动端折叠到正文下方。

## 视觉改版（泡沫与星夜）

### 色彩

- `styles/tokens.css` 全部重写：深色主题＝星夜紫蓝（底色 #0a0a17，粉色 #f6d5e4 / #efb6d2 作为强调，冰蓝 #a9d8f0 作为按钮与折射），浅色主题＝粉白梦境（#f7f3f8 底、白色浮层、#8f4a6c 粉、#1e6089 冷蓝）。25 个语义 token，深浅各自设计。
- 粉色升为主强调色：焦点环、当前导航项、链接 hover、TOC 当前项、状态标记、项目标记。主按钮仍是冰蓝底 + 深色字（`docs/VISUAL_DIRECTION.md` 的原始约束保持不变），粉色出现在它的图标里。
- 标题第二段使用粉→冰蓝渐变裁字（`.hero h1>span`、`.page-head h1>span`），是整站唯一的渐变文字。
- 环境光 `components/effects/AmbientBackground.tsx` 改为三层径向渐变（粉光 + 蓝光 + 底部粉光）+ 58 秒慢漂移；星点改为粉色带光晕。

### 结构

- Hero 去掉角色立绘，改为玻璃画框（图集作品 + 径向遮罩 + 屏幕混合高光）、TIDES 大字、两圈轨道、粉光泡泡与潮汐私语；`config/site.ts` 的 `hero.image` 不再使用，`characterTheme` 改为潮汐文案。
- 图集改为自适应网格（`repeat(auto-fit,minmax(290px,1fr))`，1100px 以下 260px 下限，700px 以下单列），五张新图；分类改为 梦境 / 潮汐 / 星夜。
- 图集与图集预览不再显示作者与原始出处；`data/gallery.ts` 的 `Photo` 类型去掉 `author` / `source`，增加 `english`。
- 移除的素材：`public/assets/denia/`（角色立绘）、`public/gallery/lake|stars|mountains.webp`、`fairytale.webp`；引用它们的正文、封面与随记配图已全部替换。

### 主要文件

`styles/tokens.css`、`app/globals.css`（约 51.9k 字符，含全部内页样式）、`components/home/Hero.tsx`、`components/home/GalleryPreview.tsx`、`components/gallery/GalleryBoard.tsx`、`data/gallery.ts`、`config/site.ts`、`app/gallery/page.tsx`、`app/about/page.tsx`、`lib/search.ts`、`content/posts/*.md`、`content/notes/notes.json`。

### 改版期间修掉的问题

1. `next dev` 在编辑过程中往 `app/globals.css` 里注入过一条损坏规则（`.resonating .orbit` 前被加上模块前缀 `10695.`），导致开发服务器 500。已清除，并在 `scripts/clean-artifacts.mjs` 里留了检测手段。
2. 图集原先用 CSS `columns` 瀑布流，五张横向图会变成"读起来像分栏"的效果；改为自适应网格。
3. 立绘移除后，`@media` 里针对 `.character-image` 的定位规则会把画框推出视口，已一并重写。

### 改版后的实测

- `visual-audit.mjs`：164 / 164 通过（八视口 × 七页面 + 全局交互）。
- 对比度实测（浅色模式）：最低 4.94:1；（深色模式）：最低 9.44:1，均达 WCAG AA。
- 主题切换实测：深色 `rgb(10,10,23)` ↔ 浅色 `rgb(247,243,248)`，正文颜色 `rgb(44,35,64)`。
- 截图面色统计（`check-shots.mjs`）与改版前对比：首页 1440 的粉色像素占比 0.26% → 1.48%，深色平均亮度 22.4 → 34.3，色彩数 703 → 1116；图集 1440 色彩数 1833 → 2007。

## P1：内容骨架对齐（分类 / 标签 / 归档 / 更新日志）

参考站（朝朝听雨，Firefly 主题定制版）的导航里有 归档 / 分类 / 标签 三条入口。本站补齐这一层，并加了一个更新日志页。

### 新增路由

| 路由 | 说明 |
| --- | --- |
| `/categories/`、`/categories/[slug]/` | 分类总览（占比条）与分类详情；分类名来自 frontmatter 的 `category`，缺省取第一个标签 |
| `/tags/`、`/tags/[slug]/` | 标签云（按频次分级）与标签详情；`slugify()` 统一生成 URL 片段，中文标签同样可用 |
| `/archive/` | 按年份归档；最新年份展开，其余年份用 `<details>` 折叠 |
| `/changelog/` | 更新日志，数据在 `data/changelog.ts`，条目带 NEW / IMPROVE / FIX 徽标 |

### 结构改动

- 新增 `components/blog/PostRow.tsx`（卡片式文章行）与 `components/blog/CategoryBar.tsx`（分类快捷栏，出现在手记列表与归档页顶部）。
- 文章页新增分类与标签互链：正文头部有分类锚点，下面是一排可点击的标签 chip，侧栏多了一张分类卡片。
- 导航扩到 10 项，窗口变窄时按顺序隐藏（1280 / 1100 / 1060 / 960 四档），900px 以下切到展开式菜单。
- 页脚加入更新日志入口；sitemap、`search.json`、`scripts/verify-export.mjs`、`scripts/visual-audit.mjs` 全部同步扩充。搜索索引现在有八类共 37 条。

### 分页为什么没做

`/blog/page/[page]/` 会与 Next.js 16 生成的 typed route 冲突（目录名里的 `[page]` 让 `PageProps<"/blog/page/[page]">` 无法解析），而且当前只有 3 篇文章，分页没有任何实际收益。已移除该路由、`components/blog/Pagination.tsx` 与相关样式；`config/site.ts` 保留了 `pagination: { postsPerPage: 12 }` 作为将来扩充的配置位。

### 本次修掉的三个问题

1. **Hero 改造留下的整片死代码**：Hero 改用 `Hero.module.css` 后，`globals.css` 里 `.hero`、`.hero-art`、`.character-word` 等规则不再匹配任何元素，我上一轮修的移动端溢出防护也跟着失效（768px 实测 `scrollWidth` 787 > 768，390px 实测 409 > 390）。处理：把 Hero 相关规则整体迁到模块文件，`Hero.module.css` 的 `.scene` 改为 `overflow: clip`，并从全局表里删掉 89 条失效规则。
2. **样式表被脚本改坏**：批量删除规则时留下了两个残片（一条 `.resonating .orbit` 被 dev server 加上模块前缀、一处 `.light ` 悬在 `@media` 前面），导致开发服务器 500。处理：修好并新增 `scripts/check-css.mjs`——检查花括号配对、空选择器、悬空组合符、`@media` 嵌套与重复属性，现在已并入改动流程。
3. **语音目录是空的**：`data/denia-voices.json` 引用的 4 个 mp3 并不存在（`public/audio/denia/zh/` 为空），任何引用都会 404。处理：新增 `scripts/fetch-voices.mjs` 从 JSON 记录的镜像地址下载，4 条全部就位（真实 MP3，38–75KB），来源记入 `docs/ASSET_SOURCES.md`。

### 新增脚本

| 脚本 | 用途 |
| --- | --- |
| `scripts/check-css.mjs` | 样式表结构体检，替代肉眼检查批量编辑 |
| `scripts/fetch-voices.mjs` | 按 `data/denia-voices.json` 下载语音到 public |
| `scripts/outline-site.mjs` | 解析任意站点的路由、地标与 class 词表，用于结构调研 |
| `scripts/page-content.mjs` | 抽取远端页面正文，用于对比信息架构 |
| `scripts/wide-elements.mjs` | 指定视口下列出真实溢出元素与宽度 |
| `scripts/analyse-images.mjs` | 无视觉输入时统计图片主色、亮度与粉蓝占比 |
| `scripts/apply-pairs.mjs` | 批量字面替换并逐条报告命中，供脚本化改样式使用 |

## 验收

```bash
node node_modules/next/dist/bin/next build   # 生产构建 + 静态导出
node scripts/verify-export.mjs               # 导出的每个页面是否包含应有的结构
node scripts/check-links.mjs                 # 站内链接与静态资源是否都能落到真实文件
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js .
node scripts/check-classes.mjs               # 组件类名与样式表的交叉检查

# 真实浏览器验收（需要 Chrome/Edge，以及一个正在运行的服务）
node scripts/visual-audit.mjs http://127.0.0.1:3000 --out .research/shots
node scripts/check-shots.mjs                 # 截图是否有渲染内容，防止"空白页"被当成通过
```

`package.json` 里的 `npm run verify` 等于构建加导出检查。

`visual-audit.mjs` 用 CDP 直接驱动本机 Chrome（不依赖浏览器插件授权），在 1440 / 1280 / 1024 / 768 / 430 / 390 / 375 / 1920 八个视口上打开全部 7 个页面，实际测量而不是目测：

- 横向溢出（`body.scrollWidth`，并列出真实溢出元素，排除被 `overflow: clip`/`hidden` 裁掉的环境装饰）；
- 阅读页栅格（1440 下 `740px + 250px`，≤1100 收成单列）、正文 17px / 移动端 16px、figure 为块级、KaTeX 与代码高亮存在、TOC 锚点全部能解析到正文 id；
- 首页状态区栅格、音乐面板是否落在视口内、hero 高度；
- 图集瀑布流列数与图片固有宽高、说明文字完整；
- 灯箱：打开、方向键前后切换、关闭、焦点回到触发按钮、署名文字；
- 搜索：`Ctrl+K` 打开、输入后出结果、`↑` 改变选中项、关闭；
- 主题切换：`light` 类生效、背景色确实改变并能切回；
- 浅色/深色下 8 处文字与背景的对比度（按 WCAG AA：小字 4.5、大字 3.0）；
- `:focus-visible` 焦点环宽度与样式；
- `prefers-reduced-motion: reduce` 下过渡为 0s、星点动画为 none、`scroll-behavior: auto`。

已实际执行并记录：

- 生产构建通过，Turbopack 无 CSS 警告，导出 15 个页面/资源（首页、6 个内页、3 篇文章、404、`rss.xml`、`sitemap.xml`、`robots.txt`、`search.json`）。
- `scripts/visual-audit.mjs`：**272 / 272 检查通过**（Chrome 153，八个视口 × 十二个页面 + 全局交互项）。
- `scripts/check-shots.mjs`：21 张整页截图（1440 / 768 / 390）全部有渲染内容，不是空白页。
- `scripts/verify-export.mjs`、`scripts/check-links.mjs` 全部通过；TypeScript 与 ESLint 无错误（仅剩模板自带的 `postcss.config.mjs` 匿名导出提示）。
- 首轮浏览器验收发现了两个真实缺陷并已修复：
  1. 1024px 与 768px 视口下 hero 立绘右移 7–36px，造成横向滚动条（`home@1024` 的 `scrollWidth` 1031 > 1024）。修复：`.hero` 与 `.hero-art` 使用 `overflow-x: clip`（不产生滚动容器），并把 1100px 断点下的立绘从 545px 收到 505px。
  2. 灯箱关闭后焦点依赖浏览器原生 dialog 行为；现在显式把焦点交还给触发按钮。
- 对比度实测：文章页浅色模式最低 4.94:1，深色模式最低 6.15:1，均达到 WCAG AA。

截图与审计脚本都不进入发布产物：`.research/` 与 `out/` 均在 `.gitignore` 中。

一个可以随手复现的静态阅读工具：`node scripts/read-export.mjs blog/rag-as-a-map/index.html text`（`summary` 看图片与标题统计，`raw <关键字>` 看原始片段）。

未完成或未测量的部分，明确记录如下：

- 截图是在本机 headless Chrome（Chrome 153，Windows）里生成的，尺寸与亮度统计已核对，但没有人眼逐张看过的记录；如果对观感有疑问，`.research/shots/` 里有 1440 / 768 / 390 的整页图可以直接打开。
- 音频播放没有实际听过：`MusicPlayer` 的播放/切歌/进度逻辑没有自动化断言，需要手动点一次确认。
- Lighthouse 分数未测量，因此不作任何分数声明。
- 只测了 Chrome 一种引擎；Safari/Firefox 的 `overflow: clip`、`columns + break-inside` 表现未实测（两者在 Safari 16.4+ / Firefox 111+ 均受支持）。

`docs/VISUAL_DIRECTION.md` 中的验收要求仍然有效：先首页后内页、实际浏览多个视口、检查浅色模式与键盘路径。
