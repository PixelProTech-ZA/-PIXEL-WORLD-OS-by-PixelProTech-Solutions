# Pixel World OS

A discovery laboratory for PC operating systems, built by PixelProTech Solutions.

## Running it

This is a static PWA — no build step, no backend. It needs to be served over HTTP (not opened
directly as a `file://` URL, or the `fetch()` calls for JSON data and the service worker will fail).

```
cd pixelworldos
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. To install as an app, use your browser's
"Install app" / "Add to Home Screen" option once it's loaded once over http(s).

To deploy for real, upload the folder as-is to any static host (GitHub Pages, Netlify, Vercel,
S3+CloudFront, nginx, etc.) — everything is relative paths.

## What's actually implemented

- **Catalogue**: 49 real operating systems (`data/os/*.json`), each with accurate kernel, hardware,
  installation, and **real official URLs** (website, download, docs, source, community). No
  fabricated links. Unknown fields display "Not verified" rather than a guess.
- **Search & filters** across the whole catalogue (name, family, hardware, purpose, status).
- **Find an OS for my PC**: a rules-based filter over the documented hardware fields. It does
  **not** detect your real hardware — the app says so explicitly in the UI.
- **Comparison engine**: pick 2–4 systems, compare on a fixed attribute set.
- **OS family / DNA explorer**: grouped by documented lineage.
- **Pixel Driver Lab**: manufacturer-neutral driver guidance (Intel/AMD/NVIDIA GPUs, Intel/Realtek/
  Broadcom/MediaTek Wi-Fi, printers, firmware) linking only to official manufacturer pages, official
  kernel/OS documentation, or clearly-labeled community resources.
- **"Surprise me"**: picks a random experimental/alternative system from the catalogue.
- **Installable PWA**: manifest, service worker, offline shell that caches the app + catalogue data
  (never claims external OS download links work offline — there's an explicit offline banner).
- **About page**: a plain-language honesty statement about what is and isn't verified.

## What's intentionally NOT here yet (scope honesty)

The original brief asks for an "effectively unlimited" catalogue with hundreds/thousands of fully
verified entries, live-checked links, checksums, mirrors, and a broken-link reporting backend. That
volume of live-verified data isn't something that can be produced accurately in one pass without
either (a) spending an enormous number of live web searches per OS, or (b) fabricating data — the
brief itself forbids the latter. So this build ships:

- 49 accurately-researched, real records (not hundreds) — see `README.md` → "Expanding the catalogue"
  below for how to add more.
- Links compiled from training knowledge, **not live-fetched during this build**. They should be
  correct, but "Last verified" on each record honestly says "compiled, not live-checked."
- The "Report Broken Link" form has no backend — it says so on the page instead of pretending to submit.
- No automatic hardware detection, no real installation, no bypassing of Secure Boot/firmware/DRM —
  none of that is possible from a browser page, and the app never pretends otherwise.

## Expanding the catalogue

Add a new file to `data/os/<id>.json` following the schema used by the existing files (see any
existing record, e.g. `data/os/debian.json`), then regenerate the combined index:

```python
import json, os
records = [json.load(open(f"data/os/{f}")) for f in sorted(os.listdir("data/os"))]
json.dump(records, open("data/meta/catalogue.json", "w"), indent=2)
```

No frontend code changes are required — `app.js` reads entirely from `data/meta/catalogue.json`,
`categories.json`, `families.json`, and `drivers.json`.
