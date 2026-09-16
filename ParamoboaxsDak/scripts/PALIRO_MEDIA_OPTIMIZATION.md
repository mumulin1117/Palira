# Paliro media optimization

## Scope

This build optimizes PNG and GIF encoding without resizing, quantization or
changing decoded pixels. MP4, JPEG, fonts and other files remain unchanged.
The source directories are `public/assets` and the active native project's
`Assets.xcassets`. Asset names, URLs, layout and application behavior are unchanged.

PNG checks preserve every non-IDAT chunk, including color metadata and transparency,
and compare decoded RGBA pixels. GIF checks compare every composited RGBA frame,
frame count, duration, loop and comments. A failed check or larger output keeps the
original. Identical source bytes reuse the same optimized bytes, keeping native and
HTML launch artwork identical.

## Current result

- 262 files checked; 154 smaller replacements accepted.
- Total inspected source size: 103,047,494 -> 84,803,832 bytes.
- Reduction: 18,243,662 bytes (17.40 MiB, approximately 17.7%).
- Native Web resource directory disk usage: 95,268 -> 78,644 KiB.
- The floating-box GIF was reduced from 9,698,854 to 8,205,931 bytes.
- The open-box-machine GIF was kept unchanged after visual/timing validation failed.
- Eleven PNG candidates changed non-IDAT metadata and were rejected.
- Original PNG/GIF files and a report are outside the project at
  `/Users/linqian/Documents/PaliroMediaOriginals-20260916`.
- `paliro-media-report.json` contains each path, sizes, hashes and acceptance result.

These are source/bundle resource measurements, not App Store download sizes.
First extraction may benefit from fewer bytes, but no runtime speed gain is claimed
without device measurements. Subsequent launches keep using the existing cache.

## Repeat when new artwork is added

Use Python with Pillow 12.3.0 and pyoxipng 9.1.1, plus Gifsicle 1.95. For example,
create a virtual environment and install `Pillow==12.3.0 pyoxipng==9.1.1` using pip.
Gifsicle source is available from https://www.lcdf.org/gifsicle/.
Run from the frontend directory, supplying a NEW backup folder outside the project:

```sh
python scripts/paliro-optimize-media.py --backup /absolute/path/to/new-backup --gifsicle /absolute/path/to/gifsicle
python scripts/paliro-optimize-media.py --verify-report /absolute/path/to/new-backup/paliro-media-report.json
python scripts/paliro-optimize-media.test.py
npm run ios:sync
```

Optimization happens on the development computer, not on the phone or every build.
Normal subsequent `ios:sync` builds reuse the optimized source files. That existing
pipeline archives and compresses them before two encryption layers. Startup/auth
resources remain plaintext under the existing allowlist. No cache/decryption or
encryption-key changes are needed.

To restore an individual original, copy its relative path from the external backup
over the corresponding source file and run `ios:sync` again. Restore both copies of
identical native/HTML launch artwork together. Do not place backup files in public,
dist or the native bundle.
