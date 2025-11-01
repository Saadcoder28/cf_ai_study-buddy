# cf_ai_study-buddy

An AI-powered adaptive learning assistant built on Cloudflare's edge platform. This application uses Llama 3.3 via Workers AI to provide personalized tutoring experiences with conversation memory and adaptive difficulty adjustment.

- **LLM** → Uses **Llama 3.3 (70B)** via **Workers AI** for personalized tutoring and adaptive explanations.  
- **Workflow / Coordination** → Uses **Workers** and **Durable Objects** for orchestration, adaptive logic, and progress tracking.  
- **User Input** → Real-time **chat interface** and **voice input** built with **React + Cloudflare Pages**.  
- **Memory / State** → Persistent **Durable Objects** store conversation history, progress, and understanding level per session.

---

## 🌐 Live Demo

- **Demo Link to try and test (Cloudflare Pages):** [https://cf-ai-study-buddy.pages.dev](https://cf-ai-study-buddy.pages.dev)  

---

## 💡 Inspiration

This project is inspired by my experience teaching over **500 students in rural Pakistan using VR headsets** to make STEM and coding more interactive.  
Through that experience, I learned how adaptive explanations can help students with different learning speeds.  
**cf_ai_study-buddy** brings that idea online — using Cloudflare’s edge AI infrastructure to deliver personalized learning globally.

---

## 🎯 Features

- **Intelligent Tutoring**: AI-powered explanations using Llama 3.3 on Workers AI  
- **Adaptive Learning**: Difficulty adjusts based on student performance  
- **Conversation Memory**: Maintains context across sessions using Durable Objects  
- **Real-time Chat**: Instant responses with streaming support  
- **Progress Tracking**: Monitors learning patterns and topic mastery  
- **Voice Input**: Optional speech-to-text for accessibility  

---

## 🏗️ Architecture

### Components

1. **LLM**: Llama 3.3 via Cloudflare Workers AI  
2. **Workflow**: Cloudflare Workers + Workflows for orchestration  
3. **User Interface**: React app deployed on Cloudflare Pages with real-time chat  
4. **State Management**: Durable Objects for persistent conversation history and user progress  

### Tech Stack

- **Backend**: Cloudflare Workers, Workers AI, Durable Objects, Workflows  
- **Frontend**: React 18, Vite, TailwindCSS  
- **API**: RESTful endpoints with streaming support  
- **Deployment**: Cloudflare Pages + Workers  

---

## 📋 Prerequisites

- Node.js 18+ and npm  
- Cloudflare account (free tier works)  
- Wrangler CLI installed globally  

```bash
npm install -g wrangler
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/Saadcoder28/cf_ai_study-buddy.git
cd cf_ai_study-buddy
npm install
```

### 2. Configure Cloudflare

Login to Wrangler:

```bash
wrangler login
```

Get your account ID:

```bash
wrangler whoami
```

### 3. Run Locally

Start the development server:

```bash
npm run dev
```

This starts:  
- Worker backend on `http://localhost:8787`  
- React frontend on `http://localhost:5173`

### 4. Test the Application

Open `http://localhost:5173` in your browser and try:  
- Ask a question: "Explain recursion in simple terms"  
- Follow up: "Can you give me an example?"  
- The AI remembers context and adapts explanations  

---

## 📁 Project Structure

```text
cf_ai_study-buddy/
├── worker/
│   ├── src/
│   │   ├── index.ts              # Main Worker entry point
│   │   ├── durable-objects/
│   │   │   └── StudySession.ts   # Conversation & progress storage
│   │   └── utils/
│   │       ├── ai.ts             # Workers AI integration
│   │       └── helpers.ts        # Utility functions
│   ├── wrangler.toml             # Worker configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main React component
│   │   ├── components/
│   │   │   ├── Chat.tsx          # Chat interface
│   │   │   ├── ProgressBar.tsx   # Learning progress
│   │   │   └── VoiceInput.tsx    # Voice recognition
│   │   └── api/
│   │       └── client.ts         # API client
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── README.md
├── PROMPTS.md
└── package.json
```

---

## 🔧 Configuration

### Wrangler Configuration

```toml
name = "cf-ai-study-buddy"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[ai]
binding = "AI"

[[durable_objects.bindings]]
name = "STUDY_SESSION"
class_name = "StudySession"

[[migrations]]
tag = "v1"
new_classes = ["StudySession"]
```

---

## 🧪 Testing

Run the application locally:

```bash
npm run dev
```

Test API endpoints:

```bash
# Start a new session
curl http://localhost:8787/api/session/start

# Send a message
curl -X POST http://localhost:8787/api/chat   -H "Content-Type: application/json"   -d '{"sessionId": "your-session-id", "message": "Explain binary search"}'
```

---

## 🚢 Deployment

### Deploy Backend (Workers)

```bash
cd worker
wrangler deploy
```

### Deploy Frontend (Pages)

```bash
cd frontend
npm run build
wrangler pages deploy dist --project-name=cf-ai-study-buddy
```

---

## 🎮 Usage Examples

### Basic Chat

User asks: "What is a linked list?"  
AI provides explanation adapted to user's level.  

User follows up: "Can you show me an example in Python?"  
AI provides code example with context from previous message.  

### Adaptive Difficulty

The system tracks:  
- Response understanding (detected through follow-up questions)  
- Topic mastery (consistent correct understanding)  
- Adjusts explanation complexity automatically  

### Progress Tracking

Access your learning dashboard to see:  
- Difficulty level  
- Understanding score  
- Message count  
- Motivational feedback  

---

## 🔑 Key Features Implementation

### 1. LLM Integration (Workers AI)

Uses Llama 3.3 70B model with custom system prompts for educational content.

### 2. Durable Objects (Memory)

Each study session persists:  
- Full conversation history  
- Student performance metrics  
- Understanding score  
- Difficulty level  

### 3. Adaptive Algorithm

Manages:  
- Multi-turn conversation flow  
- Difficulty adjustment triggers  
- Progress updates  

### 4. Real-time Chat

- Streaming responses for better UX  
- Instant feedback  
- Voice input support (optional)  

---

## 📊 API Endpoints

**POST /api/session/start** — Creates a new study session  

**POST /api/chat** — Send a message to the AI tutor  

```json
{
  "sessionId": "session-id",
  "message": "Your question here"
}
```

**GET /api/progress/:sessionId** — Get learning progress for a session  

**GET /api/health** — Health check endpoint  

---

## 🤝 Contributing

This project was created as part of a Cloudflare AI application assignment. Contributions welcome!

---

## 📝 License

MIT

---

## 👤 Author

**Saad Amin**  
- Email: Saadifsrh2005@gmail.com
- GitHub: [@Saadcoder28](https://github.com/Saadcoder28)

---

## 🙏 Acknowledgments

- Built on Cloudflare Workers AI (Llama 3.3)  
- Uses Cloudflare's edge computing platform  

---

## 🐛 Troubleshooting

### Wrangler Login Issues

```bash
wrangler logout
wrangler login
```

### Local Development Not Starting

```bash
# Clear Wrangler cache
rm -rf .wrangler
npm run dev
```

### Durable Objects Migration

If you modify the Durable Object class:

```bash
wrangler deploy --new-class StudySession
```

---

## 📚 Additional Resources

- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/)  
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)  
- [Workflows Documentation](https://developers.cloudflare.com/workflows/)  
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)  

---

**Built with ☁️ on Cloudflare Edge**
