import cv2
import numpy as np

def detect_roads(image_path, output_path):
    # Load the image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not open or find the image '{image_path}'")
        return

    # Convert to HSV color space
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Define range for white color (roads are usually white/light gray)
    # Sensitivity allows for some grayness
    lower_white = np.array([0, 0, 230])
    upper_white = np.array([180, 50, 255])

    # Threshold the HSV image to get only white colors
    mask = cv2.inRange(hsv, lower_white, upper_white)

    # Apply some morphology to clean up noise
    kernel = np.ones((3,3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, kernel, iterations=1)

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter contours by area to remove small noise (like text)
    min_area = 50
    large_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]

    # Draw contours on the original image
    # Drawing green lines (thickness 2) on the contours
    # If we want to fill the road, use -1 as thickness
    # The request says "draw a green line on all the roads", so highlighting the edges or the road itself.
    # Let's fill it for better visibility or draw the outline.
    # "Draw a green line on all the roads" -> sounds like tracing them.
    # I will draw the contours with a green line.
    cv2.drawContours(img, large_contours, -1, (0, 255, 0), 2)

    # Save the result
    cv2.imwrite(output_path, img)
    print(f"Road detection complete. Saved to '{output_path}'")

if __name__ == "__main__":
    detect_roads('map_image.png', 'road_detected.png')
