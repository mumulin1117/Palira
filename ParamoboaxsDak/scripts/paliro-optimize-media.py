import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile
from datetime import datetime, timezone

import oxipng
from PIL import Image


def digest(data):
    return hashlib.sha256(data).hexdigest()


def png_metadata(data):
    chunks = []
    position = 8
    while position < len(data):
        length = struct.unpack_from('>I', data, position)[0]
        kind = data[position + 4:position + 8]
        payload = data[position + 8:position + 8 + length]
        if kind != b'IDAT':
            chunks.append((kind, payload))
        position += length + 12
    return chunks


def visual_signature(data):
    with Image.open(io.BytesIO(data)) as image:
        signature = [image.size, image.info.get('loop'), image.info.get('comment')]
        for index in range(image.n_frames):
            image.seek(index)
            signature.append((image.info.get('duration'), digest(image.convert('RGBA').tobytes())))
        return signature


def validate(original, candidate, extension):
    if extension == '.png' and png_metadata(original) != png_metadata(candidate):
        raise ValueError('PNG non-IDAT chunks changed')
    if visual_signature(original) != visual_signature(candidate):
        raise ValueError('Decoded pixels, frames, duration or loop changed')


def main():
    parser = argparse.ArgumentParser(description='Lossless Paliro PNG/GIF optimization before native packaging')
    parser.add_argument('--backup', type=Path)
    parser.add_argument('--gifsicle')
    parser.add_argument('--verify-report', type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    if args.verify_report:
        report = json.loads(args.verify_report.read_text())
        for entry in report['files']:
            path = root / entry['path']
            current = path.read_bytes()
            if digest(current) != entry['resultSHA256']:
                raise ValueError('Result hash mismatch: ' + entry['path'])
            if path.suffix.lower() in {'.png', '.gif'}:
                original = (Path(report['backup']) / entry['path']).read_bytes()
                if digest(original) != entry['originalSHA256']:
                    raise ValueError('Backup hash mismatch: ' + entry['path'])
                validate(original, current, path.suffix.lower())
            elif entry['originalSHA256'] != entry['resultSHA256']:
                raise ValueError('Non-target resource changed: ' + entry['path'])
        print(f"Verified {len(report['files'])} resources, backups and decoded visuals")
        return
    if not args.backup or not args.gifsicle:
        parser.error('--backup and --gifsicle are required for optimization')
    roots = [root / 'ParamoboaxsDak/public/assets', root / 'PaDlroliroBox/PaDlroliroBox/Assets.xcassets']
    backup = args.backup.resolve()
    if backup == root or root in backup.parents:
        parser.error('Backup must be outside the project to avoid shipping originals')
    backup.mkdir(parents=True, exist_ok=False)
    files = sorted(path for folder in roots for path in folder.rglob('*') if path.is_file())
    report = {'created': datetime.now(timezone.utc).isoformat(), 'backup': str(backup), 'files': []}
    for path in files:
        if path.suffix.lower() in {'.png', '.gif'}:
            destination = backup / path.relative_to(root)
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, destination)
    with tempfile.TemporaryDirectory(prefix='paliro-media-') as temporary:
        cache = {}
        for path in files:
            original = path.read_bytes()
            extension = path.suffix.lower()
            entry = {'path': str(path.relative_to(root)), 'before': len(original), 'after': len(original),
                     'originalSHA256': digest(original), 'resultSHA256': digest(original), 'result': 'unchanged'}
            if extension in {'.png', '.gif'}:
                key = digest(original)
                candidate_path = Path(temporary) / (key + extension)
                try:
                    if key not in cache:
                        if extension == '.png':
                            oxipng.optimize(str(path), str(candidate_path), level=4,
                                            optimize_alpha=False, bit_depth_reduction=False,
                                            color_type_reduction=False, palette_reduction=False,
                                            grayscale_reduction=False, strip=oxipng.StripChunks.none())
                        else:
                            subprocess.run([args.gifsicle, '-O3', str(path), '-o', str(candidate_path)],
                                           check=True, capture_output=True)
                        candidate = candidate_path.read_bytes()
                        validate(original, candidate, extension)
                        cache[key] = candidate_path
                    candidate = cache[key].read_bytes()
                    if len(candidate) < len(original):
                        if path.read_bytes() != original:
                            raise RuntimeError('Source changed during optimization')
                        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as output:
                            output.write(candidate)
                            staging = Path(output.name)
                        shutil.copymode(path, staging)
                        os.replace(staging, path)
                        entry.update(after=len(candidate), resultSHA256=digest(candidate), result='optimized')
                    else:
                        entry['result'] = 'already compact'
                except (ValueError, subprocess.CalledProcessError) as error:
                    entry['result'] = 'kept original: ' + str(error)
            report['files'].append(entry)
            (backup / 'paliro-media-report.json').write_text(json.dumps(report, indent=2) + '\n')
            if extension in {'.png', '.gif'}:
                print(f"{entry['result']}: {entry['path']} ({entry['before']} -> {entry['after']})", flush=True)
    report['before'] = sum(entry['before'] for entry in report['files'])
    report['after'] = sum(entry['after'] for entry in report['files'])
    report['saved'] = report['before'] - report['after']
    (backup / 'paliro-media-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({key: report[key] for key in ['backup', 'before', 'after', 'saved']}))


if __name__ == '__main__':
    main()
