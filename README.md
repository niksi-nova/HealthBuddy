# Family Health Dashboard 🏥

> An AI-powered, privacy-first medical record management system that helps families organize, analyze, and query their health data using advanced RAG (Retrieval-Augmented Generation) technology.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [How It Works](#how-it-works)
- [Installation \& Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [AI/ML Components](#aiml-components)
- [Security](#security)
- [Future Scope](#future-scope)
- [Contributing](#contributing)

---

## 🎯 Overview

**Family Health Dashboard** is a comprehensive health management platform that enables families to:
- Store and organize medical reports for all family members in one place
- Automatically extract and track blood test markers and lab results
- Ask natural language questions about medical history using AI
- Visualize health trends and identify abnormal readings
- Get instant health summaries and insights

The system uses a **RAG (Retrieval-Augmented Generation) pipeline** to provide accurate, source-backed answers to health queries without hallucinating information.

---

## ✨ Key Features

### 🔐 Admin-Controlled Family System
- Single admin account manages entire family health data
- Hierarchical family tree structure with unlimited members
- Secure authentication with JWT tokens
- Role-based access control

### 📄 Intelligent Document Processing
- **PDF Upload**: Upload any medical report (blood tests, X-rays, prescriptions)
- **Automatic Extraction**: Python-based deterministic PDF parsing extracts lab markers
- **OCR Support**: Image-based PDFs processed with text extraction
- **Cloud Storage**: Optional Cloudinary integration for secure document storage
- **Multi-format Support**: Handles various medical report formats

### 🧬 Blood Marker Analysis
- **Automatic Detection**: Extracts 40+ common blood test markers
- **Reference Ranges**: Gender-specific normal ranges for accurate abnormality detection
- **Trend Tracking**: Visualize marker changes over time with Chart.js
- **Abnormality Alerts**: Automatic flagging of out-of-range values
- **Health Timeline**: Color-coded timeline showing health status evolution

### 🤖 AI-Powered Medical Chatbot
- **RAG Pipeline**: Combines vector search with Google Gemini for context-aware responses
- **Anti-Hallucination**: Strictly answers only from uploaded medical records
- **Source Citations**: Every answer includes source document references
- **Confidence Scoring**: Transparency about answer reliability
- **Conversation History**: Maintains chat context per family member

### 📊 Health Visualization
- **Trend Graphs**: Interactive charts showing marker trends over time
- **Health Overview**: Comprehensive dashboard with status summaries
- **Change Detection**: Highlights significant changes between consecutive reports
- **Responsive Charts**: Mobile-friendly visualizations

### 🌳 Family Tree Visualization
- **Interactive Tree**: Visual representation of family structure
- **Quick Navigation**: Click any member to view their health dashboard
- **Status Indicators**: At-a-glance health status for each member

---

## 🎯 Use Cases

### For Families
- **Chronic Disease Management**: Track diabetes markers, cholesterol levels, thyroid function over time
- **Elderly Care**: Monitor elderly parents' health trends and share with doctors
- **Child Health**: Track children's growth markers and vaccination records
- **Medical History**: Quick access to past reports during doctor visits

### For Caregivers
- **Centralized Records**: All family member records in one secure location
- **Quick Queries**: "What was dad's last blood sugar reading?"
- **Trend Analysis**: Identify concerning patterns before they become critical
- **Report Sharing**: Easy export and sharing with healthcare providers

### For Personal Health
- **Preventive Care**: Track wellness markers and identify early warning signs
- **Treatment Tracking**: Monitor how treatments affect lab values
- **Second Opinions**: Organized records ready to share with specialists
- **Health Insights**: Ask questions like "How has my iron level changed this year?"

---

## 🛠️ Tech Stack

### Backend (Node.js)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18+ | Web framework |
| **MongoDB** | 8.0+ | Primary database (with vector search capability) |
| **Mongoose** | 8.0+ | ODM for MongoDB |
| **Google Gemini AI** | Latest | LLM for chatbot and embeddings |
| **JWT** | 9.0+ | Authentication tokens |
| **Multer** | 1.4+ | File upload handling |
| **Bcrypt** | 2.4+ | Password hashing |
| **Cloudinary** | 2.8+ | Cloud storage (optional) |
| **LangChain** | 0.1+ | RAG pipeline orchestration |
| **ChromaDB** | 3.2+ | Vector database (optional fallback) |

### Python Extraction Service
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.109+ | API framework |
| **PyMuPDF (fitz)** | 1.23+ | PDF parsing |
| **Uvicorn** | 0.27+ | ASGI server |
| **Pydantic** | 2.5+ | Data validation |

### Frontend (React)
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2+ | UI framework |
| **Vite** | 7.2+ | Build tool |
| **React Router** | 6.21+ | Client-side routing |
| **Axios** | 1.6+ | HTTP client |
| **Chart.js** | 4.4+ | Data visualization |
| **Zustand** | 4.4+ | State management |
| **Tailwind CSS** | 3.4+ | Styling framework |

---

## 🏗️ Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        UI[React Frontend<br/>Port 5173]
    end
    
    subgraph Backend["Backend Layer"]
        API[Express API Server<br/>Port 3002]
        PY[Python Extraction Service<br/>Port 3003]
    end
    
    subgraph Data["Data Layer"]
        DB[(MongoDB<br/>Atlas)]
        CLOUD[Cloudinary<br/>Storage]
    end
    
    subgraph AI["AI Layer"]
        GEMINI[Google Gemini]
        EMB[Embedding Service]
        RAG[RAG Pipeline]
    end
    
    UI -->|HTTP/REST| API
    API -->|PDF Upload| PY
    PY -->|Extracted Data| API
    API -->|Store/Query| DB
    API -->|Upload Files| CLOUD
    API -->|Generate Embeddings| EMB
    API -->|Query with Context| RAG
    EMB -->|Text-Embedding-004| GEMINI
    RAG -->|Gemini-1.5-Flash| GEMINI
    
    style UI fill:#8B9D83
    style API fill:#D4A59A
    style PY fill:#E8B44F
    style DB fill:#A8C5DD
    style GEMINI fill:#E6B8AF
```

### Component Diagram

```mermaid
graph LR
    subgraph Frontend
        A[Pages] --> B[Components]
        B --> C[UI Components]
        A --> D[Context/Store]
        A --> E[Utils/API Client]
    end
    
    subgraph Backend
        F[Server.js] --> G[Routes]
        G --> H[Controllers/Middleware]
        H --> I[Services]
        I --> J[Models]
        I --> K[External APIs]
    end
    
    E -->|REST API| F
    K -->|PDF Processing| PY[Python Service]
    K -->|AI Queries| GEM[Gemini API]
    J -->|CRUD| DB[(MongoDB)]
```

---

## 📂 Project Structure

```
family-health-dashboard/
│
├── backend/                          # Node.js Express API
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   └── gemini.js                # Google Gemini configuration
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   ├── errorHandler.js          # Global error handling
│   │   └── validation.js            # Request validation
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── User.js                  # Admin user model
│   │   ├── FamilyMember.js          # Family member model
│   │   ├── MedicalReport.js         # Report metadata
│   │   ├── LabResult.js             # Individual lab markers
│   │   ├── MedicalRecord.js         # Document chunks + embeddings
│   │   └── ChatHistory.js           # Conversation logs
│   │
│   ├── routes/                       # API endpoints
│   │   ├── auth.js                  # Authentication routes
│   │   ├── family.js                # Family member CRUD
│   │   ├── medical.js               # Report upload & retrieval
│   │   ├── chat.js                  # Chatbot interaction
│   │   └── records.js               # Medical record management
│   │
│   ├── services/                     # Business logic
│   │   ├── aiService.js             # RAG pipeline implementation
│   │   ├── embeddingService.js      # Text chunking & embedding
│   │   ├── extractionService.js     # Calls Python service
│   │   ├── geminiService.js         # Gemini API wrapper
│   │   ├── chromaService.js         # Vector DB (optional)
│   │   └── cloudStorageService.js   # Cloudinary integration
│   │
│   ├── utils/
│   │   ├── referenceRanges.js       # Blood marker normal ranges
│   │   └── healthAnalysis.js        # Abnormality detection logic
│   │
│   ├── server.js                     # Express app entry point
│   ├── package.json
│   └── .env                          # Environment variables
│
├── extraction-service/               # Python FastAPI service
│   ├── app.py                       # FastAPI server
│   ├── extractor.py                 # PDF parsing logic
│   ├── requirements.txt
│   └── venv/                        # Python virtual environment
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Authentication page
│   │   │   ├── Signup.jsx           # Registration page
│   │   │   ├── FamilyTreeDashboard.jsx  # Main dashboard
│   │   │   └── MemberHealthDashboard.jsx # Individual health view
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   │   ├── GlassCard.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   └── Modal.jsx
│   │   │   │
│   │   │   ├── family/
│   │   │   │   ├── FamilyTreeVisualization.jsx
│   │   │   │   ├── AddMemberModal.jsx
│   │   │   │   └── FamilyHealthSummary.jsx
│   │   │   │
│   │   │   ├── health/
│   │   │   │   ├── HealthOverview.jsx
│   │   │   │   ├── HealthTimeline.jsx
│   │   │   │   ├── MarkerTrendGraph.jsx
│   │   │   │   └── ChangeSummary.jsx
│   │   │   │
│   │   │   └── medical/
│   │   │       ├── ReportUpload.jsx
│   │   │       └── MedicalChatbot.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication state
│   │   │
│   │   ├── store/
│   │   │   └── familyStore.js       # Zustand state management
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── constants.js         # App constants
│   │   │   └── helpers.js           # Utility functions
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   │
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                          # Frontend environment variables
│
├── IMPLEMENTATION_GUIDE.md          # Developer guide
├── CHATBOT_SETUP.md                 # AI setup instructions
├── MEDICAL_SETUP.md                 # Medical features guide
├── CLOUDINARY_SETUP.md              # Cloud storage setup
└── README.md                         # This file
```

---

## 🔄 Data Flow

### 1. Document Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Node.js API
    participant PY as Python Service
    participant DB as MongoDB
    participant CLOUD as Cloudinary
    participant AI as Gemini

    U->>F: Upload PDF + metadata
    F->>API: POST /api/medical/upload/:memberId
    API->>API: Validate file, save locally
    
    API->>PY: POST /extract-report
    PY->>PY: Parse PDF, extract markers
    PY-->>API: Return {markers: [...]}
    
    API->>DB: Save MedicalReport
    API->>DB: Save LabResults[]
    
    opt Cloud Storage Enabled
        API->>CLOUD: Upload PDF
        CLOUD-->>API: Return URL
    end
    
    API->>AI: Generate embeddings for chunks
    AI-->>API: Return vectors
    API->>DB: Save MedicalRecord with embeddings
    
    API-->>F: Success response
    F-->>U: Show extracted markers
```

### 2. RAG Query Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Node.js API
    participant DB as MongoDB
    participant AI as Gemini

    U->>F: Ask question
    F->>API: POST /api/chat/message
    
    API->>AI: Generate question embedding
    AI-->>API: Return query vector
    
    API->>DB: Vector search (cosine similarity)
    DB-->>API: Return top 5 relevant chunks
    
    API->>API: Build context from chunks
    
    API->>AI: Generate answer (with anti-hallucination prompt)
    AI-->>API: Return answer + confidence
    
    API->>DB: Save to ChatHistory
    
    API-->>F: {answer, sources, confidence}
    F-->>U: Display response with citations
```

### 3. Health Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    API as Node.js API
    participant DB as MongoDB

    U->>F: View health dashboard
    F->>API: GET /api/medical/health-overview/:memberId
    
    API->>DB: Fetch all reports for member
    DB-->>API: Return reports[]
    
    API->>DB: Fetch all lab results for reports
    DB-->>API: Return labResults[]
    
    API->>API: Group by marker name
    API->>API: Apply reference ranges
    API->>API: Calculate trends
    API->>API: Identify abnormalities
    
    API-->>F: {timeline, markers, summary}
    F->>F: Render charts with Chart.js
    F-->>U: Display visualization
```

---

## 🧠 How It Works

### Medical Chatbot (RAG Pipeline)

The chatbot uses a sophisticated **Retrieval-Augmented Generation (RAG)** pipeline to ensure accurate, hallucination-free responses:

#### Step 1: Document Ingestion
- User uploads PDF report
- Python service extracts text using PyMuPDF
- Text is split into chunks (~500 characters with 50-character overlap)
- Each chunk is converted to a 768-dimensional vector using Gemini's `text-embedding-004` model
- Chunks and embeddings stored in MongoDB

#### Step 2: Query Processing
- User asks a question (e.g., "What was my last cholesterol reading?")
- Question is converted to embedding using the same model
- Vector search finds the 5 most similar chunks using cosine similarity
- Retrieved chunks are ranked by relevance score

#### Step 3: Answer Generation
- System builds context by concatenating relevant chunks
- Sends context + question to Gemini 1.5 Flash with strict prompt:
  ```
  "You are a medical assistant. ONLY use information from the provided sources.
  If the answer isn't in the sources, say 'I don't have that information.'
  Always cite which source you're using."
  ```
- Gemini generates response grounded in retrieved context
- System assigns confidence score (high/medium/low/none)

#### Step 4: Source Citation
- Extract source documents from retrieved chunks
- Return answer with citations (filename, upload date, relevance score)
- Store conversation in ChatHistory for context

### Blood Marker Extraction

The system uses **deterministic parsing** (not AI) for accuracy:

1. **PDF Parsing**: PyMuPDF extracts tables and text from PDF
2. **Pattern Matching**: Regex patterns identify lab marker names, values, units
3. **Normalization**: Values converted to standard units (mg/dL, g/dL, etc.)
4. **Reference Ranges**: Gender-specific normal ranges applied from `referenceRanges.js`
5. **Abnormality Detection**: 
   ```javascript
   isAbnormal = value < minNormal || value > maxNormal
   ```
6. **Trend Calculation**: Compare with previous report to detect increase/decrease

### Vector Search (Fallback)

If MongoDB Atlas vector search isn't configured:
- In-memory cosine similarity calculation:
  ```javascript
  similarity = dotProduct(vec1, vec2) / (norm(vec1) * norm(vec2))
  ```
- Sort all chunks by similarity score
- Return top K results

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+ and pip
- **MongoDB** (local or Atlas cluster)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Cloudinary Account** (optional, for cloud storage)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/family-health-dashboard.git
cd family-health-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
# Server
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/family-health
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/family-health

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=30d

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Python Service
EXTRACTION_SERVICE_URL=http://localhost:3003

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Python Service Setup

```bash
cd ../extraction-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3002/api
```

---

## ▶️ Running the Application

### Development Mode (3 terminals)

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:3002`

**Terminal 2 - Python Service**:
```bash
cd extraction-service
source venv/bin/activate
python app.py
```
Service runs on `http://localhost:3003`

**Terminal 3 - Frontend**:
```bash
cd frontend
npm run dev
```
App opens at `http://localhost:5173`

### Production Mode

**Backend**:
```bash
cd backend
npm start
```

**Python Service** (with Gunicorn):
```bash
cd extraction-service
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app --bind 0.0.0.0:3003
```

**Frontend** (build and serve):
```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register new admin user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "dateOfBirth": "1980-01-15",
  "gender": "Male"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": { "_id": "...", "name": "John Doe", "email": "..." }
}
```

#### POST `/api/auth/login`
Login with credentials
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### GET `/api/auth/me`
Get current user (requires auth token)

---

### Family Member Endpoints

#### POST `/api/family/members`
Add family member
```json
{
  "name": "Jane Doe",
  "relationship": "Daughter",
  "dateOfBirth": "2010-05-20",
  "gender": "Female",
  "bloodGroup": "A+",
  "parentMemberId": null
}
```

#### GET `/api/family/members`
Get all family members (includes admin)

#### PUT `/api/family/members/:memberId`
Update member details

#### DELETE `/api/family/members/:memberId`
Delete member and all their records

---

### Medical Report Endpoints

#### POST `/api/medical/upload/:memberId`
Upload medical report (PDF)
- **Content-Type**: `multipart/form-data`
- **Fields**: 
  - `report` (file): PDF file
  - `reportDate` (string): YYYY-MM-DD
  - `reportType` (string): "Blood Test", "X-Ray", etc.

Response:
```json
{
  "success": true,
  "report": {
    "_id": "...",
    "reportDate": "2024-02-01",
    "markerCount": 12
  },
  "markers": [
    {
      "name": "Total Cholesterol",
      "value": 180,
      "unit": "mg/dL",
      "isAbnormal": false
    }
  ]
}
```

#### GET `/api/medical/reports/:memberId`
Get all reports for member

#### GET `/api/medical/lab-results/:reportId`
Get lab results for specific report

#### GET `/api/medical/health-overview/:memberId`
Get comprehensive health analysis
```json
{
  "success": true,
  "timeline": [
    {
      "reportId": "...",
      "date": "2024-02-01",
      "status": "normal",
      "abnormalCount": 0
    }
  ],
  "markers": {
    "Total Cholesterol": [
      { "value": 180, "date": "2024-02-01", "isAbnormal": false }
    ]
  },
  "summary": {
    "latestReport": {...},
    "changes": [...]
  }
}
```

#### DELETE `/api/medical/reports/:reportId`
Delete report and associated lab results

---

### Chat Endpoints

#### POST `/api/chat/message`
Send message to chatbot
```json
{
  "familyMemberId": "member_id_here",
  "message": "What was my last blood sugar level?"
}
```

Response:
```json
{
  "success": true,
  "answer": "According to Source 1, your last blood sugar was 95 mg/dL...",
  "sources": [
    {
      "recordId": "...",
      "fileName": "blood-test-jan-2024.pdf",
      "uploadDate": "2024-01-15",
      "relevanceScore": 0.92
    }
  ],
  "confidence": "high"
}
```

#### GET `/api/chat/history/:memberId`
Get chat history for member

#### DELETE `/api/chat/history/:memberId`
Clear chat history

---

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  profilePicture: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### FamilyMember Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  relationship: String,
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  profilePicture: String,
  parentMemberId: ObjectId (ref: FamilyMember, nullable),
  createdAt: Date
}
```

### MedicalReport Model
```javascript
{
  _id: ObjectId,
  familyMemberId: ObjectId,
  reportDate: Date (indexed),
  reportType: String,
  originalFileName: String,
  filePath: String,
  cloudUrl: String,
  cloudPublicId: String,
  extractionStatus: String (enum: processing, completed, failed),
  markerCount: Number,
  uploadDate: Date (indexed)
}
```

### LabResult Model
```javascript
{
  _id: ObjectId,
  reportId: ObjectId (ref: MedicalReport),
  familyMemberId: ObjectId (indexed),
  markerName: String (indexed),
  value: Number,
  unit: String,
  referenceRange: { min: Number, max: Number },
  isAbnormal: Boolean (indexed),
  createdAt: Date
}
```

### MedicalRecord Model (for RAG)
```javascript
{
  _id: ObjectId,
  familyMemberId: ObjectId (indexed),
  fileName: String,
  uploadDate: Date,
  processingStatus: String,
  chunks: [
    {
      text: String,
      embedding: [Number] (768 dimensions),
      chunkIndex: Number
    }
  ]
}
```

### ChatHistory Model
```javascript
{
  _id: ObjectId,
  familyMemberId: ObjectId (indexed),
  message: String,
  response: String,
  sources: [
    {
      recordId: ObjectId,
      fileName: String,
      relevanceScore: Number
    }
  ],
  confidence: String,
  timestamp: Date
}
```

---

## 🤖 AI/ML Components

### 1. Text Embeddings
- **Model**: `models/text-embedding-004`
- **Dimensions**: 768
- **Task**: `RETRIEVAL_DOCUMENT` for chunks, `RETRIEVAL_QUERY` for questions
- **Chunk Size**: ~500 characters
- **Overlap**: 50 characters

### 2. Chat Model
- **Model**: `gemini-1.5-flash-latest`
- **Temperature**: 0.3 (low for factual responses)
- **Max Tokens**: 1024
- **System Prompt**: Anti-hallucination instructions

### 3. Vector Search
- **Primary**: MongoDB Atlas Vector Search (if configured)
- **Fallback**: In-memory cosine similarity
- **Top-K**: 5 most relevant chunks
- **Scoring**: Cosine similarity (0-1 range)

### 4. Confidence Scoring
```javascript
if (answer includes "don't have information") → confidence = "none"
else if (answer cites sources) → confidence = "high"
else if (no source citations) → confidence = "low"
else → confidence = "medium"
```

---

## 🔒 Security

### Authentication
- **JWT Tokens**: HTTP-only, expires in 30 days
- **Password Hashing**: bcrypt with salt rounds = 10
- **Token Storage**: localStorage (client), not in cookies

### Authorization
- **Admin-only access**: All endpoints require valid JWT
- **Member isolation**: Can only access own family members' data
- **Route protection**: Middleware validates user ownership

### Data Privacy
- **Local Storage Default**: PDFs stored locally on server
- **Optional Cloud**: Cloudinary with signed URLs
- **Embeddings Privacy**: Vectors stored in private MongoDB
- **No Data Sharing**: All AI processing uses user's own Gemini API key

### File Upload Security
- **Type Validation**: Only PDF files accepted
- **Size Limits**: 10MB maximum file size
- **Sanitization**: Filenames sanitized to prevent path traversal
- **Temporary Storage**: Python service uses temp files, deleted after processing

### API Security
- **CORS**: Restricted to frontend origin only
- **Rate Limiting**: (Recommended for production)
- **Input Validation**: express-validator on all routes
- **Error Handling**: No sensitive info leaked in errors

---

## 🚀 Future Scope

### Short-Term Enhancements
- [ ] **Mobile App**: React Native version for iOS/Android
- [ ] **Export Reports**: Generate PDF summaries of health trends
- [ ] **Reminders**: Schedule health checkups based on last report dates
- [ ] **Multiple Languages**: i18n support for global families
- [ ] **Dark Mode**: UI theme toggle

### Medium-Term Features
- [ ] **Doctor Integration**: Share specific reports with healthcare providers
- [ ] **Medication Tracking**: Log prescriptions and set reminders
- [ ] **Symptom Logger**: Daily symptom diary with AI correlation
- [ ] **Health Goals**: Set and track wellness goals (weight, BP, etc.)
- [ ] **Family Insights**: Cross-member analysis for genetic patterns

### Long-Term Vision
- [ ] **Predictive Analytics**: ML models to predict health risks
- [ ] **Telemedicine Integration**: Video consultations with doctors
- [ ] **Wearable Sync**: Import data from Fitbit, Apple Health, etc.
- [ ] **Blockchain Records**: Immutable health history on blockchain
- [ ] **Multi-tenant SaaS**: White-label solution for clinics/hospitals

### Technical Improvements
- [ ] **Microservices**: Split backend into domain services
- [ ] **GraphQL**: Replace REST with GraphQL for flexible queries
- [ ] **Real-time Sync**: WebSocket updates for multi-device usage
- [ ] **Caching**: Redis for faster queries
- [ ] **Testing**: Unit tests (Jest), integration tests (Supertest), E2E (Cypress)
- [ ] **CI/CD**: Automated deployment pipeline
- [ ] **Monitoring**: Application performance monitoring (APM)
- [ ] **Kubernetes**: Container orchestration for scalability

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style (ESLint + Prettier)
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR

### Areas for Contribution
- 🐛 **Bug Fixes**: Check issues labeled `bug`
- ✨ **New Features**: Propose in discussions first
- 📚 **Documentation**: Improve guides, add examples
- 🧪 **Testing**: Add unit/integration tests
- 🎨 **UI/UX**: Design improvements, accessibility

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini**: For powerful AI capabilities
- **MongoDB**: For flexible document storage
- **React Community**: For amazing ecosystem
- **Open Source**: For all the incredible libraries used

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/family-health-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/family-health-dashboard/discussions)
- **Email**: support@familyhealthdashboard.com (placeholder)

---

## 📊 Project Status

| Component | Status | Coverage |
|-----------|--------|----------|
| Backend API | ✅ Complete | 100% |
| Python Service | ✅ Complete | 100% |
| Frontend UI | ✅ Complete | 100% |
| RAG Pipeline | ✅ Complete | 100% |
| Health Analytics | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |
| Testing | 🚧 In Progress | 30% |
| Deployment | 📋 Planned | 0% |

---

**Built with ❤️ for families who care about health**
