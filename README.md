# 汐间 / BETWEEN TIDES

一个安静的数字花园：手记、项目、图集、随记与一小段环境音。Denia 透明立绘、粉色星空、水面涟漪与折射玻璃组成首页梦境。

内容以 Markdown / TypeScript / JSON 存放，Next.js 在构建期生成完整静态站点，部署时只需要一个静态文件服务器。

## 开始

```bash
npm install
npm run dev        # http://127.0.0.1:3000
```

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地开发（Next.js 16 + Turbopack） |
| `npm run build` | 生产构建，同时导出静态站点到 `out/` |
| `npm run start` | 以生产模式运行构建结果 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run verify` | 构建 + `scripts/verify-export.mjs` 导出结构检查 |

> 在 Windows PowerShell 中 npm 可能被执行策略拦住，可以改用 `npm.cmd` 或直接调用 `node node_modules/next/dist/bin/next build`。

## 目录

```
app/                路由：首页、blog、projects、gallery、notes、about，以及 rss/sitemap/robots/search.json
components/         home 首页区块、layout 框架、blog 阅读、gallery 灯箱、projects、search、effects、ui
config/site.ts      站点名称、导航、社交、音乐、NOW 状态、版权说明
content/posts/*.md  手记（frontmatter：title、description、date、tags、cover、featured）
content/notes/notes.json  随记时间线
data/               项目与图集的类型化数据
lib/                内容读取、Markdown 渲染、目录抽取、搜索索引
styles/tokens.css   深浅两套语义色 token
docs/               视觉方向、参考调研、素材来源、实现记录
scripts/            导出校验、链接检查、类名交叉检查等静态脚本
```

## 内容要点

- 首页：Hero（透明立绘、梦境海面、玻璃光环、视差 ≤8px、五次点击泡泡）→ 状态/音乐条 → 精选文章 → 项目 → 图集 → 随记 → Footer。
- 视觉基调：泡沫、星夜、月光与水面折射；粉色是光，冰蓝是水，玻璃是介质（`docs/VISUAL_DIRECTION.md`）。
- 手记：740px 正文、17px 中文、1.95 行高，目录与正文同源，上一篇/下一篇，`BlogPosting` JSON-LD。
- 图集：按 梦境 / 潮汐 / 星夜 筛选，自适应网格 + 原生 `<dialog>` 灯箱，方向键与 Esc 可用，关闭后焦点回到触发按钮。
- 搜索：`Cmd/Ctrl + K` 打开，索引来自同一批内容源，构建期生成 `/search.json`。
- 主题：完整语义 token，深浅两套各自设计；图片不反色。

## 素材与版权

- 图集里的五张画面由站主提供，已转为 WebP 放在 `public/gallery/`，属于站点自己的视觉，页面上不标注外部作者（记录见 `docs/ASSET_SOURCES.md`）。
- 播放器中的音频是本站用程序合成的原创环境音示例，不标注为鸣潮 OST。
- 首页使用站主本次提供的 Denia 立绘，原图保留在 `public/artwork/denia-original.png`，网页版本为 `public/artwork/denia.webp`。角色版权归原权利方，本站与官方无关联。
- 未知的社交账号与邮箱不虚构，`config/site.ts` 中留空即代表页面上不显示。
- 不使用 AI 生成图片冒充官方素材；运行时图片全部为本地路径。

详细记录见 `docs/ASSET_SOURCES.md`、`docs/VISUAL_DIRECTION.md` 与 `docs/BUILD_NOTES.md`。
