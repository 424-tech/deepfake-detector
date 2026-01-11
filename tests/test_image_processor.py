import unittest
import numpy as np
from PIL import Image
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from image_processor import ImageProcessor

class TestImageProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = ImageProcessor()
        # Create a dummy RGB image
        self.image = Image.new('RGB', (100, 100), color = 'red')

    def test_extract_features(self):
        features = self.processor.extract_features(self.image)

        self.assertIsInstance(features, dict)

        # Check for presence of key features
        expected_keys = [
            'noise_std', 'noise_variance',
            'mean_intensity', 'intensity_std',
            'edge_density',
            'texture_variance',
            'compression_consistency', 'artifact_score',
            'color_entropy', 'color_variance'
        ]

        for key in expected_keys:
            self.assertIn(key, features, f"Missing feature: {key}")
            self.assertIsInstance(features[key], (int, float, np.floating, np.integer))

    def test_resize_image(self):
        large_image = Image.new('RGB', (1000, 1000), color='blue')
        resized_image = self.processor._resize_image(large_image, max_size=512)

        width, height = resized_image.size
        self.assertLessEqual(max(width, height), 512)

if __name__ == '__main__':
    unittest.main()
