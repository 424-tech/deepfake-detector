import time
import io
import os
from typing import Optional, Dict, Any, List
from contextlib import contextmanager

try:
    from realitydefender import RealityDefender
except ImportError:
    RealityDefender = None

from .config import settings
from .utils import temp_file_context

class RealityDefenderService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.REALITY_DEFENDER_API_KEY
        self.rd = None
        
        print(f"DEBUG: Initializing RD Service. Key present: {bool(self.api_key)}")
        print(f"DEBUG: RealityDefender class imported: {RealityDefender is not None}")

        if self.api_key and RealityDefender:
            try:
                self.rd = RealityDefender(api_key=self.api_key)
                print("DEBUG: RealityDefender instance created successfully.")
            except Exception as e:
                print(f"DEBUG: Failed to initialize RealityDefender: {e}")
        else:
            if not self.api_key:
                print("DEBUG: No API Key found.")
            if not RealityDefender:
                print("DEBUG: realitydefender package not found. Is it installed?")

    def is_available(self) -> bool:
        return self.rd is not None

    def discover_sdk_methods(self) -> List[str]:
        """Discover available SDK methods"""
        if not self.rd:
            return []
        
        available_methods = []
        for attr_name in dir(self.rd):
            if not attr_name.startswith('_'):
                attr = getattr(self.rd, attr_name)
                if callable(attr):
                    available_methods.append(attr_name)
        return available_methods

    def extract_job_id(self, response: Any) -> Optional[str]:
        """Extract job ID from various response formats"""
        if isinstance(response, str):
            return response
        elif isinstance(response, dict):
             # Try common field names
            for field in ['id', 'job_id', 'request_id', 'upload_id', 'task_id', 'uuid']:
                if field in response:
                    return response[field]
        return None

    def poll_for_results(self, job_id: str, max_attempts: int = 20) -> Dict[str, Any]:
        """Poll for results with exponential backoff"""
        for attempt in range(max_attempts):
            try:
                if hasattr(self.rd, 'get_result'):
                    result = self.rd.get_result(job_id)
                elif hasattr(self.rd, 'get_prediction'):
                    result = self.rd.get_prediction(job_id)
                elif hasattr(self.rd, 'check_status'):
                    result = self.rd.check_status(job_id)
                else:
                    raise Exception("No polling method available")

                if result and isinstance(result, dict):
                    status = str(result.get('status', '')).lower()
                    if status in ['completed', 'done', 'finished', 'success']:
                        return result
                    elif status in ['failed', 'error']:
                        raise Exception(f"Analysis failed: {result}")
                    elif status in ['processing', 'pending', 'running']:
                        # Continue polling
                        pass
                    else:
                        # Check if we have actual results regardless of status
                        if any(key in result for key in ['prediction', 'score', 'label', 'confidence']):
                            return result

                # Exponential backoff: 1s, 2s, 4s, 8s, max 10s
                wait_time = min(2 ** attempt, 10)
                time.sleep(wait_time)

            except Exception as e:
                if attempt == max_attempts - 1:
                    raise Exception(f"Polling failed after {max_attempts} attempts: {e}")
                time.sleep(2)

        raise TimeoutError("Polling timed out")

    def analyze(self, file_bytes: bytes, filename: str = "image.jpg") -> Optional[Dict[Any, Any]]:
        """Analyze image using Reality Defender SDK with method discovery"""
        if not self.rd:
            print("DEBUG: Reality Defender SDK not initialized.")
            raise Exception("Reality Defender SDK not initialized (missing API Key or package)")

        available_methods = self.discover_sdk_methods()
        print(f"DEBUG: Available RD methods: {available_methods}")
        result = None

        # Strategy 1: Prioritize 'detect_file' with a real temporary file (Most Robust)
        if 'detect_file' in available_methods:
            try:
                print("DEBUG: Trying RD method 'detect_file'...")
                with temp_file_context(file_bytes) as temp_path:
                    result = self.rd.detect_file(temp_path)
                if result:
                    print("DEBUG: 'detect_file' succeeded.")
                    return result
            except Exception as e:
                print(f"DEBUG: 'detect_file' failed: {e}")

        # Strategy 2: Try file-like object upload (Robust)
        if hasattr(self.rd, 'upload'):
            try:
                print("DEBUG: Trying RD method 'upload' (file-like object)...")
                file_obj = io.BytesIO(file_bytes)
                file_obj.name = filename
                
                # Some SDK versions want 'file' arg, some 'image'
                # generic upload often returns a parsed response or job id
                result = self.rd.upload(file_obj)
                
                # Check if it returned a job ID for polling
                job_id = self.extract_job_id(result)
                if job_id:
                     print(f"DEBUG: Upload returned Job ID {job_id}. Polling...")
                     result = self.poll_for_results(job_id)
                     print("DEBUG: Polling complete.")
                     return result
                     
                if result:
                    print("DEBUG: 'upload' returned immediate result.")
                    return result

            except Exception as e:
                print(f"DEBUG: 'upload' failed: {e}")

        # Strategy 3: Direct byte methods (Fallback)
        direct_methods = [
            ('analyze_image', lambda: self.rd.analyze_image(file_bytes)),
            ('detect_image', lambda: self.rd.detect_image(file_bytes)),
            ('predict', lambda: self.rd.predict(file_bytes)),
        ]

        for method_name, method_call in direct_methods:
            if method_name in available_methods:
                try:
                    print(f"DEBUG: Trying RD method '{method_name}'...")
                    result = method_call()
                    if result:
                        print(f"DEBUG: '{method_name}' succeeded.")
                        return result
                except Exception as e:
                    print(f"DEBUG: '{method_name}' failed: {e}")
                    continue

        print("DEBUG: All RD methods failed or returned no result.")
        return result
