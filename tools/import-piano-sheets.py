"""Import piano sheet files into public/apps/instruments/piano/songs.json.

Usage:
	python tools/import-piano-sheets.py <folder or files...> [--mode basic|advanced] [--dry-run]

Or drag a folder onto tools/import-piano-sheets.bat.

Each song is a text file:
	Song Name.sht      the keys to press, exactly as written (line breaks and [chords] kept;
	                   HTML <br> is turned into a line break)
	Song Name.author   optional, the artist or composer (first line)

The title comes from the file name (underscores become spaces). The piano mode comes from
--mode, else from a parent folder called basic/advanced/adv, else from the keys themselves:
lowercase letters, digits or !@$%^*( mean advanced; otherwise basic.

A song whose title already exists in that mode is updated in place; new songs are added at
the end. Folders are searched recursively.
"""
import argparse, json, re, sys
from pathlib import Path

SONGS = Path(__file__).resolve().parent.parent / "public" / "apps" / "instruments" / "piano" / "songs.json"

# Keys each piano mode can play (gmt_piano/shared.lua). Basic shows the semicolon key as ":".
BASIC_KEYS = set("ASDFGHJKL:'WETYUOP")
ADVANCED_KEYS = set("1234567890qwertyuiopasdfg!@$%^*(QWETYIOPSD")
NOTATION = set(" \t\n[]-|.,/()~")  # layout characters used in sheets, not keys
ADVANCED_ONLY = set("1234567890qwertyuiopasdfg!@$%^*(QI")


def read_text(path):
	raw = path.read_bytes()
	for enc in ("utf-8-sig", "cp1252"):
		try:
			return raw.decode(enc)
		except UnicodeDecodeError:
			continue
	return raw.decode("utf-8", "replace")


def clean_keys(text):
	text = re.sub(r"(?i)<br\s*/?>", "\n", text)
	text = re.sub(r"<[^>]+>", "", text).replace("\r\n", "\n").replace("\r", "\n")
	lines = [line.rstrip() for line in text.split("\n")]
	return "\n".join(lines).strip("\n")


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


def find_sheets(targets):
	for t in targets:
		p = Path(t)
		if p.is_dir():
			yield from sorted(p.rglob("*.sht"))
		elif p.suffix.lower() == ".sht" and p.exists():
			yield p
		else:
			print(f"  skipped (not a folder or .sht file): {t}")


def main():
	ap = argparse.ArgumentParser(description="Import .sht/.author piano sheets into songs.json")
	ap.add_argument("targets", nargs="+", help="folders and/or .sht files")
	ap.add_argument("--mode", choices=["basic", "advanced"], help="force every song into one mode")
	ap.add_argument("--dry-run", action="store_true", help="show what would change without saving")
	args = ap.parse_args()

	data = json.loads(SONGS.read_text(encoding="utf-8"))
	for mode in ("basic", "advanced"):
		data.setdefault(mode, [])

	added = updated = same = 0
	for sht in find_sheets(args.targets):
		keys = clean_keys(read_text(sht))
		if not keys:
			print(f"  empty, skipped: {sht.name}")
			continue
		author_file = sht.with_suffix(".author")
		by = read_text(author_file).strip().splitlines()[0].strip() if author_file.exists() else ""
		title = sht.stem.replace("_", " ").strip()
		mode = detect_mode(keys, sht, args.mode)
		if mode == "basic":
			keys = keys.replace(";", ":")  # the basic piano labels its semicolon key ":"

		bad = unplayable(keys, mode)
		note = f"  (not keys in {mode} mode: {' '.join(bad)})" if bad else ""

		song = {"title": title, "by": by, "keys": keys}
		existing = next((s for s in data[mode] if s["title"].lower() == title.lower()), None)
		if existing is None:
			data[mode].append(song)
			added += 1
			print(f"  + {mode:8} {title}{' | ' + by if by else ''}{note}")
		elif existing == song:
			same += 1
		else:
			existing.update(song)
			updated += 1
			print(f"  ~ {mode:8} {title}{' | ' + by if by else ''}{note}")

	print(f"\n{added} added, {updated} updated, {same} unchanged. "
		f"Now {len(data['basic'])} basic and {len(data['advanced'])} advanced songs.")
	if args.dry_run:
		print("Dry run: songs.json was not changed.")
		return 0
	if added or updated:
		SONGS.write_text(json.dumps(data, ensure_ascii=False, indent="\t") + "\n", encoding="utf-8", newline="\n")
		print(f"Saved {SONGS}")
	return 0


if __name__ == "__main__":
	sys.exit(main())
