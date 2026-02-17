from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
from PIL import Image
import io

from ..core.reality_defender import RealityDefenderService
from ..core.forensics import DeepfakeDetector
from ..core.image_processing import ImageProcessor
from ..core.utils import get_risk_assessment, save_analysis_report, convert_numpy_to_python

router = APIRouter()

# Initialize services
rd_service = RealityDefenderService()
local_detector = DeepfakeDetector()
image_processor = ImageProcessor()

@router.get("/health")
async def health_check():
    return {"status": "ok", "services": {"reality_defender": rd_service.is_available()}}

@router.post("/analyze/local")
async def analyze_local(file: UploadFile = File(...)):
    """
    Analyze image using local forensic analysis (free, offline)
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # 1. Extract Features
        features = image_processor.extract_features(image)
        
        # 2. Predict
        result = local_detector.predict(features)
        
        # 3. Enhance result
        result["risk_assessment"] = get_risk_assessment(result["confidence"])
        
        response = {
            "status": "success",
            "mode": "local",
            "filename": file.filename,
            "data": result,
            "features": features # Optional: maybe too big/complex to return always? standard is usually OK.
        }
        return convert_numpy_to_python(response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local analysis failed: {str(e)}")

@router.post("/analyze/reality-defender")
async def analyze_rd(file: UploadFile = File(...)):
    """
    Analyze image using Reality Defender SDK (requires API Key)
    """
    if not rd_service.is_available():
        raise HTTPException(status_code=503, detail="Reality Defender SDK not available")
        
    try:
        contents = await file.read()
        
        # Call RD service
        # Note: This is synchronous, which might block. Ideally run in threadpool.
        import asyncio
        from functools import partial
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, partial(rd_service.analyze, contents, file.filename))
        
        if not result:
             raise HTTPException(status_code=500, detail="Reality Defender analysis returned no results")

        return {
            "status": "success",
            "mode": "reality_defender",
            "filename": file.filename,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reality Defender analysis failed: {str(e)}")

@router.post("/analyze/full")
def analyze_full(file: UploadFile = File(...)):
    """
    Run both local and Reality Defender analysis
    """
    # Synchronous read
    try:
        contents = file.file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")
    
    results = {}
    
    # Run Local
    try:
        features = image_processor.extract_features(image)
        local_result = local_detector.predict(features)
        local_result["risk_assessment"] = get_risk_assessment(local_result["confidence"])
        results["local"] = local_result
    except Exception as e:
        results["local"] = {"error": str(e)}

    # Run RD
    if rd_service.is_available():
        try:
            print("DEBUG: Starting RD Analysis...")
            # Direct synchronous call since we are in a sync def (run in threadpool)
            rd_result = rd_service.analyze(contents, file.filename)
            
            print("DEBUG: RD Analysis Complete!")
            results["reality_defender"] = rd_result
            
        except ValueError as ve:
             # Handle specific value errors (like empty response)
             print(f"Reality Defender Value Error: {ve}")
             results["reality_defender"] = {"error": f"Validation Error: {str(ve)}"}
        except Exception as e:
            print(f"Reality Defender analysis failed: {e}")
            # Check for common API errors in string
            err_str = str(e).lower()
            if "401" in err_str or "unauthorized" in err_str:
                 results["reality_defender"] = {"error": "API Key Invalid or Expired"}
            elif "429" in err_str or "rate limit" in err_str:
                 results["reality_defender"] = {"error": "API Rate Limit Exceeded"}
            else:
                 results["reality_defender"] = {"error": f"API Error: {str(e)}"}
    else:
         print("Reality Defender service not available.")
         results["reality_defender"] = {
             "status": "UNAVAILABLE",
             "message": "Reality Defender SDK not initialized. Ensure REALITY_DEFENDER_API_KEY is set in environment variables.",
             "available": False
         }
         
    response = {
        "status": "success",
        "filename": file.filename,
        "results": results
    }
    return convert_numpy_to_python(response)
