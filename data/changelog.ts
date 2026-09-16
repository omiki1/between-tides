export type ChangeKind = "new" | "improve" | "fix";
export type Change = { kind:ChangeKind; text:string };
export type ChangelogEntry = {
  version:string;
  date:string;
  title:string;
  summary:string;
  highlights:string[];
  changes:Change[];
};
/**
 * 站点更新日志。记录真实发生过的改动，不写未完成的计划。
 * 新增条目放在数组最前面。
 */
export const changelog:ChangelogEntry[]=[
  {
    version:"0.9.0",
    date:"2026-09-16",
    title:"项目页换成真实履历",
    summary:"用 MediAtlas 与 stu 练习仓库替换原先的示例项目，按一条学习线写成可核对的履历。",
    highlights:["MediAtlas","知识图谱","RAG 实验"],
    changes:[
      { kind:"new", text:"当前重点改为 MediAtlas：从医疗疾病库做到带证据门槛的医学问答工作台。" },
      { kind:"new", text:"补上 stu-neoj4 疾病图谱、stu_rag 检索实验、stu_agent 学习工程、stu_fastapi 验证码服务。" },
      { kind:"improve", text:"去掉 Tide Agent、Echo Deck、Quiet Signal 三则占位项目；未公开的仓库不虚构链接。" },
      { kind:"new", text:"每个项目可以点进独立正文：架构、数据和与其他练习如何接上。" },
      { kind:"new", text:"首页、导航和资料卡附上 GitHub @omiki1；MediAtlas 与 Agent 学习工程链到对应公开仓库。" },
      { kind:"improve", text:"QQ 音乐改为官方外链播放器，不再依赖本地 :3200 代理。" },
      { kind:"improve", text:"撤下手记《在喧闹的世界里，做一个安静的界面》。" },
      { kind:"new", text:"打开网站默认播放导入的 QQ 歌单；浏览器拦截时点一下页面即可开始，可关掉进页播放。下次访问记住选择。" },
      { kind:"improve", text:"进页默认播放 Kyoto’s Jam；站点标题改为「汐间花园」。" },
      { kind:"new", text:"站点速记增加访客量：同一浏览器只记一次，数据存在 Cloudflare KV。" },
      { kind:"new", text:"MediAtlas 正文补上登录页、工作台、带出处回答和来源详情四张界面截图。" },
      { kind:"improve", text:"MediAtlas 卡片改成直接写工作台本身；音乐手记改成和 QQ 歌单一致。" },
    ],
  },
  {
    version:"0.8.0",
    date:"2026-09-15",
    title:"首页开场：达妮娅立绘与快门入场",
    summary:"参照 Aemeath 开屏的快门构图，用首页达妮娅透明立绘和鸣潮宣传裁切条做汐间自己的进场动画。同一会话只播一次，可跳过。",
    highlights:["开场动画","达妮娅立绘","快门转场"],
    changes:[
      { kind:"new", text:"首次打开首页播放开场：上下快门滑入、达妮娅立绘升起、「伪物弥留 / 蚀刻繁彩」对开，随后整幕上掀。" },
      { kind:"new", text:"素材用本站已有的 denia.webp 透明贴图，以及官方宣传图裁出的 banner-top / banner-bottom。" },
      { kind:"improve", text:"开场大字改为达妮娅固有技能「伪物弥留」「蚀刻繁彩」，两字一行以免挡住立绘。" },
      { kind:"improve", text:"尊重减少动效；Esc、点击或「跳过」可立刻结束；sessionStorage 避免同一次访问重复播放。" },
    ],
  },
  {
    version:"0.7.0",
    date:"2026-09-15",
    title:"相册分子模块，达妮娅庆典图上首页",
    summary:"桌面风景壁纸按枫桥、海港、雪乡、雪地分成独立相册；原有梦境、潮汐、星夜、角色也改成相册卡片。首页放入鸣潮 2 潮声庆典竖版达妮娅图。",
    highlights:["风景壁纸","相册模块","潮声庆典"],
    changes:[
      { kind:"new", text:"相册首页改为收藏 / 风景壁纸两组模块，每个子相册单独一页。" },
      { kind:"new", text:"从桌面风景壁纸文件夹导入枫桥、海港、雪乡、雪地共 18 张。" },
      { kind:"new", text:"首页精选放入 Kuro Games《群星，因你闪耀》竖版宣传图，并记入角色相册。" },
    ],
  },
  {
    version:"0.6.0",
    date:"2026-09-15",
    title:"复用 Aemeath 的字体、鼠标与构图",
    summary:"从开源主题 Aemeath / Firefly（MIT）搬入霞鹜文楷、自定义光标、樱花与三栏小部件框架。",
    highlights:["霞鹜文楷","自定义鼠标","樱花与时间问候"],
    changes:[
      { kind:"new", text:"接入 LXGW WenKai Screen，导航栏「文」可切回 Manrope；默认与 rainzt.cn 一样走文楷。" },
      { kind:"new", text:"搬入 Aemeath 的 default/pointer 光标，以及樱花飘落画布（尊重减少动效）。" },
      { kind:"new", text:"首页与追番改为左资料 / 中内容 / 右问候时钟的三栏构图，时间问候卡片来自 Firefly 小组件。" },
      { kind:"improve", text:"导航改成浮在页面上的圆角玻璃条，更接近 Aemeath 顶栏。" },
    ],
  },
  {
    version:"0.5.0",
    date:"2026-09-15",
    title:"靠近 Aemeath：侧栏、达妮娅裁切与追番",
    summary:"首页改成 Firefly / Aemeath 式的资料卡与侧栏小部件，并把哔哩哔哩公开追番写进独立页面。",
    highlights:["双侧内容布局","追番页","达妮娅素材裁切"],
    changes:[
      { kind:"new", text:"新增 /anime/ 追番页：253 部来自哔哩哔哩空间 A1478L 的公开追番，含类型筛选、搜索、分页与详情。" },
      { kind:"new", text:"首页加入资料卡、今日短句、日历、站点速记、正在追与分类侧栏，结构靠近 rainzt.cn / Aemeath。" },
      { kind:"new", text:"从桌面达妮娅素材包裁出头像、舞台构形、落幕与壁纸条，用于 Hero、资料卡与图集。" },
      { kind:"improve", text:"导航加入追番；关于页补上哔哩哔哩空间；搜索、sitemap 与导出检查同步覆盖新页面。" },
    ],
  },
  {
    version:"0.4.0",
    date:"2026-09-15",
    title:"内容骨架与视觉定型",
    summary:"补上分类、标签、归档三层内容结构，并把全站配色收到泡沫与星夜的粉色基调上。",
    highlights:["分类 / 标签 / 归档","粉色主强调色","Hero 梦境场景"],
    changes:[
      { kind:"new", text:"新增 /categories/ 与 /categories/[slug]/，分类由文章标签自动推导，页面上带占比条。" },
      { kind:"new", text:"新增 /tags/ 标签云与 /tags/[slug]/ 标签详情，标签按出现频次分级显示。" },
      { kind:"new", text:"新增 /archive/ 归档页，按年份分组，非最新年份默认折叠。" },
      { kind:"new", text:"新增 /changelog/ 更新日志（就是本页），以及 sitemap 中的分类与标签地址。" },
      { kind:"improve", text:"导航从 6 项扩展为 9 项，移动端改为展开式菜单。" },
      { kind:"improve", text:"Hero 改为玻璃画框与梦境场景，加入流星、水波纹、泡泡与视差。" },
      { kind:"improve", text:"全站语义 token 重写：深色为星夜紫蓝，浅色为粉白梦境，粉色升为主强调色。" },
      { kind:"fix", text:"修复 1024px 与 768px 下 Hero 立绘导致的横向溢出。" },
      { kind:"fix", text:"修复灯箱关闭后焦点未回到触发按钮的问题。" },
    ],
  },
  {
    version:"0.3.0",
    date:"2026-09-15",
    title:"图集换成站点自有画面",
    summary:"旧的外部摄影全部移除，滑入五张站点原创画面，并据此确定配色。",
    highlights:["五张站点画面","原生 dialog 灯箱","WebP 压缩"],
    changes:[
      { kind:"new", text:"图集改为自适应网格，共六张画面，支持分类筛选与方向键切换。" },
      { kind:"new", text:"图集与手记封面统一使用本地 WebP，总体积从 8.7MB 降到 0.6MB。" },
      { kind:"improve", text:"图集不再显示外部作者与转载链接，改为站点自有的氛围分类。" },
      { kind:"fix", text:"移除公共目录里的空目录与失配引用，导出产物不再包含死链。" },
    ],
  },
  {
    version:"0.2.0",
    date:"2026-09-15",
    title:"内页与阅读体验",
    summary:"把导航里指向的六个入口全部补齐，建立完整的阅读、检索与图片浏览路径。",
    highlights:["六个内页","Cmd+K 搜索","RSS / sitemap"],
    changes:[
      { kind:"new", text:"补齐 /blog/、/blog/[slug]/、/projects/、/gallery/、/notes/、/about/ 六个页面。" },
      { kind:"new", text:"新增站内搜索（Cmd/Ctrl + K），索引由内容源在构建期生成。" },
      { kind:"new", text:"新增 RSS、sitemap.xml、robots.txt 与 404 页面。" },
      { kind:"new", text:"文章页加入阅读进度、目录、上一篇/下一篇与 BlogPosting 结构化数据。" },
      { kind:"improve", text:"Markdown 管线接入 GFM、KaTeX 与代码高亮，图片自动包成带署名的 figure。" },
    ],
  },
  {
    version:"0.1.0",
    date:"2026-09-15",
    title:"首页与设计基调",
    summary:"从零搭起静态站点骨架，确定深色基底、玻璃层次与克制动效。",
    highlights:["Next.js 静态导出","语义 token","0.55s 入场动效"],
    changes:[
      { kind:"new", text:"建立 Next.js 16 + React 19 的静态导出骨架，内容存放于 Markdown、TypeScript 与 JSON。" },
      { kind:"new", text:"首页完成 Hero、状态/音乐条、精选文章、项目、图集、随记六个区块。" },
      { kind:"new", text:"建立深浅两套语义 token 与统一的 0.55 秒入场动效。" },
      { kind:"new", text:"加入环境背景、泡泡交互与本站原创环境音播放器。" },
    ],
  },
];
export const changeLabels:Record<ChangeKind,string>={new:"NEW",improve:"IMPROVE",fix:"FIX"};
