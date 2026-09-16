import importlib.util
import io
from pathlib import Path
import unittest

from PIL import Image, PngImagePlugin

spec = importlib.util.spec_from_file_location('paliro_media', Path(__file__).with_name('paliro-optimize-media.py'))
media = importlib.util.module_from_spec(spec)
spec.loader.exec_module(media)


def picture(color='red', compression=6, note=None):
    buffer = io.BytesIO()
    metadata = PngImagePlugin.PngInfo()
    if note:
        metadata.add_text('Description', note)
    Image.new('RGBA', (32, 32), color).save(buffer, format='PNG', compress_level=compression, pnginfo=metadata)
    return buffer.getvalue()


def animation(duration=100, loop=0):
    buffer = io.BytesIO()
    Image.new('RGB', (16, 16), 'red').save(buffer, format='GIF', save_all=True,
        append_images=[Image.new('RGB', (16, 16), 'blue')], duration=duration, loop=loop)
    return buffer.getvalue()


class MediaValidationTests(unittest.TestCase):
    def test_lossless_encoding_passes(self):
        media.validate(picture(compression=0), picture(compression=9), '.png')

    def test_changed_pixels_fail(self):
        with self.assertRaises(ValueError):
            media.validate(picture('red'), picture('blue'), '.png')

    def test_transparent_rgb_is_preserved(self):
        with self.assertRaises(ValueError):
            media.validate(picture((255, 0, 0, 0)), picture((0, 0, 0, 0)), '.png')

    def test_metadata_changes_fail(self):
        with self.assertRaises(ValueError):
            media.validate(picture(note='Paliro'), picture(), '.png')

    def test_animation_timing_changes_fail(self):
        with self.assertRaises(ValueError):
            media.validate(animation(100), animation(200), '.gif')

    def test_animation_loop_changes_fail(self):
        with self.assertRaises(ValueError):
            media.validate(animation(loop=0), animation(loop=1), '.gif')


if __name__ == '__main__':
    unittest.main()
