"""
Medical Report Extraction API
FastAPI service for deterministic PDF parsing
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import tempfile
import os
from datetime import datetime
from extractor import MedicalReportExtractor

app = FastAPI(title="Medical Report Extraction Service")

# CORS - allow Node.js backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://127.0.0.1:3002"],  # Node.js backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🚀 Starting Medical Report Extraction Service on port 3003...")


# Initialize extractor
extractor = MedicalReportExtractor()


class ExtractionResult(BaseModel):
    """Response model for extraction results"""
    success: bool
    reportDate: str
    markers: List[dict]
    count: int
    error: Optional[str] = None


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "extraction-service"}


@app.post("/extract-report", response_model=ExtractionResult)
async def extract_report(
    file: UploadFile = File(...),
    memberId: str = Form(...),
    reportDate: str = Form(...)
):
    """
    Extract lab markers from medical PDF report.
    
    SECURITY:
    - Validates file type (PDF only)
    - Uses deterministic parsing (NO LLM)
    - Returns structured data only
    
    Args:
        file: PDF file upload
        memberId: Family member ID
        reportDate: Report date (YYYY-MM-DD)
    
    Returns:
        ExtractionResult with markers list
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    # Validate date format
    try:
        datetime.strptime(reportDate, '%Y-%m-%d')
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )
    
    # Save uploaded file temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Extract using deterministic parser
        result = extractor.extract_from_pdf(tmp_path)
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        if not result['success']:
            raise HTTPException(
                status_code=500,
                detail=f"Extraction failed: {result.get('error', 'Unknown error')}"
            )
        
        # Format response
        markers = []
        for item in result['results']:
            try:
                markers.append({
                    "name": item['test'],
                    "value": float(item['result']),
                    "unit": item.get('unit', '')
                })
            except ValueError:
                # Skip non-numeric values
                continue
        
        return ExtractionResult(
            success=True,
            reportDate=reportDate,
            markers=markers,
            count=len(markers)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3003)
