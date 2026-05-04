"""
Reads all .docx files from CR CORO import/ and enriches data/options.json.
Usage: python scripts/extract_options.py "C:/path/to/CR CORO import"
"""
import json, re, sys
from pathlib import Path
from docx import Document

def extract_from_docx(path: Path) -> dict:
    try:
        doc = Document(path)
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception:
        return {}
    result = {}
    if m := re.search(r"Salle\s*:\s*(.+)", text):
        result["room"] = m.group(1).strip().rstrip(".")
    for m in re.finditer(r"Voie d.abord\w*\s*:\s*(.+?)(?:\s*[\-–]\s*\d+\s*French)", text):
        result.setdefault("approaches", set()).add(m.group(1).strip())
    for line in text.splitlines():
        stripped = line.strip()
        if stripped and re.match(r".+\(.+\)\s*\.$", stripped):
            result.setdefault("material", set()).add(stripped.rstrip("."))
    if m := re.search(r"Indications?\s*:\s*(.+)", text):
        val = m.group(1).strip()
        if len(val) < 80:
            result.setdefault("indications", set()).add(val)
    if m := re.search(r"D.cision\s*:\s*(.+)", text):
        val = m.group(1).strip().rstrip(".")
        if len(val) < 100:
            result.setdefault("decisions", set()).add(val)
    return result

def main(root: str):
    options_path = Path(__file__).parent.parent / "data" / "options.json"
    opts = json.loads(options_path.read_text(encoding="utf-8"))

    count = 0
    for docx_file in Path(root).rglob("*.docx"):
        extracted = extract_from_docx(docx_file)
        for k, v in extracted.items():
            if isinstance(v, set):
                opts.setdefault(k, [])
                for item in v:
                    if item and item not in opts[k]:
                        opts[k].append(item)
        count += 1

    options_path.write_text(json.dumps(opts, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Processed {count} files. options.json updated: {options_path}")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
