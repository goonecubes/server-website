"""Import piano sheet files into public/apps/instruments/piano/sheets.

Usage:
	python tools/import-piano-sheets.py <folder or files...> [--mode basic|advanced] [--dry-run]

Or drag a folder onto tools/import-piano-sheets.bat.

Each song is a .sht file, either:
	GMod Tower sheet    the original HTML fragment
	                    (<h2>Title | <i>Artist</i></h2><div class="notes">...<br/>...</div>),
	                    copied byte for byte and rendered by the page; or
	plain text          the keys to press (line breaks and [chords] kept; HTML <br> is a
	                    line break).

An optional Song Name.author file holds the artist (plain text sheets) or the sheet's
transcriber (GMod Tower sheets, shown as "Sheet by"). For GMod Tower sheets the title and
artist come from the <h2>; for plain text the title comes from the file name (underscores
become spaces).

The piano mode comes from --mode, else from a parent folder called basic/advanced/adv, else
from the keys themselves: lowercase letters, digits or !@$%^*( mean advanced; otherwise
basic.

A song whose title already exists in that mode is updated in place and keeps its file name;
new songs are added at the end. Folders are searched recursively.
"""
import argparse, html, json, re, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "public" / "apps" / "instruments" / "piano"
SHEETS = ROOT / "sheets"
INDEX = SHEETS / "index.json"

# Keys each piano mode can play (gmt_piano/shared.lua). Basic shows the semicolon key as ":".
BASIC_KEYS = set("ASDFGHJKL:'WETYUOP")
ADVANCED_KEYS = set("0123456789qwertyuiopasdfghjklzxcvbnm"
	"QWERTYUIOPASDFGHJKLZXCVBNM!@#$%^&*()")
NOTATION = set(" \t\n[]-|.,/()~{}~")  # layout characters used in sheets, not keys
ADVANCED_ONLY = set("1234567890qwertyuiopasdfg!@$%^*(QI")


def read_text(path):
	raw = path.read_bytes()
	for enc in ("utf-8-sig", "cp1252"):
		try:
			return raw.decode(enc)
		except UnicodeDecodeError:
			continue
	return raw.decode("utf-8", "replace")


def text_keys(text):
	"""The keys in any sheet format, for mode detection and the playability check."""
	notes = re.search(r"<div[^>]*class=\"[^\"]*\bnotes\b[^\"]*\"[^>]*>(.*?)</div>", text, re.I | re.S)
	if notes:
		text = notes.group(1)
	text = re.sub(r"(?i)<br\s*/?>", "\n", text)
	text = re.sub(r"<[^>]+>", "", text)
	return html.unescape(text).replace("\ufeff", "").replace("\r\n", "\n").replace("\r", "\n")


def detect_mode(keys, path, forced):
	if forced:
		return forced
	for part in reversed(path.parent.parts):
		p = part.lower()
		if p == "basic":
			return "basic"
		if p in ("advanced", "adv"):
			return "advanced"
	# ";" is basic mode's semicolon key; "(" is also a shift key in advanced, so ignore it here.
	if any(c in ADVANCED_ONLY for c in keys if c not in "()"):
		return "advanced"
	return "basic"


def unplayable(keys, mode):
	allowed = (BASIC_KEYS | {";"}) if mode == "basic" else ADVANCED_KEYS
	return sorted({c for c in keys if c not in allowed and c not in NOTATION})


def gmt_meta(text):
	"""(title, by) from a GMod Tower sheet's <h2>, or None when it is a plain text sheet."""
	h2 = re.search(r"<h2[^>]*>(.*?)</h2>", text, re.I | re.S)
	if not h2:
		return None
	inner = h2.group(1)
	artist = re.search(r"<i[^>]*>(.*?)</i>", inner, re.I | re.S)
	by = html.unescape(re.sub(r"<[^>]+>", "", artist.group(1))).strip() if artist else ""
	title = html.unescape(re.sub(r"<[^>]+>", "", inner)).strip()
	title = re.split(r"\s*\|\s*", title, maxsplit=1)[0].strip() or "Untitled"
	return title, by


def slugify(title, taken):
	slug = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
	slug = re.sub(r"[^A-Za-z0-9]+", "_", slug).strip("_") or "sheet"
	name, n = slug, 1
	while name + ".sht" in taken:
		n += 1
		name = f"{slug}_{n}"
	return name + ".sht"


def plain_fragment(title, by, keys):
	head = html.escape(title)
	if by:
		head += " | <i>" + html.escape(by) + "</i>"
	body = "<br/>".join(html.escape(line).replace("&quot;", '"') for line in keys.split("\n"))
	return f"<h2>{head}</h2><div class=\"notes\">{body}</div>\n"


def load_index():
	if INDEX.exists():
		data = json.loads(INDEX.read_text(encoding="utf-8"))
	else:
		data = {}
	for mode in ("basic", "advanced"):
		data.setdefault(mode, [])
	return data


def find_sheets(targets):
	"""Every .sht, in natural order so 2 comes before 10."""
	def natural(p):
		return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", str(p))]
	for t in targets:
		p = Path(t)
		if p.is_dir():
			yield from sorted(p.rglob("*.sht"), key=natural)
		elif p.suffix.lower() == ".sht" and p.exists():
			yield p
		else:
			print(f"  skipped (not a folder or .sht file): {t}")


def main():
	ap = argparse.ArgumentParser(description="Import .sht piano sheets into public/apps/instruments/piano/sheets")
	ap.add_argument("targets", nargs="+", help="folders and/or .sht files")
	ap.add_argument("--mode", choices=["basic", "advanced"], help="force every song into one mode")
	ap.add_argument("--dry-run", action="store_true", help="show what would change without saving")
	args = ap.parse_args()

	data = load_index()
	added = updated = same = 0
	for sht in find_sheets(args.targets):
		raw = sht.read_bytes()
		text = read_text(sht)
		keys = text_keys(text)
		if not keys.strip():
			print(f"  empty, skipped: {sht.name}")
			continue

		meta = gmt_meta(text)
		author_file = sht.with_suffix(".author")
		credit_lines = read_text(author_file).strip().splitlines() if author_file.exists() else []
		credit = credit_lines[0].strip() if credit_lines else ""
		if meta:
			title, by = meta
			sheet_by = credit
			payload = raw
		else:
			title = sht.stem.replace("_", " ").strip() or "Untitled"
			by = credit
			sheet_by = ""
			payload = plain_fragment(title, by, keys).encode("utf-8")

		mode = detect_mode(keys, sht, args.mode)
		if mode == "basic":
			keys = keys.replace(";", ":")  # the basic piano labels its semicolon key ":"

		bad = unplayable(keys, mode)
		note = f"  (not keys in {mode} mode: {' '.join(bad)})" if bad else ""

		# Titles are not unique ("Title", "Overworld"), so the artist is the tie-breaker.
		existing = next((s for s in data[mode]
			if s["title"].lower() == title.lower() and s["by"].lower() == by.lower()), None)
		if existing is None:
			taken = {s["file"] for s in data[mode]}
			file = slugify(title, taken)
			entry = {"file": file, "title": title, "by": by, "sheetBy": sheet_by}
			data[mode].append(entry)
			added += 1
			print(f"  + {mode:8} {title}{' | ' + by if by else ''}{note} -> {file}")
		else:
			file = existing["file"]
			entry = {"file": file, "title": title, "by": by, "sheetBy": sheet_by}
			dest = SHEETS / mode / file
			changed = existing != entry or not dest.exists() or dest.read_bytes() != payload
			if changed:
				existing.update(entry)
				updated += 1
				print(f"  ~ {mode:8} {title}{' | ' + by if by else ''}{note} -> {file}")
			else:
				same += 1

		if not args.dry_run:
			dest = SHEETS / mode / file
			dest.parent.mkdir(parents=True, exist_ok=True)
			if not dest.exists() or dest.read_bytes() != payload:
				dest.write_bytes(payload)

	print(f"\n{added} added, {updated} updated, {same} unchanged. "
		f"Now {len(data['basic'])} basic and {len(data['advanced'])} advanced songs.")
	if args.dry_run:
		print("Dry run: no files were changed.")
		return 0
	if added or updated:
		# Drop sheets whose index entry disappeared (a title removed by hand from index.json).
		keep = {s["file"] for mode in ("basic", "advanced") for s in data[mode]}
		for mode in ("basic", "advanced"):
			for f in (SHEETS / mode).glob("*.sht"):
				if f.name not in keep:
					f.unlink()
					print(f"  - removed unreferenced {mode}/{f.name}")
		INDEX.parent.mkdir(parents=True, exist_ok=True)
		INDEX.write_text(json.dumps(data, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8", newline="\n")
		print(f"Saved {INDEX}")
	return 0


if __name__ == "__main__":
	sys.exit(main())
