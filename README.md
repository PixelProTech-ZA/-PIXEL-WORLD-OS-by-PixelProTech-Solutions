# Pixel World OS

A discovery laboratory for PC operating systems, built by PixelProTech Solutions.

## Deploying (GitHub Pages web upload)

This folder is flat on purpose — every file sits at the root, no subfolders — so it survives
GitHub's "upload files" web UI, which has a history of dropping nested folders. Upload every file
in this folder as-is to the repo root. Nothing else is needed.

## Running it locally

Static PWA, no build step, no backend. Must be served over HTTP — not opened as a `file://` URL,
or the `fetch()` calls for the JSON data and the service worker will fail.

```
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html`. To install as an app, use your browser's "Install app" /
"Add to Home Screen" option once it's loaded once over http(s).

## What's actually implemented

- **Catalogue**: 49 real operating systems (`catalogue.json`), each with accurate kernel, hardware,
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

- 49 accurately-researched, real records (not hundreds) — see "Expanding the catalogue" below.
- Links compiled from training knowledge, **not live-fetched during this build**. They should be
  correct, but "Last verified" on each record honestly says "compiled, not live-checked."
- The "Report Broken Link" form has no backend — it says so on the page instead of pretending to submit.
- No automatic hardware detection, no real installation, no bypassing of Secure Boot/firmware/DRM —
  none of that is possible from a browser page, and the app never pretends otherwise.

## Expanding the catalogue

The deployed app reads only from `catalogue.json`, `categories.json`, `families.json`, and
`drivers.json` at the root — those are the only data files that ship. The 49 individual per-OS
source records (one JSON file per OS, used to author `catalogue.json`) are kept separately, outside
this deploy folder, so the live site stays flat. To add a new OS: add a record to your source
collection following the schema of any existing entry, then regenerate `catalogue.json` from the
full source set and re-upload just that one file — no frontend code changes needed, since `app.js`
reads entirely from the four root JSON files.
