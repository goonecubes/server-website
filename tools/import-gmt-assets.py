"""Copy original GMod Tower art from the server install into the website.

Run from the Website folder:  python tools/import-gmt-assets.py
Requires Pillow. Safe to re-run; outputs are overwritten.

- materials/gmod_tower/banners/*.vtf      -> public/img/gmt/banners/*.jpg   (gamemode banners)
- materials/gmod_tower/maps/*.vtf         -> public/img/gmt/maps/*.jpg      (map previews)
- materials/gmod_tower/ui/gamemodes/*.png -> public/img/gmt/logos/*.png     (transparent gamemode logos)
- materials/gmod_tower/ui/stores/*.png    -> public/img/gmt/stores/*.png    (store logos)
- materials/gmod_tower/ui/images/*.png    -> public/img/gmt/shots/*.jpg     (screenshots)
- gamemode map registries (Maps.Register) -> src/data/maps.json
"""
import json, os, re, shutil, struct
from pathlib import Path
from PIL import Image

WEBSITE = Path(__file__).resolve().parent.parent
SERVER = WEBSITE.parent / "Gmod Server Files"
MATERIALS = SERVER / "original workshop files" / "combined_addon" / "materials" / "gmod_tower"
MAP_REGISTRIES = SERVER / "garrysmod" / "addons" / "VibeTower_Code" / "gamemodes" / "gmodtower" / "gamemode" / "base" / "maps"
OUT = WEBSITE / "public" / "img" / "gmt"

# VTF format id -> (kind, block/pixel size, decoder arg)
VTF_FORMATS = {
	13: ("bcn", 8, 1),     # DXT1
	14: ("bcn", 16, 2),    # DXT3
	15: ("bcn", 16, 3),    # DXT5
	0: ("raw", 4, "RGBA"),
	12: ("raw", 4, "BGRA"),
	2: ("raw", 3, "RGB"),
	3: ("raw", 3, "BGR"),
	16: ("raw", 4, "BGRX"),
}


def read_vtf(path):
	"""Decode the full-size mip of a single-frame VTF. The largest mip is stored last."""
	data = path.read_bytes()
	sig, _, _, _, w, h = struct.unpack_from("<4sIIIHH", data, 0)
	fmt = struct.unpack_from("<i", data, 52)[0]
	if sig != b"VTF\0" or fmt not in VTF_FORMATS:
		raise ValueError(f"unsupported VTF: {path} (format {fmt})")
	kind, size, arg = VTF_FORMATS[fmt]
	if kind == "bcn":
		n = max(1, (w + 3) // 4) * max(1, (h + 3) // 4) * size
		return Image.frombytes("RGBA", (w, h), data[-n:], "bcn", arg)
	n = w * h * size
	return Image.frombytes("RGBA" if size == 4 else "RGB", (w, h), data[-n:], "raw", arg)


def save_jpg(img, dst, width):
	img = img.convert("RGB")
	if img.width > width:
		img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
	dst.parent.mkdir(parents=True, exist_ok=True)
	img.save(dst, quality=86, optimize=True, progressive=True)


def copy_dir(src, dst):
	dst.mkdir(parents=True, exist_ok=True)
	for f in sorted(src.glob("*.png")):
		shutil.copyfile(f, dst / f.name)


def parse_registry(lua_file):
	"""Yield (map_id, display_name) for each Maps.Register block."""
	text = lua_file.read_text(encoding="utf-8", errors="replace")
	for m in re.finditer(r'Maps\.Register\(\s*"([^"]+)"\s*,\s*\{(.*?)\}\s*\)', text, re.S):
		name = re.search(r'Name\s*=\s*"([^"]*)"', m.group(2))
		yield m.group(1), name.group(1) if name else m.group(1)


def preview_for(map_id, previews):
	"""Map previews drop the revision suffix: gmt_virus_facility202 -> gmt_virus_facility2."""
	candidate = map_id
	while candidate:
		if candidate in previews:
			return candidate
		if not candidate[-1].isdigit():
			return None
		candidate = candidate[:-1]
	return None


def main():
	for f in sorted((MATERIALS / "banners").glob("*.vtf")):
		save_jpg(read_vtf(f), OUT / "banners" / f"{f.stem}.jpg", 1024)

	copy_dir(MATERIALS / "ui" / "gamemodes", OUT / "logos")
	copy_dir(MATERIALS / "ui" / "stores", OUT / "stores")
	for f in sorted((MATERIALS / "ui" / "images").glob("*.png")):
		save_jpg(Image.open(f), OUT / "shots" / f"{f.stem}.jpg", 800)

	previews = {f.stem: f for f in (MATERIALS / "maps").glob("*.vtf")}
	maps = {}
	used = set()
	for lua in sorted(MAP_REGISTRIES.glob("*.lua")):
		if lua.stem in ("shared", "sh_loadorder", "gmtlobby", "monotone"):
			continue
		entries = []
		seen_names = set()
		for map_id, name in parse_registry(lua):
			if name in seen_names:  # e.g. two Club Titiboo revisions
				continue
			seen_names.add(name)
			preview = preview_for(map_id, previews)
			if preview:
				used.add(preview)
			entries.append({"id": map_id, "name": name, "image": f"/img/gmt/maps/{preview}.jpg" if preview else None})
		maps[lua.stem] = entries

	for stem in sorted(used):
		save_jpg(read_vtf(previews[stem]), OUT / "maps" / f"{stem}.jpg", 256)

	(WEBSITE / "src" / "data" / "maps.json").write_text(json.dumps(maps, indent="\t") + "\n", encoding="utf-8")

	missing = [(gm, e["name"]) for gm, es in maps.items() for e in es if not e["image"]]
	print(f"banners, logos, stores, shots copied; {len(used)} map previews; {sum(map(len, maps.values()))} maps listed")
	if missing:
		print("maps without a preview:", missing)


if __name__ == "__main__":
	main()
