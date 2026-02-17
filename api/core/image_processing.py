import numpy as np
from PIL import Image
from scipy import ndimage
from sklearn.preprocessing import MinMaxScaler
import warnings

warnings.filterwarnings('ignore')

class ImageProcessor:
    """
    Image processing class for feature extraction from images.
    Extracts various statistical and visual features that may indicate deepfakes.
    Uses lightweight scipy and numpy instead of heavy OpenCV for serverless compatibility.
    """
    
    def __init__(self):
        self.scaler = MinMaxScaler()
        
    def _rgb2gray(self, img_array):
        """Standard luminosity formula for grayscale conversion"""
        if len(img_array.shape) == 2:
            return img_array
        return np.dot(img_array[...,:3], [0.2989, 0.5870, 0.1140])

    def extract_features(self, image: Image.Image) -> dict:
        """
        Extract comprehensive features from an image for deepfake detection
        """
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image for consistent processing (maintain aspect ratio)
        image = self._resize_image(image, max_size=512)
        
        # Convert to numpy array
        img_array = np.array(image).astype(np.float32)
        
        # Extract various feature categories
        features = {}
        features.update(self._extract_noise_features(img_array))
        features.update(self._extract_pixel_features(img_array))
        features.update(self._extract_edge_features(img_array))
        features.update(self._extract_texture_features(img_array))
        features.update(self._extract_compression_features(img_array))
        features.update(self._extract_color_features(img_array))
        
        return features
    
    def _resize_image(self, image, max_size=512):
        """Resize image while maintaining aspect ratio"""
        width, height = image.size
        
        if max(width, height) > max_size:
            if width > height:
                new_width = max_size
                new_height = int((height * max_size) / width)
            else:
                new_height = max_size
                new_width = int((width * max_size) / height)
            
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        return image
    
    def _extract_noise_features(self, img_array):
        """Extract noise-related features"""
        features = {}
        
        # Convert to grayscale
        gray = self._rgb2gray(img_array)
        
        # Apply Gaussian blur and calculate difference (noise estimation)
        blurred = ndimage.gaussian_filter(gray, sigma=1.0)
        noise = gray - blurred
        
        # Noise statistics
        features['noise_std'] = np.std(noise) / 255.0
        features['noise_variance'] = np.var(noise) / (255.0 ** 2)
        features['noise_mean'] = abs(np.mean(noise)) / 255.0
        
        # High-frequency noise analysis
        laplacian = ndimage.laplace(gray)
        features['high_freq_variance'] = np.var(laplacian) / (255.0 ** 2)
        
        return features
    
    def _extract_pixel_features(self, img_array):
        """Extract pixel intensity and distribution features"""
        features = {}
        
        # Overall intensity statistics
        features['mean_intensity'] = np.mean(img_array) / 255.0
        features['intensity_std'] = np.std(img_array) / 255.0
        features['intensity_variance'] = np.var(img_array) / (255.0 ** 2)
        
        # Channel-wise statistics
        for i, channel in enumerate(['r', 'g', 'b']):
            channel_data = img_array[:, :, i]
            features[f'{channel}_mean'] = np.mean(channel_data) / 255.0
            features[f'{channel}_std'] = np.std(channel_data) / 255.0
        
        # Pixel value distribution
        hist, _ = np.histogram(img_array.flatten(), bins=50, range=(0, 255))
        hist_normalized = hist / (np.sum(hist) + 1e-7)
        features['pixel_entropy'] = -np.sum(hist_normalized * np.log(hist_normalized + 1e-7))
        
        # Intensity gradient features
        gray = self._rgb2gray(img_array)
        grad_x = ndimage.sobel(gray, axis=0)
        grad_y = ndimage.sobel(gray, axis=1)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        features['gradient_mean'] = np.mean(gradient_magnitude) / 255.0
        features['gradient_std'] = np.std(gradient_magnitude) / 255.0
        
        return features
    
    def _extract_edge_features(self, img_array):
        """Extract edge-related features"""
        features = {}
        
        # Convert to grayscale
        gray = self._rgb2gray(img_array)
        
        # Edge detection using Sobel magnitude thresholding (lighter than Canny)
        grad_x = ndimage.sobel(gray, axis=0)
        grad_y = ndimage.sobel(gray, axis=1)
        edge_strength = np.sqrt(grad_x**2 + grad_y**2)
        
        # Edge density (simplified threshold)
        threshold = 50.0
        features['edge_density'] = np.sum(edge_strength > threshold) / edge_strength.size
        
        features['edge_strength_mean'] = np.mean(edge_strength) / 255.0
        features['edge_strength_std'] = np.std(edge_strength) / 255.0
        
        # Edge coherence
        features['edge_coherence'] = self._calculate_edge_coherence(gray)
        
        return features
    
    def _calculate_edge_coherence(self, gray_img):
        """Calculate edge coherence score using scipy"""
        grad_x = ndimage.sobel(gray_img, axis=0)
        grad_y = ndimage.sobel(gray_img, axis=1)
        
        # Calculate gradient angles
        angles = np.arctan2(grad_y, grad_x)
        
        # Simplified circular variance calculation over the whole image
        # (Faster than sliding window and usually provides similar heuristic)
        cos_sum = np.mean(np.cos(2 * angles))
        sin_sum = np.mean(np.sin(2 * angles))
        return np.sqrt(cos_sum**2 + sin_sum**2)
    
    def _extract_texture_features(self, img_array):
        """Extract texture-related features"""
        features = {}
        gray = self._rgb2gray(img_array)
        
        # Texture variance using patch-wise standard deviation
        features['texture_variance'] = self._calculate_texture_variance(gray)
        
        # Texture energy (gradient magnitude average)
        grad_x = ndimage.sobel(gray, axis=0)
        grad_y = ndimage.sobel(gray, axis=1)
        energy = np.sqrt(grad_x**2 + grad_y**2)
        features['texture_energy'] = np.mean(energy) / 255.0
        
        return features
    
    def _calculate_texture_variance(self, gray_img):
        """Calculate texture variance without explicit loops where possible"""
        # Use generic filter to get local variance
        local_mean = ndimage.uniform_filter(gray_img, size=8)
        local_sq_mean = ndimage.uniform_filter(gray_img**2, size=8)
        local_var = local_sq_mean - local_mean**2
        return np.mean(local_var) / (255.0 ** 2)
    
    def _extract_compression_features(self, img_array):
        """Extract compression-related features"""
        features = {}
        gray = self._rgb2gray(img_array)
        
        # Consistency of local variance
        local_mean = ndimage.uniform_filter(gray, size=8)
        local_sq_mean = ndimage.uniform_filter(gray**2, size=8)
        local_var = local_sq_mean - local_mean**2
        
        # Simplified consistency metric
        consistency = 1.0 / (1.0 + np.var(local_var) / 10000.0)
        features['compression_consistency'] = min(1.0, consistency)
        
        # Blocking artifacts (simplified spectral analysis)
        features['artifact_score'] = self._detect_blocking_artifacts(gray)
        
        return features
    
    def _detect_blocking_artifacts(self, gray_img):
        """Detect blocking artifacts by checking 8-pixel periodicity"""
        h, w = gray_img.shape
        if h < 16 or w < 16:
            return 0.0
            
        # Check differences across 8-pixel boundaries
        h_diffs = np.abs(gray_img[8::8, :] - gray_img[7::8, :])
        v_diffs = np.abs(gray_img[:, 8::8] - gray_img[:, 7::8])
        
        artifact_score = (np.mean(h_diffs) + np.mean(v_diffs)) / 255.0
        return min(1.0, artifact_score)
    
    def _extract_color_features(self, img_array):
        """Extract color-related features"""
        features = {}
        
        # Color distribution entropy
        entropies = []
        for i in range(3):
            channel_data = img_array[:, :, i]
            hist, _ = np.histogram(channel_data, bins=32, range=(0, 255))
            hist_normalized = hist / (np.sum(hist) + 1e-7)
            ent = -np.sum(hist_normalized * np.log(hist_normalized + 1e-7))
            features[f'channel_{i}_entropy'] = ent
            entropies.append(ent)
        
        features['color_entropy'] = np.mean(entropies)
        features['color_variance'] = np.var(img_array) / (255.0 ** 2)
        
        # Color channel correlation
        r_flat = img_array[:, :, 0].flatten()
        g_flat = img_array[:, :, 1].flatten()
        b_flat = img_array[:, :, 2].flatten()
        
        features['rg_correlation'] = abs(np.corrcoef(r_flat, g_flat)[0, 1])
        features['rb_correlation'] = abs(np.corrcoef(r_flat, b_flat)[0, 1])
        features['gb_correlation'] = abs(np.corrcoef(g_flat, b_flat)[0, 1])
        
        return features
