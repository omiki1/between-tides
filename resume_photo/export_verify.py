# -*- coding: utf-8 -*-
"""Export the resume docx to PDF with Word, then verify the photo placement."""
import io, os, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

DOCX = r"C:\Users\freeing1\Desktop\个人简历\output\唐博俊_AI应用开发_雅致版_医学版.docx"
PDF = r"C:\Users\freeing1\Desktop\个人简历\output\唐博俊_AI应用开发_雅致版_医学版.pdf"
RENDER = r"C:\workspace\wuwa\resume_photo\render"
os.makedirs(RENDER, exist_ok=True)


def export():
    import win32com.client as win32
    word = win32.DispatchEx("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    try:
        d = word.Documents.Open(DOCX, ReadOnly=False, AddToRecentFiles=False)
        if os.path.exists(PDF):
            os.remove(PDF)
        d.ExportAsFixedFormat(
            OutputFileName=PDF, ExportFormat=17, OpenAfterExport=False, OptimizeFor=0,
            Range=0, Item=0, IncludeDocProps=True, KeepIRM=True,
            CreateBookmarks=1, DocStructureTags=True, BitmapMissingFonts=True,
            UseISO19005_1=False)
        pages = d.ComputeStatistics(2)
        words = d.ComputeStatistics(0)
        d.Close(SaveChanges=0)
    finally:
        word.Quit()
    return pages, words


def verify():
    import pymupdf
    doc = pymupdf.open(PDF)
    print("pages:", doc.page_count)
    pg = doc[0]
    imgs = pg.get_images(full=True)
    print("images on page 1:", len(imgs))
    boxes = []
    for xref, *_ in imgs:
        for r in pg.get_image_rects(xref):
            boxes.append(r)
            print("  image rect: x %.1f-%.1f  y %.1f-%.1f" % (r.x0, r.x1, r.y0, r.y1))
    # render page 1 for the user
    pix = pg.get_pixmap(dpi=150)
    out = os.path.join(RENDER, "page1.png")
    pix.save(out)
    print("rendered:", out, pix.width, "x", pix.height)

    # text collision check against the photo rectangle
    print("\ntext spans overlapping the photo area:")
    hit = False
    for b in pg.get_text("dict")["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            for s in l["spans"]:
                x0, y0, x1, y1 = s["bbox"]
                for r in boxes:
                    if x0 < r.x1 and x1 > r.x0 and y0 < r.y1 and y1 > r.y0:
                        hit = True
                        print("   OVERLAP %r @ x %.1f-%.1f y %.1f-%.1f" % (s["text"][:40], x0, x1, y0, y1))
    if not hit:
        print("   none - clean")

    print("\nheader lines (page 1 top):")
    for b in pg.get_text("dict")["blocks"][:6]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            t = "".join(s["text"] for s in l["spans"])
            if t.strip():
                print("   y %6.1f-%6.1f x %6.1f-%6.1f | %s" % (l["bbox"][1], l["bbox"][3], l["bbox"][0], l["bbox"][2], t))

    # last line of each page, to confirm nothing spilled to page 3
    for i, page in enumerate(doc):
        ys = [l["bbox"][3] for bl in page.get_text("dict")["blocks"] if bl["type"] == 0 for l in bl["lines"]]
        print(f"   page {i+1} last text y = {max(ys):.1f}")

    # hyperlinks still intact?
    data = open(PDF, "rb").read()
    import re
    print("\nlink annotations:", data.count(b"/Subtype/Link"))
    print("pdf size:", len(data), "bytes")
    return doc.page_count


if __name__ == "__main__":
    p, w = export()
    print("Word reports:", p, "pages,", w, "words")
    verify()
