# Medical RAG Chatbot - Setup Guide

## 🚀 Quick Setup

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Add to Environment Variables

Add to `backend/.env`:
```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart Backend

The backend will automatically:
- Initialize Chroma vector store
- Connect to Gemini API
- Enable chat functionality

```bash
# Backend will auto-reload with nodemon
# Or manually restart:
cd backend
npm run dev
```

---

## ✅ What's Implemented

### Backend Services

1. **Gemini Service** (`services/geminiService.js`)
   - Safe prompt engineering
   - Response validation
   - Medical disclaimer injection
   - Embedding generation

2. **Chroma Service** (`services/chromaService.js`)
   - Local vector storage
   - User-isolated collections
   - Report summarization
   - Similarity search

3. **Chat API** (`routes/chat.js`)
   - POST `/api/chat/:memberId` - Send message
   - GET `/api/chat/example-questions` - Get examples
   - Member access control
   - Context retrieval (lab results + vector search)

### Frontend Components

1. **MedicalChatbot** (`components/medical/MedicalChatbot.jsx`)
   - Chat interface
   - Medical disclaimer banner
   - Example questions
   - Typing indicators
   - Source citations

2. **Integration**
   - Added to Member Health Dashboard
   - Tab navigation (Reports / Health Assistant)
   - Mobile responsive

---

## 🔒 Safety Features

### Strict Guardrails

✅ **Implemented:**
- NO diagnosis allowed
- NO medication prescription
- NO treatment plans
- Educational explanations only
- Lifestyle suggestions only
- Doctor visit recommendations
- "I don't know" responses
- Disclaimer on every response

### Response Validation

The system validates responses to filter:
- Diagnostic language ("you have diabetes")
- Prescription language ("take this medication")
- Definitive medical claims

---

## 💬 Example Usage

### Safe Questions

✅ "What does my hemoglobin level mean?"
✅ "Are any of my test results abnormal?"
✅ "How can I improve my blood sugar levels?"
✅ "What foods should I eat for better iron levels?"

### Blocked Questions

❌ "Do I have diabetes?" → Redirects to doctor
❌ "What medication should I take?" → Refuses to prescribe
❌ "Can you diagnose my condition?" → Explains limitations

---

## 🧪 Testing Checklist

### Safety Tests

- [ ] Ask for diagnosis → Should refuse
- [ ] Ask for medication → Should refuse
- [ ] Ask to explain marker → Should explain
- [ ] Ask with no data → Should say "I don't know"
- [ ] Check disclaimer appears on all responses

### Functionality Tests

- [ ] Upload report → Vector summary stored
- [ ] Ask question → Retrieves relevant context
- [ ] Multiple questions → Maintains context
- [ ] Clear chat → Resets conversation

---

## 📊 How It Works

### 1. Report Upload
```
PDF Upload → Extraction → Lab Results → Vector Summary → Chroma
```

### 2. Chat Query
```
User Question → Gemini Embedding → Vector Search → Lab Results → Context → Gemini Response → Validation → Disclaimer → User
```

### 3. Context Building

For each question, the system retrieves:
- **Lab Results**: Last 6 months of test data
- **Vector Summaries**: Top 3 relevant report summaries
- **Member Info**: Age, gender, existing conditions

---

## 🔧 Troubleshooting

### "AI service is not configured"

**Cause**: Missing GEMINI_API_KEY

**Fix**:
1. Add key to `backend/.env`
2. Restart backend

### No responses from chatbot

**Cause**: Chroma initialization error

**Fix**:
1. Check backend logs
2. Ensure `chroma_data` directory is writable
3. Restart backend

### Responses seem generic

**Cause**: No vector data stored

**Fix**:
1. Upload at least one medical report
2. Wait for vector storage to complete
3. Try asking again

---

## 📁 File Structure

```
backend/
├── services/
│   ├── geminiService.js     # Gemini API wrapper
│   └── chromaService.js     # Vector store
├── routes/
│   └── chat.js              # Chat API endpoints
└── chroma_data/             # Local vector storage (auto-created)

frontend/
└── src/
    └── components/
        └── medical/
            └── MedicalChatbot.jsx  # Chat UI
```

---

## 🎯 Next Steps

1. **Add API Key** to `.env`
2. **Upload a report** to test vector storage
3. **Ask questions** to test chatbot
4. **Verify safety** - try asking for diagnosis
5. **Check disclaimer** appears on all responses

---

## 🚨 Important Notes

> [!CAUTION]
> **Medical Liability**
> - This chatbot is for educational purposes only
> - Always include the medical disclaimer
> - Never modify safety guardrails
> - Log all queries for audit

> [!IMPORTANT]
> **API Key Security**
> - Never commit `.env` to git
> - Keep API key confidential
> - Monitor usage on Google AI Studio
> - Free tier: 15 req/min, 1M tokens/min

---

## 📞 Support

If you encounter issues:
1. Check backend logs for errors
2. Verify API key is valid
3. Ensure Chroma directory is writable
4. Test with example questions first

