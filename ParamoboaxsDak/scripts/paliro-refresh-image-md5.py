import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image


root = Path(__file__).resolve().parents[2]
directory = root / 'PaDlroliroBox/PaDlroliroBox/PaliroBloomMedia'
backup = Path(tempfile.mkdtemp(prefix='PaliroBloomMedia-originals-', dir=root.parent))
quality = '98.6234077'
report = []
images = sorted(directory.glob('*.png'))
for original in images:
    shutil.copy2(original, backup / original.name)

with tempfile.TemporaryDirectory(prefix='paliro-image-encoding-') as temporary:
    for original in images:
        output = Path(temporary) / original.name
        subprocess.run(['sips', '-s', 'format', 'png', '-s', 'formatOptions', quality,
                        str(original), '--out', str(output)], check=True, capture_output=True)
        with Image.open(original) as before, Image.open(output) as after:
            if before.size != after.size or before.convert('RGBA').tobytes() != after.convert('RGBA').tobytes():
                raise ValueError('Decoded pixels changed: ' + original.name)
            if before.info.get('icc_profile') != after.info.get('icc_profile'):
                raise ValueError('ICC profile changed: ' + original.name)
        old = original.read_bytes()
        new = output.read_bytes()
        old_hash = hashlib.md5(old).hexdigest()
        new_hash = hashlib.md5(new).hexdigest()
        if old_hash == new_hash:
            raise ValueError('MD5 unchanged: ' + original.name)
        report.append({'file': original.name, 'beforeMD5': old_hash, 'afterMD5': new_hash,
                       'beforeBytes': len(old), 'afterBytes': len(new)})
    for original in images:
        shutil.copyfile(Path(temporary) / original.name, original)

result = {'qualityArgument': quality, 'encoder': 'macOS sips', 'backup': str(backup), 'images': report}
(backup / 'paliro-md5-report.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'verifiedImages': len(report), 'backup': str(backup),
                  'beforeBytes': sum(item['beforeBytes'] for item in report),
                  'afterBytes': sum(item['afterBytes'] for item in report)}))
