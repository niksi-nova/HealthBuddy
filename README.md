# Family Health Dashboard

A human-centric, AI-powered family health management platform with premium glassmorphism UI, organic family tree visualization, and RAG-based medical record analysis.

## 🌟 Features

- **Family Management**: Add and manage multiple family members with an intuitive family tree interface
- **Medical Records**: Upload and store PDF/image medical reports with automatic text extraction
- **AI Chatbot**: RAG-powered chatbot that answers questions based strictly on uploaded medical records
- **Health Insights**: Visualize health data with charts and trends
- **Secure Authentication**: JWT-based authentication with password hashing
- **Premium UI**: Glassmorphism design with organic, hand-drawn aesthetics

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB Atlas + Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **AI**: Google Gemini API + LangChain
- **Vector Search**: MongoDB Atlas Vector Search
- **File Processing**: Multer, pdf-parse, Tesseract.js (OCR)

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS (Glassmorphism)
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2

## 📁 Project Structure

```
family-health-dashboard/
├── backend/
│   ├── config/           # Database & AI configuration
│   ├── middleware/       # Auth, upload, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── services/         # AI, embedding, extraction services
│   ├── utils/            # Helper functions
│   ├── uploads/          # Uploaded files storage
│   ├── .env.example      # Environment variables template
│   ├── server.js         # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── store/        # Zustand state management
    │   ├── utils/        # API client & constants
    │   ├── App.jsx       # Main app component
    │   └── main.jsx      # Entry point
    ├── .env.example      # Frontend environment variables
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Google Gemini API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:3002`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_API_BASE_URL=http://localhost:3002/api
```

5. Initialize Tailwind CSS:
```bash
npx tailwindcss init -p
```

6. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5175`

## 📊 MongoDB Atlas Vector Search Setup

To enable vector search for the AI chatbot:

1. Log in to MongoDB Atlas
2. Navigate to your cluster → Browse Collections
3. Click on "Search" tab → "Create Search Index"
4. Select "JSON Editor" and use this configuration:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "chunks": {
        "type": "document",
        "fields": {
          "embedding": {
            "type": "knnVector",
            "dimensions": 768,
            "similarity": "cosine"
          }
        }
      }
    }
  }
}
```

5. Name the index: `vector_index`
6. Select the `medicalrecords` collection

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new admin
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Family Management
- `POST /api/family/members` - Add family member
- `GET /api/family/members` - Get all family members
- `GET /api/family/members/:id` - Get specific member
- `PUT /api/family/members/:id` - Update member
- `DELETE /api/family/members/:id` - Delete member

### Medical Records
- `POST /api/records/upload` - Upload medical report
- `GET /api/records/member/:memberId` - Get all records for member
- `GET /api/records/:recordId` - Get specific record
- `DELETE /api/records/:recordId` - Delete record

### AI Chat
- `POST /api/chat/message` - Send message to chatbot
- `GET /api/chat/history/:memberId` - Get chat history
- `DELETE /api/chat/history/:memberId` - Clear chat history

## 🎨 Design System

### Color Palette
- **Primary**: Sage Green (#8B9D83), Soft Terracotta (#D4A59A)
- **Secondary**: Sand (#F5F1E8), Deep Charcoal (#2D2D2D)
- **Accent**: Mustard Gold (#E8B44F)

### UI Style
- Glassmorphism cards with backdrop blur
- Border radius ≥ 20px for all elements
- Soft shadows and gentle gradients
- Organic, hand-drawn family tree lines
- Calm animations and transitions

## 🤖 AI Chatbot Features

### Anti-Hallucination Safeguards
1. **Strict Prompting**: AI only uses provided medical records
2. **Source Verification**: Cross-checks responses against retrieved documents
3. **Confidence Scoring**: Returns "insufficient data" if confidence is low
4. **Citation Requirement**: Every answer cites source documents

### RAG Pipeline
1. User asks question
2. Question is converted to embedding
3. Vector search finds relevant document chunks
4. Context is assembled from top-K chunks
5. Gemini generates answer using only the context
6. Response includes sources and confidence level

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User signup and login
- [ ] Add/edit/delete family members
- [ ] Upload PDF and image files
- [ ] AI chatbot responses with sufficient data
- [ ] AI chatbot refusal with insufficient data
- [ ] Responsive design on mobile/tablet/desktop

## 📦 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables in platform dashboard
2. Deploy from GitHub repository
3. Ensure MongoDB Atlas allows connections from deployment platform

### Frontend Deployment (Vercel/Netlify)
1. Set `VITE_API_BASE_URL` to production backend URL
2. Deploy from GitHub repository
3. Configure build command: `npm run build`
4. Configure output directory: `dist`

## 🔒 Security Considerations

- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- File uploads limited to 10MB
- Only PDF and image files accepted
- CORS configured for frontend domain
- Medical data is private to each user

## 📝 License

MIT License

## 👥 Contributing

This project was created as an academic/startup demonstration. Contributions are welcome!

## ⚠️ Disclaimer

This application is NOT a substitute for professional medical advice. It is designed to help organize and analyze personal medical records only. Always consult qualified healthcare professionals for medical decisions.

## 🆘 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using React, Node.js, MongoDB, and Google Gemini AI
