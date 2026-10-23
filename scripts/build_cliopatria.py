#!/usr/bin/env python3
"""Turn Cliopatria v0.2.1 POLITY GeoJSON into small, atlas-identity-scoped assets.

Official source: Seshat Global History Databank, CC BY 4.0.
No same-name guesswork: a reviewed Name + optional Wikidata check is required.
Source years are BCE/CE, whereas the Atlas uses astronomical years (0 = 1 BCE).
This is a reproducible build step; only compressed, date-scoped geography is
served to users, never the source archive or a fabricated territorial model.
"""
import argparse
import hashlib
import io
import json
import re
import sys
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_VERSION = "v0.2.1"
SOURCE = (
    "https://raw.githubusercontent.com/Seshat-Global-History-Databank/"
    "cliopatria/v0.2.1/cliopatria.geojson.zip"
)
LICENSE = "https://creativecommons.org/licenses/by/4.0/"
CITATION = "https://doi.org/10.5281/zenodo.23128623"


def atlas_year(value):
    """Convert historical BCE (-1 means 1 BCE) to astronomical Atlas years."""
    n = int(value)
    return n + 1 if n < 0 else n


def read_features(stream, chunk_size=131072):
    """Iterate FeatureCollection.features without loading the huge file into RAM."""
    decoder = json.JSONDecoder()
    buffer = stream.read(chunk_size)
    head = re.search(r'"features"\s*:\s*\[', buffer)
    while head is None:
        more = stream.read(chunk_size)
        if not more:
            raise ValueError("GeoJSON is missing a features array")
        buffer += more
        if len(buffer) > 5_000_000:
            raise ValueError("GeoJSON feature header is abnormally large")
        head = re.search(r'"features"\s*:\s*\[', buffer)
    pos = head.end()
    while True:
        while pos < len(buffer) and buffer[pos] in " \r\n\t,":
            pos += 1
        if pos >= len(buffer):
            more = stream.read(chunk_size)
            if not more:
                raise ValueError("Truncated GeoJSON features array")
            buffer += more
            continue
        if buffer[pos] == "]":
            break
        try:
            feature, end = decoder.raw_decode(buffer, pos)
        except json.JSONDecodeError:
            more = stream.read(chunk_size)
            if not more:
                raise ValueError("Malformed/truncated GeoJSON feature")
            buffer += more
            if len(buffer) > 100_000_000:
                raise ValueError("Individual polygon feature exceeds safety limit")
            continue
        if isinstance(feature, dict):
            yield feature
        pos = end
        if pos > 1_000_000:
            buffer = buffer[pos:]
            pos = 0


def perpendicular(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dx == dy == 0:
        return (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2


def simplify_ring(ring, tolerance=0.18, maximum=650):
    if not isinstance(ring, list) or len(ring) < 4:
        return None
    points = []
    for p in ring:
        if not isinstance(p, (list, tuple)) or len(p) < 2:
            return None
        lon, lat = p[0], p[1]
        if not isinstance(lon, (float, int)) or not isinstance(lat, (float, int)):
            return None
        if not -180 <= lon <= 180 or not -90 <= lat <= 90:
            return None
        pair = [round(lon, 2), round(lat, 2)]
        if not points or points[-1] != pair:
            points.append(pair)
    if points[0] != points[-1]:
        points.append(points[0])
    if len(points) < 4:
        return None
    # Don't draw a giant line across the dateline.
    if any(abs(points[i][0] - points[i - 1][0]) > 180 for i in range(1, len(points))):
        return None
    # Iterative Ramer-Douglas-Peucker simplification. Shapes are labelled approximate.
    keep = {0, len(points) - 1}
    stack = [(0, len(points) - 1)]
    tolerance_squared = tolerance * tolerance
    while stack:
        start, end = stack.pop()
        furthest, distance = None, tolerance_squared
        for i in range(start + 1, end):
            d = perpendicular(points[i], points[start], points[end])
            if d > distance:
                furthest, distance = i, d
        if furthest is not None:
            keep.add(furthest)
            stack.append((start, furthest))
            stack.append((furthest, end))
    result = [points[i] for i in sorted(keep)]
    if len(result) < 4:
        result = points[:]
    if len(result) > maximum:
        jump = max(1, (len(result) - 2) // (maximum - 2) + 1)
        result = result[0:-1:jump] + [result[-1]]
    if len(result) < 4 or result[0] != result[-1]:
        return None
    return result


def compact_geometry(source):
    if not isinstance(source, dict):
        return None
    kind, coords = source.get("type"), source.get("coordinates")
    if kind not in ("Polygon", "MultiPolygon") or not isinstance(coords, list):
        return None
    polygons = [coords] if kind == "Polygon" else coords
    result = []
    for polygon in polygons:
        if not isinstance(polygon, list) or not polygon:
            continue
        rings = [simplify_ring(r) for r in polygon]
        # The first ring is the exterior, so never retain orphan holes.
        if rings and rings[0]:
            result.append([r for r in rings if r])
    return {"type": "MultiPolygon", "coordinates": result} if result else None


def download_source(target):
    target.parent.mkdir(parents=True, exist_ok=True)
    print("Downloading pinned Cliopatria source:", SOURCE, flush=True)
    req = urllib.request.Request(SOURCE, headers={"User-Agent": "WorldHistoryAtlas-SeshatImporter/1.0"})
    tmp = target.with_suffix(".partial")
    total = 0
    try:
        with urllib.request.urlopen(req, timeout=90) as response, open(tmp, "wb") as fh:
            while True:
                block = response.read(1024 * 1024)
                if not block:
                    break
                total += len(block)
                if total > 400 * 1024 * 1024:
                    raise ValueError("Source archive larger than safety limit")
                fh.write(block)
        if not zipfile.is_zipfile(tmp):
            raise ValueError("Downloaded source is not a ZIP archive")
        tmp.replace(target)
        print("Downloaded", total, "bytes", flush=True)
    finally:
        if tmp.exists():
            tmp.unlink()


def generate(archive, output, mapping_file):
    catalog = json.loads(mapping_file.read_text(encoding="utf-8"))
    identities = catalog["matches"]
    by_name = defaultdict(list)
    for atlas_id, entry in identities.items():
        for name in entry["names"]:
            by_name[name.strip().casefold()].append((atlas_id, entry))
    grouped = defaultdict(list)
    unmatched = defaultdict(int)
    processed, matching, mismatched = 0, 0, 0
    sha = hashlib.sha256(archive.read_bytes()).hexdigest()
    with zipfile.ZipFile(archive) as z:
        members = [m for m in z.namelist() if m.endswith(".geojson") and not m.startswith("__MACOSX")]
        if len(members) != 1:
            raise ValueError("Expected exactly one GeoJSON file in Cliopatria archive")
        with z.open(members[0]) as raw, io.TextIOWrapper(raw, encoding="utf-8") as reader:
            for feature in read_features(reader):
                processed += 1
                props = feature.get("properties") or {}
                if str(props.get("Type") or "").upper() != "POLITY":
                    continue
                name = str(props.get("Name") or "").strip()
                targets = by_name.get(name.casefold(), [])
                if not targets:
                    continue
                wiki = str(props.get("Wikidata") or "").strip().rsplit("/", 1)[-1]
                try:
                    from_year = atlas_year(props["FromYear"])
                    to_year = atlas_year(props["ToYear"])
                except (KeyError, ValueError, TypeError):
                    unmatched[name] += 1
                    continue
                if from_year > to_year:
                    unmatched[name] += 1
                    continue
                shape = compact_geometry(feature.get("geometry"))
                if not shape:
                    unmatched[name] += 1
                    continue
                for atlas_id, identity in targets:
                    # Avoid false matches where an entity name was reused for a different polity.
                    if wiki and identity.get("wikidata") and wiki not in identity["wikidata"]:
                        mismatched += 1
                        continue
                    row = {
                        "name": name, "from": from_year, "to": to_year,
                        "geometry": shape, "wikidata": wiki or None,
                        "seshatId": props.get("SeshatID") or None,
                        "areaKm2": props.get("Area"),
                    }
                    grouped[atlas_id].append(row)
                    matching += 1
                if processed % 2000 == 0:
                    print("Read", processed, "features", flush=True)
    output.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schema": 1, "dataset": "Seshat Cliopatria", "version": SOURCE_VERSION,
        "source": SOURCE, "citation": CITATION, "license": LICENSE,
        "sourceSha256": sha, "processedFeatures": processed,
        "matchedFeatures": matching, "reviewRejected": mismatched,
        "yearConvention": "Atlas astronomical: 0=1 BCE, original negative years converted by +1",
        "coverage": {},
        "unmatchedAtlasIds": sorted(set(identities) - set(grouped))
    }
    for atlas_id, records in sorted(grouped.items()):
        # Sort for binary-ish search by year in the browser, preserve periods exactly.
        records.sort(key=lambda r: (r["from"], r["to"], r["name"]))
        filename = atlas_id + ".json"
        payload = {"atlasId": atlas_id, "dataset": "Cliopatria", "version": SOURCE_VERSION, "records": records}
        (output / filename).write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        manifest["coverage"][atlas_id] = {
            "file": "seshat/" + filename, "records": len(records),
            "from": min(r["from"] for r in records),
            "to": max(r["to"] for r in records),
            "names": sorted(set(r["name"] for r in records))
        }
    (output / "index.json").write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("Cliopatria:", processed, "source features;", matching, "matched records;", len(grouped), "atlas identities;", mismatched, "identity conflicts", flush=True)
    if not grouped:
        raise ValueError("No confirmed Cliopatria entities matched the reviewed atlas crosswalk")
    return manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=ROOT / ".cache" / "cliopatria-v0.2.1.zip")
    parser.add_argument("--output", type=Path, default=ROOT / "public" / "seshat")
    parser.add_argument("--mapping", type=Path, default=ROOT / "scripts" / "cliopatria-matches.json")
    parser.add_argument("--download", action="store_true", help="Fetch immutable v0.2.1 release when not cached")
    args = parser.parse_args()
    if not args.source.exists():
        if not args.download:
            parser.error("Source ZIP missing. Run with --download or provide --source.")
        download_source(args.source)
    generate(args.source, args.output, args.mapping)


if __name__ == "__main__":
    main()
