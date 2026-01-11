import unittest
import os
import cv2
import numpy as np
from road_detection import detect_roads

class TestRoadDetection(unittest.TestCase):
    def setUp(self):
        self.input_image = 'test_input_map.png'
        self.output_image = 'test_output_road.png'

        # Create a dummy image for testing
        # White background with a black line (road?)
        # Actually our logic looks for WHITE roads.
        # So let's make a gray background and a white line.
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        img[:] = (128, 128, 128) # Gray background
        cv2.line(img, (10, 50), (90, 50), (255, 255, 255), 5) # White road
        cv2.imwrite(self.input_image, img)

    def tearDown(self):
        if os.path.exists(self.input_image):
            os.remove(self.input_image)
        if os.path.exists(self.output_image):
            os.remove(self.output_image)

    def test_detect_roads_creates_file(self):
        detect_roads(self.input_image, self.output_image)
        self.assertTrue(os.path.exists(self.output_image), "Output image should be created")

        # Verify that the output image has some green content
        out_img = cv2.imread(self.output_image)
        # Check for green pixels [0, 255, 0]
        # Note: OpenCV uses BGR, so Green is (0, 255, 0)
        # We can check if there are pixels where G=255 and R=0, B=0 (or close to it)
        # The drawContours uses exactly (0, 255, 0).

        green_mask = (out_img[:, :, 0] == 0) & (out_img[:, :, 1] == 255) & (out_img[:, :, 2] == 0)
        self.assertTrue(np.any(green_mask), "Output image should contain green pixels indicating detected roads")

if __name__ == '__main__':
    unittest.main()
