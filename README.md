# Gemma - AI Budget Manager

A modern, full-stack budget management application with AI-powered expense categorization and financial advice. Built with **React + Vite** frontend and **FastAPI** backend, featuring a beautiful **neumorphism UI** and dark mode support.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 🎯 Features

- 💰 **Budget Management** - Add, view, and delete expenses and income
- 🤖 **AI-Powered Expense Input** - Describe expenses in natural language, AI categorizes them automatically
- 📊 **Financial Analysis** - Get AI-generated financial summaries and personalized advice
- 🎨 **Neumorphism Design** - Modern, soft UI design with smooth interactions
- 🌙 **Dark/Light Mode** - Seamless theme switching with persistence
- ⚡ **Real-time Updates** - Instant UI refresh after transactions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks
- **Vite** - Fast build tool
- **Neumorphism CSS** - Modern design system
- **Axios** - HTTP client

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLite** - Lightweight database
- **Ollama** - Local LLM runtime
- **CORS Middleware** - Cross-origin request handling

### AI/LLM
- **Ollama** - Open-source LLM runner (runs locally)
- **Gemma 4:31B** - For financial analysis and advice
- **Qwen 2.5:7B** - For expense categorization

---

## 📋 Prerequisites

### System Requirements
- **OS**: macOS, Linux, or Windows
- **RAM**: 8GB minimum (16GB recommended for LLM)
- **Storage**: 20GB free space (for LLM models)

### Required Tools
- **Node.js** v16+ - [Download](https://nodejs.org/)
- **Python** 3.8+ - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)
- **Ollama** - [Download](https://ollama.ai/) (for local LLM)

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mohitnegi724/gemma-budget-manager.git
cd gemma-budget-manager
```

### 2️⃣ Set Up Ollama & LLM Models

#### Install Ollama
Download from [https://ollama.ai](https://ollama.ai) and follow platform-specific installation.

#### Start Ollama Server
```bash
# Start Ollama (runs on http://localhost:11434 by default)
ollama serve
```

#### Pull Required Models
In a **new terminal**, pull the LLM models:

```bash
# Pull Qwen model for expense categorization (7B parameters, ~4.5GB)
ollama pull qwen2.5:7b

# Pull Gemma model for financial analysis (31B parameters, ~18GB)
ollama pull gemma4:31b
```

**⚠️ Note**: The first time pulling models may take 5-15 minutes depending on your internet speed.

#### Verify Ollama is Running
```bash
curl http://localhost:11434/api/tags
```
You should see a JSON response with available models.

---

### 3️⃣ Set Up Backend (FastAPI)

```bash
# Navigate to backend directory
cd ai-memory

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn requests pydantic

# Start the backend server (runs on http://localhost:8000)
python -m uvicorn app:app --reload
```

**Backend is running** when you see:
```
INFO:     Application startup complete
```

---

### 4️⃣ Set Up Frontend (React + Vite)

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

**Frontend is running** when you see:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🎮 How to Use

### Access the App
Open your browser and navigate to **http://localhost:5173**

### Adding Expenses - Manual
1. Enter expense details in the form:
   - **Title**: Description of the expense
   - **Amount**: Cost in rupees
   - **Category**: Choose from predefined categories
2. Click **Add** button
3. Expense appears in the list immediately

### Adding Expenses - AI Mode
1. Type a natural language description in the **AI input field**
   - Example: "Spent 450 on Swiggy for dinner"
   - Example: "Got 12000 salary this month"
2. Click **Add via AI**
3. AI automatically:
   - Categorizes the expense
   - Extracts the amount
   - Determines expense/income type
   - Adds to your budget list

### Get Financial Advice
1. Click **Ask Gemma** button
2. Loading skeleton appears while AI analyzes your budget
3. Get personalized financial advice based on your spending patterns

### Manage Theme
- Click the **☀️/🌙** button (top-right corner) to toggle between light and dark modes
- Your preference is saved automatically

---

## 🏗️ Project Structure

```
gemma-budget-manager/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── main.jsx            # App entry point
│   │   ├── neumorphism.css     # Unified styling (neumorphism design)
│   │   └── assets/             # Images and icons
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   └── index.html              # HTML entry point
│
├── ai-memory/                   # FastAPI backend
│   ├── app.py                  # Main FastAPI application
│   ├── database.db             # SQLite database (auto-created)
│   └── requirements.txt        # Backend dependencies (optional)
│
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## 🔧 Environment Variables

### Backend (ai-memory/app.py)
- **CORS_ORIGIN**: `http://localhost:5173` (frontend URL)
- **OLLAMA_URL**: `http://localhost:11434` (Ollama server)
- **DATABASE**: `database.db` (SQLite file location)

### Frontend (.env)
- **VITE_API_URL**: `http://127.0.0.1:8000` (backend API URL)

---

## 📡 API Endpoints

### Budget Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets` | Get all budgets/expenses |
| POST | `/budgets` | Create new budget entry |
| PUT | `/budgets/{id}` | Update budget entry |
| DELETE | `/budgets/{id}` | Delete budget entry |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai-expense` | Parse natural language expense input |
| GET | `/ai-summary` | Get financial analysis and advice |

---

## 🧠 AI Models Used

### Qwen 2.5:7B
- **Purpose**: Expense categorization and JSON parsing
- **Size**: ~4.5GB
- **Latency**: 5-10 seconds per request
- **Accuracy**: Excellent for Indian rupee amounts and Hindi text

### Gemma 4:31B
- **Purpose**: Financial analysis and advice generation
- **Size**: ~18GB
- **Latency**: 10-20 seconds per request
- **Strengths**: Detailed financial recommendations, budget analysis

---

## ⚡ Performance Optimization

### LLM Performance
- Models run locally on your machine (no external API calls)
- First request takes longer (model loading)
- Subsequent requests are faster
- Increase Ollama's context window for better responses:

```bash
ollama run gemma4:31b --parameter num_predict 512
```

### Frontend Performance
- Built with Vite for fast hot module replacement
- Neumorphism CSS uses GPU acceleration
- Loading skeletons improve perceived performance
- Theme switching with CSS variables (no full reload)

---

## 🐛 Troubleshooting

### "Cannot connect to Ollama"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start Ollama service
ollama serve
```

### "Model not found"
```bash
# List available models
ollama list

# Pull missing model
ollama pull qwen2.5:7b
ollama pull gemma4:31b
```

### Frontend shows "Cannot reach API"
```bash
# Check if backend is running
curl http://localhost:8000/docs

# Restart backend if needed
cd ai-memory
python -m uvicorn app:app --reload
```

### High Memory Usage
- Models are loaded in RAM when used
- Close other applications to free memory
- Reduce model size: use `qwen2.5:3b` instead of `7b` (smaller but less accurate)

### Slow Responses
- First request loads model into memory (expected)
- Subsequent requests are faster
- Ensure you have at least 8GB free RAM
- Check internet connection if pulling models initially

---

## 📊 Database Schema

### Budgets Table
```sql
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    type TEXT DEFAULT 'expense',           -- 'expense' or 'income'
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 Neumorphism Design System

The UI uses a modern **neumorphism** design with:
- **Soft shadows** for depth without harsh borders
- **Subtle color gradients** for smooth transitions
- **Inset shadows** for pressed/active states
- **Smooth animations** on interactions
- **Responsive layout** adapting to all screen sizes

### Color Palette
- **Light Mode**: Soft grays with accent blue (#2563eb)
- **Dark Mode**: Deep blues with lighter blue accent (#60a5fa)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 👨‍💻 Author

**Mohit Negi**
- GitHub: [@mohitnegi724](https://github.com/mohitnegi724)
- LinkedIn: [Mohit Negi](https://www.linkedin.com/in/mohitnegi724/)
- Email: mohitnegi724@gmail.com

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) - Local LLM runtime
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Next generation build tool
- [Neumorphism.io](https://neumorphism.io/) - Neumorphism design inspiration

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an [Issue](https://github.com/mohitnegi724/gemma-budget-manager/issues)
3. Contact: mohitnegi724@gmail.com

---

## 🔗 Quick Links

- 🌐 [Live Demo](#) (if deployed)
- 📚 [FastAPI Docs](http://localhost:8000/docs) (when running)
- 🎨 [Neumorphism Guide](https://neumorphism.io/)
- 🦙 [Ollama Documentation](https://github.com/ollama/ollama)

---

**Happy budgeting! 💰**