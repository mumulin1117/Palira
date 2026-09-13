# Paliro Box Image Sources

The 39 local `paliro-box-*.jpg` fixtures are sourced from Unsplash photographs and delivered at build-time through Lorem Picsum. Exact local filenames, photographers, Unsplash pages, and download URLs are recorded in `paliro-box-image-sources.json`.

- License: [Unsplash License](https://unsplash.com/license)
- Review date: 2026-09-13
- App use: local mock Box posts only; the files are not redistributed as a standalone image library.
- Selection review: no prominent recognizable faces, visible watermarks, brand marks, or fictional characters were intentionally selected.
- Release note: Unsplash explains that copyright permission does not replace any model, property, or trademark release that a particular use may require. Re-check the source page before production publication if the image use or context changes.

Run `node scripts/paliro-download-box-images.mjs` to reproduce the local assets from the recorded sources.
