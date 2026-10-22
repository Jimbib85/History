# World History Atlas: 8000 BCE-500 BCE

Selective source-linked research staging package, generated 22 October 2026.

Start with RESEARCH_REPORT.md, then IMPORT_NOTES.md. data/quality_report.json contains calculated counts and the actual validation result. This is not a complete encyclopaedia, an independently peer-reviewed dataset or a tested live import.

## Files

- `data/`: canonical JSON arrays and equivalent JSONL, plus quality report.
- `csv/`: equivalent UTF-8 flat exports. Arrays/objects are JSON strings; null is an empty cell.
- `schemas/`: explicit structural contracts for exported table records.
- `geo/`: public heritage-reference points only.
- `review/`: claim ledger, source caveats and staging test output.
- `scripts/`: offline validator and non-destructive staging merger.
- `manifest.json`: byte sizes and SHA-256 for all other files.

Do not sum different format copies as additional records. Source rights remain source-specific; no third-party images, articles or historical boundaries are bundled. No blanket open licence over underlying sources is asserted.

Validation: `python scripts/validate_release.py . --manifest` (requires Python 3 and jsonschema).
Staging-only merge: `python scripts/staging_merge.py <pack-folder> --output <new-folder>`.

Research interval: [-7999, -498), 7501 numbered years. This is deliberately not described as a 500-year block.
