# Medical Report Extraction Service

Deterministic PDF parsing service for medical lab reports.

## Features

- ✅ Regex-based extraction (NO LLM)
- ✅ Prevents hallucination of medical values
- ✅ FastAPI REST endpoint
- ✅ PDF validation
- ✅ Structured JSON output

## Installation

```bash
cd extraction-service
pip install -r requirements.txt
```

## Running

```bash
python app.py
```

Service runs on `http://localhost:5001`

## API

### POST /extract-report

Extract lab markers from PDF.

**Request:**
- `file`: PDF file (multipart/form-data)
- `memberId`: Family member ID
- `reportDate`: Report date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "reportDate": "2024-01-15",
  "markers": [
    {
      "name": "Hemoglobin",
      "value": 13.5,
      "unit": "g/dL"
    }
  ],
  "count": 1
}
```

### GET /health

Health check endpoint.

## Security

- File type validation
- Deterministic parsing only
- No LLM usage
- No database access
