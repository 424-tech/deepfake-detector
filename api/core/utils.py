import os
import tempfile
from contextlib import contextmanager
from typing import Dict, Any, List

@contextmanager
def temp_file_context(file_bytes: bytes, suffix: str = ".jpg"):
    """Context manager for temporary file handling"""
    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(file_bytes)
            temp_file_path = temp_file.name
        yield temp_file_path
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

def convert_numpy_to_python(obj: Any) -> Any:
    """
    Recursively convert NumPy types to standard Python types for JSON serialization.
    """
    import numpy as np

    if isinstance(obj, dict):
        return {k: convert_numpy_to_python(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_to_python(i) for i in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_to_python(i) for i in obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return 0.0
        return float(obj)
    elif isinstance(obj, float):
        import math
        if math.isnan(obj) or math.isinf(obj):
            return 0.0
        return obj
    elif isinstance(obj, np.ndarray):
        return [convert_numpy_to_python(i) for i in obj.tolist()]
    else:
        return obj

def get_risk_assessment(confidence_score: float) -> Dict[str, Any]:
    """Get risk assessment based on confidence score"""
    if confidence_score >= 0.8:
        return {
            "level": "HIGH",
            "color": "red",
            "emoji": "🚨",
            "description": "Strong indicators of manipulation detected. This image likely contains deepfake characteristics.",
            "recommendations": [
                "Exercise extreme caution before trusting this image",
                "Consider additional verification methods",
                "Check the source and context carefully"
            ]
        }
    elif confidence_score >= 0.5:
        return {
            "level": "MEDIUM",
            "color": "orange",
            "emoji": "⚠️",
            "description": "Some suspicious patterns detected. The image may have been manipulated.",
            "recommendations": [
                "Verify the source of the image",
                "Look for additional evidence of authenticity",
                "Consider the context and plausibility"
            ]
        }
    else:
        return {
            "level": "LOW",
            "color": "green",
            "emoji": "✅",
            "description": "The image appears to be authentic with no strong indicators of manipulation.",
            "recommendations": [
                "Image appears legitimate based on analysis",
                "Standard verification practices still apply",
                "Consider the source and context as always"
            ]
        }

def save_analysis_report(image_name: str, detection_result: Dict[str, Any], features: Dict[str, Any]) -> str:
    """Generate a downloadable analysis report"""
    import numpy as np
    
    report = f"""
DEEPFAKE DETECTION ANALYSIS REPORT
==================================

Image: {image_name}
Analysis Date: {np.datetime64('now')}

DETECTION RESULTS:
- Prediction: {'POTENTIAL DEEPFAKE' if detection_result.get('prediction') else 'APPEARS AUTHENTIC'}
- Confidence: {detection_result.get('confidence', 0)*100:.1f}%
- Anomaly Score: {detection_result.get('anomaly_score', 0):.3f}

FEATURE ANALYSIS:
"""
    
    if 'feature_analysis' in detection_result:
        for feature, score in detection_result['feature_analysis'].items():
            report += f"- {feature.replace('_', ' ').title()}: {score*100:.1f}%\n"
    
    report += f"""

RAW FEATURES:
{str(features)}

METHODOLOGY:
This analysis uses statistical and machine learning techniques to identify
potential deepfake characteristics in images.
"""
    return report
