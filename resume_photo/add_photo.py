# -*- coding: utf-8 -*-
"""Insert a small personal photo into 唐博俊_AI应用开发_雅致版_医学版.docx/.pdf.

Layout notes (measured from the exported PDF):
  page 1 text area x=36..562pt, y=36..807pt
  title line y=36..56.5 | contact line y=66..77.6 | 个人背景 band y=83..110.5
  info table rows y=64..122 (right column values end by x=394)
  -> a 75x85pt photo at x=471..546, y=37..122 fits inside white space:
     clear of the table text (gap >= 77pt) and of the band.
"""
import io, os, re, shutil, sys, zipfile
from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SRC_JPG = r"C:\Users\freeing1\Downloads\IMG_20260916_164201_1789548373503edit.jpg"
DOCX    = r"C:\Users\freeing1\Desktop\个人简历\output\唐博俊_AI应用开发_雅致版_医学版.docx"
BAK_DIR = r"C:\Users\freeing1\Desktop\个人简历\output\_photo_backup"
WORK    = r"C:\Users\freeing1\AppData\Local\Temp\resume_photo_build"
HERE    = os.path.dirname(os.path.abspath(__file__))

# ---- photo geometry (points) -------------------------------------------------
# ~2.75 x 2.61 cm, i.e. the classic small 一寸 resume photo; kept this compact so
# the page keeps its original 2-page pagination (page 1 had ~8pt of slack).
PHOTO_W_PT, PHOTO_H_PT = 78.0, 74.0
PHOTO_LEFT_PT, PHOTO_TOP_PT = 484.0, 37.0
_CROP_C = (620, 560, 1420, 1627)   # 800x1067 source window around the head
_ch = int(round((_CROP_C[2] - _CROP_C[0]) * PHOTO_H_PT / PHOTO_W_PT))
_cy = (_CROP_C[1] + _CROP_C[3]) // 2
CROP = (_CROP_C[0], _cy - _ch // 2, _CROP_C[2], _cy - _ch // 2 + _ch)
EMU = 12700.0                       # EMU per point
# right text boundary shared by the title, the contact line and the section bands
# (page text area ends at 562pt; the photo occupies 484..562)
RIGHT_IND_PT = 58.0                 # -> content stops at 504pt, clear of the photo
BAND_RIGHT_IND_PT = 84.5            # band stops at 477.5pt, level with the title


def pt(v):
    return int(round(v * EMU))


def make_photo(dst):
    """Crop -> 3:4 portrait -> small JPEG with a hairline frame."""
    im = Image.open(SRC_JPG).convert("RGB")
    im = im.crop(CROP)
    px_w, px_h = 300, int(round(300 * im.height / im.width))
    im = im.resize((px_w, px_h), Image.LANCZOS)
    im.save(dst, "JPEG", quality=86, optimize=True, dpi=(300, 300))
    return px_w, px_h, os.path.getsize(dst)


def build_drawing(rel_id, cx, cy):
    """Floating (anchored) picture, square wrap, absolute page position."""
    name = "_x0000_i1025"
    return f'''<w:r><w:rPr><w:noProof/></w:rPr><w:drawing>
<wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="2" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
<wp:simplePos x="0" y="0"/>
<wp:positionH relativeFrom="page"><wp:posOffset>{pt(PHOTO_LEFT_PT)}</wp:posOffset></wp:positionH>
<wp:positionV relativeFrom="page"><wp:posOffset>{pt(PHOTO_TOP_PT)}</wp:posOffset></wp:positionV>
<wp:extent cx="{pt(PHOTO_W_PT)}" cy="{pt(PHOTO_H_PT)}"/>
<wp:effectExtent l="0" t="0" r="0" b="0"/>
<wp:wrapSquare wrapText="bothSides" distT="0" distB="0" distL="{pt(6)}" distR="0"/>
<wp:docPr id="101" name="{name}" descr="个人照片"/>
<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:nvPicPr><pic:cNvPr id="101" name="{name}" descr="个人照片"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="{rel_id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{pt(PHOTO_W_PT)}" cy="{pt(PHOTO_H_PT)}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
</pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>'''


def main():
    # 0) back up the current artefacts once
    os.makedirs(BAK_DIR, exist_ok=True)
    for f in ("唐博俊_AI应用开发_雅致版_医学版.docx", "唐博俊_AI应用开发_雅致版_医学版.pdf"):
        s = os.path.join(os.path.dirname(DOCX), f)
        d = os.path.join(BAK_DIR, f)
        if os.path.exists(s) and not os.path.exists(d):
            shutil.copy2(s, d)
            print("backed up ->", d)

    # 1) crop the photo
    jpg = os.path.join(HERE, "resume_photo.jpg")
    px_w, px_h, size = make_photo(jpg)
    print(f"photo: {px_w}x{px_h}px, {size} bytes, placed {PHOTO_W_PT}x{PHOTO_H_PT}pt")

    # 2) unpack
    if os.path.exists(WORK):
        shutil.rmtree(WORK)
    os.makedirs(WORK)
    with zipfile.ZipFile(DOCX) as z:
        names = z.namelist()
        z.extractall(WORK)
    print("package entries:", len(names))

    doc_xml = os.path.join(WORK, "word", "document.xml")
    rels_xml = os.path.join(WORK, "word", "_rels", "document.xml.rels")
    ct_xml = os.path.join(WORK, "[Content_Types].xml")
    doc = open(doc_xml, encoding="utf-8").read()
    rels = open(rels_xml, encoding="utf-8").read()
    ct = open(ct_xml, encoding="utf-8").read()

    assert 'r:embed="rIdPhoto1"' not in doc, "photo already present"

    # 3) content type + image relationship
    assert 'Extension="jpg"' not in ct, "jpg default already declared"
    pos = ct.find("<Default ")
    assert pos > -1
    ct = ct[:pos] + '<Default Extension="jpg" ContentType="image/jpeg"/>' + ct[pos:]
    assert "rIdPhoto1" not in rels
    rels = rels.replace(
        "</Relationships>",
        '<Relationship Id="rIdPhoto1" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
        'Target="media/resume_photo.jpg"/></Relationships>',
    )

    # 4) anchor the floating photo inside the title paragraph (first run)
    paras = re.findall(r"<w:p [^>]*>.*?</w:p>|<w:p/>", doc)
    p0 = paras[0]
    assert "个人简历" in p0
    m = re.match(r"(<w:p [^>]*>\s*<w:pPr>.*?</w:pPr>)", p0, re.S)
    assert m, "cannot locate title pPr"
    drawing = build_drawing("rIdPhoto1", 0, 0)
    p0_new = p0[: m.end()] + drawing + p0[m.end():]
    assert doc.count(p0) == 1
    doc = doc.replace(p0, p0_new, 1)

    # 5) keep the title's right tab and the contact line clear of the photo
    old_tab = '<w:tab w:val="right" w:pos="10466"/>'
    idx = doc.find("个人简历")
    assert idx > -1
    tab_at = doc.rfind(old_tab, 0, idx)
    assert tab_at > -1, "title right-tab not found"
    doc = doc[:tab_at] + '<w:tab w:val="right" w:pos="8580"/>' + doc[tab_at + len(old_tab):]
    ri = int(round(RIGHT_IND_PT * 20))
    for anchor in ('w:line="420" w:lineRule="exact"/><w:ind w:left="0"/>',
                   'w:line="261" w:lineRule="exact"/><w:ind w:left="0"/>'):
        assert doc.count(anchor) == 1, f"anchor not unique: {anchor}"
        doc = doc.replace(anchor, anchor.replace('<w:ind w:left="0"/>',
                                                 f'<w:ind w:left="0" w:right="{ri}"/>'))

    # 5b) reclaim the few points the anchored photo consumes, so the resume keeps
    #     its original 2-page pagination (it only had ~8pt of slack on page 1).
    old, new = ('<w:spacing w:after="200" w:line="420" w:lineRule="exact"/>',
                '<w:spacing w:after="120" w:line="420" w:lineRule="exact"/>')
    assert doc.count(old) == 1, f"title spacing not unique ({doc.count(old)})"
    doc = doc.replace(old, new, 1)
    # the 个人背景 heading band shares its spacing pattern with the other 4 bands,
    # so patch exactly that paragraph (found via its w14:paraId, since its title
    # text is split across two <w:t> runs); give it the photo's right boundary too
    m = re.search(r'<w:p w14:paraId="([0-9A-F]+)">(?:(?!</w:p>).)*?<w:t>个人</w:t>',
                  doc, re.S)
    assert m, "个人背景 heading paragraph not located"
    start = m.start()
    end = doc.find("</w:p>", m.end()) + len("</w:p>")
    band = doc[start:end]
    assert band.count('w:before="180"') == 1, band[:300]
    assert band.count("<w:jc") == 1 and "<w:ind" not in band, band[:400]
    band = band.replace('w:before="180"', 'w:before="60"', 1)
    br = int(round(BAND_RIGHT_IND_PT * 20))
    band = band.replace("<w:jc", f'<w:ind w:left="0" w:right="{br}"/><w:jc', 1)
    doc = doc[:start] + band + doc[end:]

    # 5c) the info table below the band carries the vertical cost of the photo;
    #     trim its per-row minimum height a little (~6pt over 4 rows)
    trows = doc.count('<w:trHeight w:val="471" w:hRule="atLeast"/>')
    assert trows == 4, f"unexpected table row count {trows}"
    doc = doc.replace('<w:trHeight w:val="471" w:hRule="atLeast"/>',
                      '<w:trHeight w:val="441" w:hRule="atLeast"/>')

    open(doc_xml, "w", encoding="utf-8").write(doc)
    open(rels_xml, "w", encoding="utf-8").write(rels)
    open(ct_xml, "w", encoding="utf-8").write(ct)
    media = os.path.join(WORK, "word", "media")
    os.makedirs(media, exist_ok=True)
    shutil.copy2(jpg, os.path.join(media, "resume_photo.jpg"))

    # 6) repackage
    assert "word/media/resume_photo.jpg" not in names
    tmp_out = DOCX + ".new"
    with zipfile.ZipFile(tmp_out, "w", zipfile.ZIP_DEFLATED) as z:
        for name in names:
            z.write(os.path.join(WORK, name), name)
        z.write(os.path.join(media, "resume_photo.jpg"), "word/media/resume_photo.jpg")
    os.replace(tmp_out, DOCX)
    print("docx updated:", DOCX, os.path.getsize(DOCX), "bytes")


if __name__ == "__main__":
    main()
