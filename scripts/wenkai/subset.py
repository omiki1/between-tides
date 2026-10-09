#!/usr/bin/env python3
"""
霞鹜文楷（LXGW WenKai Screen）构建期字形子集。

为什么：文楷只用于标题和短展示文字（styles/perf.css 里的选择器），但 npm 包按 unicode-range
切成 ~100 个分片，一页要拉 12–16 片（640–830 KB）。这里在每次构建前扫一遍「会用文楷显示的文字」，
从 node_modules 里的分片拼出一份只含这些字的 woff2（styles/generated/wenkai-subset.woff2），
由 styles/wenkai.css 引用，Next 打包时加上内容哈希。

用法（由 scripts/wenkai/run.mjs 调用，见 package.json 的 prebuild / predev / build）：
  python scripts/wenkai/subset.py build        生成子集（字表没变且文件已在就跳过）
  python scripts/wenkai/subset.py check        源文件里的每个字都必须在子集里，否则失败
  python scripts/wenkai/subset.py check-html out   构建产物里实际用文楷渲染的文字也必须都在子集里

覆盖范围（改了文楷的选择器就同步改这里）：
  1. 所有文章 / 项目的 frontmatter（标题、标签、分类……）和正文 h1–h3 —— 每次构建都重扫，新文章自动收进来
  2. 整个达妮娅台词池：data/denia-voices.json、lib/deniaVoices.ts、lib/denia-lines.ts
  3. config/site.ts 全部文字（站名、Hero、语录、tagline……）
  4. 界面文字：components/、app/ 里所有 h1–h3 的字面文字，以及渲染文楷选择器的组件文件里的全部中文；
     data/ 下 *.ts / *.json 里 title / name / label 字段的值（相册、项目、歌单……）
  5. ASCII、常用中文标点、全角标点
例外：追番页的番剧标题（data/bangumi.json，500+ 个生僻字）用 .no-wenkai 退回系统字体，不进子集。
"""
import hashlib, json, os, re, sys, glob
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = ROOT / "node_modules" / "lxgw-wenkai-screen-webfont"
PKG_CSS = PKG / "lxgwwenkaiscreen.css"
OUT_DIR = ROOT / "styles" / "generated"
OUT_FONT = OUT_DIR / "wenkai-subset.woff2"
OUT_META = OUT_DIR / "wenkai-subset.json"
MAX_BYTES = 200 * 1024

# 用文楷渲染的组件（className 命中 styles/perf.css 里的选择器）——整份文件的中文都收进来
WENKAI_CLASS = re.compile(r'className=(?:"|\{`)[^"`]*\b(greeting|denia-quote|time-greeting-info|time-greeting-voice|footer-tide-line|footer-brand|quote-card|welcome-toast|brand)\b')
HEADING = re.compile(r"<(h[123])\b[^>]*>(.*?)</\1>", re.S)
SECTION_TITLE = re.compile(r"<SectionTitle\b[^>]*>", re.S)
DATA_FIELD = re.compile(r'''["']?(title|name|label|headline|emphasis|greeting|tagline)["']?\s*:\s*(["'`])((?:\\.|(?!\2).)*)\2''')
MD_HEADING = re.compile(r"^#{1,3}\s+(.*)$", re.M)
SKIP_DATA = {"bangumi.json"}  # 番剧标题走系统字体（.no-wenkai），见上


def read(p):
    return Path(p).read_text(encoding="utf-8", errors="ignore")


def base_chars():
    s = set(range(0x20, 0x7F))                       # ASCII
    s |= set(range(0x3000, 0x3012)) | {0x3014, 0x3015, 0x301C, 0x301D, 0x301E}  # 、。〃〈〉《》「」『』【】〔〕〜〝〞
    s |= set(range(0xFF01, 0xFF5F))                  # 全角 ASCII 标点与字母
    s |= {0x00B7, 0x00D7, 0x2014, 0x2015, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2022, 0x2027, 0x30FB, 0x2192, 0x2190, 0x00A9, 0x2013}
    return s


def collect():
    """返回 {字符: 第一次出现的来源}，只看非控制字符。"""
    found = {}

    def add(text, src):
        for ch in text:
            cp = ord(ch)
            if cp < 0x20 or ch.isspace():
                continue
            found.setdefault(cp, src)

    for cp in base_chars():
        found.setdefault(cp, "(ASCII / 标点)")
    # 1. 文章、项目
    for f in sorted(glob.glob(str(ROOT / "content" / "**" / "*.md"), recursive=True)):
        t = read(f)
        rel = os.path.relpath(f, ROOT)
        m = re.match(r"^---\s*\n(.*?)\n---", t, re.S)
        if m:
            front = "\n".join(l for l in m.group(1).splitlines() if not l.lstrip().startswith(("description:", "cover:", "summary:", "excerpt:")))
            add(front, rel + " frontmatter")
            body = t[m.end():]
        else:
            body = t
        body = re.sub(r"```.*?```", "", body, flags=re.S)
        for h in MD_HEADING.findall(body):
            add(h, rel + " 标题")
    # 2. 台词池
    for f in ["data/denia-voices.json", "lib/deniaVoices.ts", "lib/denia-lines.ts"]:
        p = ROOT / f
        if p.exists():
            add(read(p), f)
    # 3. 站点配置
    add(read(ROOT / "config" / "site.ts"), "config/site.ts")
    # 4. 界面
    for f in sorted(glob.glob(str(ROOT / "components" / "**" / "*.tsx"), recursive=True) + glob.glob(str(ROOT / "app" / "**" / "*.tsx"), recursive=True)):
        t = read(f)
        rel = os.path.relpath(f, ROOT)
        if WENKAI_CLASS.search(t):
            add("".join(c for c in t if ord(c) > 0x7F), rel)
        for _, inner in HEADING.findall(t):
            add(inner, rel + " h1-h3")
        for tag in SECTION_TITLE.findall(t):
            add(tag, rel + " SectionTitle")
        for _, _, val in DATA_FIELD.findall(t):
            add(val, rel + " title/name")
    for f in sorted(glob.glob(str(ROOT / "data" / "*.ts")) + glob.glob(str(ROOT / "data" / "*.json")) + glob.glob(str(ROOT / "content" / "**" / "*.json"), recursive=True)):
        if os.path.basename(f) in SKIP_DATA:
            continue
        for _, _, val in DATA_FIELD.findall(read(f)):
            add(val, os.path.relpath(f, ROOT) + " title/name")
    return found


def shard_files():
    css = read(PKG_CSS)
    return [PKG / "files" / u for u in re.findall(r"url\(['\"]?\./files/([^'\")]+)['\"]?\)", css)]


def source_cmap():
    from fontTools.ttLib import TTFont
    owner = {}
    for fn in shard_files():
        for cp in TTFont(str(fn), lazy=True).getBestCmap():
            owner.setdefault(cp, fn)
    return owner


def build(force=False):
    from fontTools.ttLib import TTFont
    from fontTools import subset

    found = collect()
    wanted = sorted(found)
    key = hashlib.sha256((json.dumps(wanted) + read(Path(__file__))).encode()).hexdigest()[:16]
    if not force and OUT_FONT.exists() and OUT_META.exists():
        try:
            if json.loads(read(OUT_META)).get("key") == key:
                print(f"[wenkai] 字表没变（{len(wanted)} 字），沿用 {OUT_FONT.relative_to(ROOT)}")
                return
        except Exception:
            pass
    owner = source_cmap()
    by_shard = {}
    for cp in wanted:
        if cp in owner:
            by_shard.setdefault(owner[cp], set()).add(cp)
    absent = [cp for cp in wanted if cp not in owner]

    def opts(flavor=None):
        o = subset.Options()
        o.layout_features = []
        o.name_IDs = ["*"]
        o.notdef_outline = True
        o.drop_tables += ["morx", "feat", "prop", "bsln", "FFTM", "GSUB", "GPOS", "GDEF"]
        if flavor:
            o.flavor = flavor
        return o

    base = None
    for fn in sorted(by_shard, key=lambda p: p.name):
        f = TTFont(str(fn))
        s = subset.Subsetter(opts())
        s.populate(unicodes=by_shard[fn])
        s.subset(f)
        if base is None:
            base = f
            continue
        glyf, order = base["glyf"], base.getGlyphOrder()
        for gn in f.getGlyphOrder():
            if gn == ".notdef" or gn in glyf.glyphs:
                continue
            glyf.glyphs[gn] = f["glyf"][gn]
            base["hmtx"].metrics[gn] = f["hmtx"].metrics[gn]
            order.append(gn)
        base.setGlyphOrder(order)
        glyf.glyphOrder = order
        cm = f.getBestCmap()
        for t in base["cmap"].tables:
            if t.isUnicode():
                t.cmap.update(cm)
    base["maxp"].numGlyphs = len(base.getGlyphOrder())
    # 合并后再走一遍 subsetter：整理 glyph 顺序、重算表、输出 woff2
    import io
    buf = io.BytesIO()
    base.flavor = None
    base.save(buf)
    buf.seek(0)
    merged = TTFont(buf)
    s = subset.Subsetter(opts("woff2"))
    s.populate(unicodes=set(merged.getBestCmap()))
    s.subset(merged)
    merged.flavor = "woff2"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    merged.save(str(OUT_FONT))
    size = OUT_FONT.stat().st_size
    OUT_META.write_text(json.dumps({
        "key": key,
        "glyphs": len(merged.getBestCmap()),
        "bytes": size,
        "notInSourceFont": "".join(chr(c) for c in absent),
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[wenkai] {len(merged.getBestCmap())} 字 → {OUT_FONT.relative_to(ROOT)}（{size/1024:.1f} KB，来自 {len(by_shard)} 个分片）")
    if absent:
        print(f"[wenkai] 文楷本身没有、会退回系统字体的 {len(absent)} 个字符：{''.join(chr(c) for c in absent)}")
    if size > MAX_BYTES:
        print(f"[wenkai] 警告：子集 {size/1024:.1f} KB 超过 {MAX_BYTES//1024} KB 目标", file=sys.stderr)


def subset_cmap():
    from fontTools.ttLib import TTFont
    if not OUT_FONT.exists():
        sys.exit(f"[wenkai] 找不到 {OUT_FONT}，先运行 build")
    return set(TTFont(str(OUT_FONT)).getBestCmap())


def fail(title, missing):
    print(f"\n[wenkai] ✖ {title}：{len(missing)} 个字符不在文楷子集里", file=sys.stderr)
    for cp, src in list(missing.items())[:60]:
        print(f"    U+{cp:04X} {chr(cp)!r:6} ← {src}", file=sys.stderr)
    print("  修复：确认它们的来源在 scripts/wenkai/subset.py 的扫描范围内，然后重新 npm run build。\n", file=sys.stderr)
    sys.exit(1)


def check():
    have = subset_cmap()
    owner = source_cmap()
    found = collect()
    missing = {cp: src for cp, src in found.items() if cp not in have and cp in owner}
    if missing:
        fail("源文件检查", missing)
    print(f"[wenkai] ✔ 源文件检查：{len(found)} 个字符全部在子集里（{len(have)} 字，{OUT_FONT.stat().st_size/1024:.1f} KB）")


# ---- 构建产物检查：解析 out/**/*.html，找出用文楷渲染的元素里的文字 ----
WENKAI_TAGS = {"h1", "h2", "h3"}
WENKAI_CLASSES = {"greeting", "time-greeting-voice", "footer-tide-line", "footer-brand"}
WENKAI_P_IN = {"denia-quote", "time-greeting-info", "quote-card"}  # .x p
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def check_html(out_dir):
    from html.parser import HTMLParser
    have = subset_cmap()
    owner = source_cmap()
    missing = {}

    class P(HTMLParser):
        def __init__(self, rel):
            super().__init__(convert_charrefs=True)
            self.stack, self.rel = [], rel

        def handle_starttag(self, tag, attrs):
            if tag in VOID:
                return
            cls = set((dict(attrs).get("class") or "").split())
            parent_on = self.stack[-1][1] if self.stack else False
            parent_classes = set().union(*(c for _, _, c in self.stack)) if self.stack else set()
            off = "no-wenkai" in cls or any("no-wenkai" in c for _, _, c in self.stack)
            on = parent_on or tag in WENKAI_TAGS or bool(cls & WENKAI_CLASSES) \
                or (tag == "p" and bool(parent_classes & WENKAI_P_IN)) \
                or (tag == "strong" and "welcome-toast" in parent_classes) \
                or (tag == "span" and self.stack and "brand" in self.stack[-1][2])
            if tag in ("script", "style", "svg", "math", "code", "pre", "kbd") or "katex" in cls:
                on = False
            self.stack.append((tag, on and not off, cls))

        def handle_endtag(self, tag):
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i][0] == tag:
                    del self.stack[i:]
                    break

        def handle_data(self, data):
            if self.stack and self.stack[-1][1]:
                if any(t in ("script", "style", "code", "pre", "kbd", "math", "svg") for t, _, _ in self.stack):
                    return
                for ch in data:
                    cp = ord(ch)
                    if cp >= 0x20 and not ch.isspace() and cp not in have and cp in owner:
                        missing.setdefault(cp, f"{self.rel} <{self.stack[-1][0]}>")

    files = sorted(glob.glob(str(Path(out_dir) / "**" / "*.html"), recursive=True))
    for f in files:
        P(os.path.relpath(f, out_dir)).feed(read(f))
    if missing:
        fail(f"构建产物检查（{len(files)} 个页面）", missing)
    print(f"[wenkai] ✔ 构建产物检查：{len(files)} 个页面里用文楷渲染的文字全部在子集里")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
    if cmd == "build":
        build(force="--force" in sys.argv)
    elif cmd == "check":
        check()
    elif cmd == "check-html":
        check_html(sys.argv[2] if len(sys.argv) > 2 else str(ROOT / "out"))
    else:
        sys.exit(f"unknown command {cmd}")
