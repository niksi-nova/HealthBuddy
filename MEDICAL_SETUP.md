# Medical Report System - Setup Guide

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd extraction-service
pip install -r requirements.txt
```

### 2. Start Python Extraction Service

```bash
cd extraction-service
python app.py
```

Service will run on **http://localhost:3001**

### 3. Start Backend (Node.js)

```bash
cd backend
npm run dev
```

Backend runs on **http://localhost:3002**

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5175**

---

## 📋 Features Implemented

### ✅ Core Features
- **PDF Upload** - Drag & drop or click to upload medical reports
- **Deterministic Extraction** - Regex-based parsing (NO LLM for values)
- **Lab Results Storage** - Time-series data in MongoDB
- **Member-Level Security** - Access control enforced
- **Mobile Responsive** - Works on all screen sizes

### 🎨 UI/UX
- Glassmorphism theme maintained
- Sage/terracotta color palette
- Responsive design (mobile-first)
- Drag & drop file upload
- Real-time upload progress

---

## 🔒 Security

- ✅ Member-level access control
- ✅ File type validation (PDF only)
- ✅ File size limits (10MB max)
- ✅ Deterministic extraction (no AI hallucination)
- ✅ Secure file storage

---

## 📁 New Files Created

### Backend
- `/backend/models/MedicalReport.js` - Report metadata schema
- `/backend/models/LabResult.js` - Lab values schema
- `/backend/routes/medical.js` - API endpoints

### Frontend
- `/frontend/src/pages/MemberHealthDashboard.jsx` - Main health page
- `/frontend/src/components/medical/ReportUpload.jsx` - Upload component

### Python Service
- `/extraction-service/app.py` - FastAPI service
- `/extraction-service/extractor.py` - PDF parser
- `/extraction-service/requirements.txt` - Dependencies

---

## 🧪 Testing

### Upload a Report
1. Navigate to family member's health page
2. Click "📄 Reports" tab
3. Upload a PDF medical report
4. Select report date
5. Click "Upload & Extract"

### Expected Result
- Report uploaded successfully
- Biomarkers extracted and displayed
- Status shows "✓ X markers"

---

## 🔧 Troubleshooting

**Python service not starting?**
- Make sure Python 3.8+ is installed
- Install dependencies: `pip install -r requirements.txt`

**Upload failing?**
- Check Python service is running on port 3001
- Check backend can reach http://localhost:3001
- Check file is PDF and under 10MB

**No markers extracted?**
- PDF format may not be supported
- Try a different medical report PDF

---

## 🚧 Coming Soon

- Biomarker trend charts
- RAG chatbot with Gemini
- Reference range validation
- Abnormal value highlighting

