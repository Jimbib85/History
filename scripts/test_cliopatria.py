"""Offline import-contract checks; the real release is downloaded separately."""
import importlib.util
import io
import json
import tempfile
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("build_cliopatria", root / "scripts/build_cliopatria.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
assert module.atlas_year(-1) == 0
assert module.atlas_year(-500) == -499
assert module.atlas_year(1) == 1
assert module.atlas_year(2024) == 2024
polygon = {"type": "Polygon", "coordinates": [[[10,30],[20,30],[20,40],[10,40],[10,30]]]}
small = module.compact_geometry(polygon)
assert small and small["type"] == "MultiPolygon"
assert len(small["coordinates"][0][0]) >= 4
assert module.compact_geometry({"type": "Point", "coordinates": [12,24]}) is None
assert module.compact_geometry({"type": "Polygon", "coordinates": [[[0,0],[200,0],[2,3],[0,0]]]}) is None
fake = {"type": "FeatureCollection", "features": [
  {"type":"Feature", "properties":{"Name":"Roman Empire","FromYear":-31,"ToYear":100,"Type":"POLITY","Wikidata":"Q12544","Area":3000}, "geometry":polygon},
  {"type":"Feature", "properties":{"Name":"Wrong Empire","FromYear":-20,"ToYear":30,"Type":"POLITY","Wikidata":"Q12544"}, "geometry":polygon},
  {"type":"Feature", "properties":{"Name":"Roman Empire","FromYear":101,"ToYear":110,"Type":"POLITY","Wikidata":"Q999999"}, "geometry":polygon},
  {"type":"Feature", "properties":{"Name":"Roman Empire","FromYear":111,"ToYear":120,"Type":"RELATION","Wikidata":"Q12544"}, "geometry":polygon},
]}
sample = json.dumps(fake)
assert len(list(module.read_features(io.StringIO(sample),chunk_size=37))) == 4
with tempfile.TemporaryDirectory() as tmp:
    path = Path(tmp) / "cliopatria.zip"
    with zipfile.ZipFile(path,"w",compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr("cliopatria.geojson",sample)
    mapping=Path(tmp)/"map.json"
    mapping.write_text(json.dumps({"matches":{"rome":{"names":["Roman Empire"],"wikidata":["Q12544"]}}}),encoding="utf-8")
    output=Path(tmp)/"out"
    index=module.generate(path,output,mapping)
    assert index["matchedFeatures"] == 1
    assert index["reviewRejected"] == 1
    assert index["coverage"]["rome"]["from"] == -30
    assert index["coverage"]["rome"]["to"] == 100
    assert index["unmatchedAtlasIds"] == []
    record=json.loads((output/"rome.json").read_text())["records"][0]
    assert record["name"]=="Roman Empire"
    assert record["geometry"]["type"]=="MultiPolygon"
print("PASS Cliopatria importer: years, streaming, conservative identity rules, compact polygons and attribution")
