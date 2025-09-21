# Sahara - AI Mental Wellness Companion

**Sahara is a voice-enabled, empathetic AI companion designed to provide a safe, anonymous, and non-judgmental space for the youth of India to talk about their mental wellness.**

This full-stack application was built as a prototype to address the significant stigma surrounding mental health. It serves as an accessible "first step" for individuals facing academic and social pressures, offering a listening ear powered by advanced AI and a natural, human-like voice.

**[▶️ Watch the 3-Minute Video Demo](https://drive.google.com/file/d/1KlVsJNd30NMHzXGSTVTjyDIGDAqF-Ze5/view?t=10)** 
**[🚀 Live Application Link](https://sahara-genai.onrender.com/)** 

---

## ✨ Core Features

*   **🧠 Empathetic AI Conversation:** Powered by Google's **Gemini-2.5-Pro**, Sahara is guided by a highly detailed persona prompt, ensuring every response is patient, validating, and encourages users to explore their feelings without giving direct advice.
*   **🗣️ Natural Voice Interaction:**
    *   **Speech-to-Text:** Users can speak their thoughts naturally using the browser's Web Speech API. The system supports continuous listening, allowing for pauses.
    *   **Premium Text-to-Speech:** Sahara responds with a warm, studio-quality female Indian English voice from **Murf.ai**, creating a deeply personal and comforting experience.
*   **🔐 Anonymous & Secure:** User authentication is handled via JWT (Access & Refresh Tokens), requiring only a username and password. No personal information is stored, ensuring complete anonymity.
*   **🚨 Built-in Safety Protocols:** The AI is instructed with a non-negotiable protocol to detect mentions of self-harm and immediately provide the KIRAN Mental Health Helpline number, prioritizing user safety.
*   **🎨 Polished & Responsive UI:** The interface is built with React and Tailwind CSS, featuring a clean, modern design with loading indicators and animations to create a smooth user experience.

---

## 💡 The Problem Sahara Solves

General-purpose AI like ChatGPT are powerful but lack the specific tuning, consistent persona, and focused, safe environment needed for sensitive mental wellness conversations. Sahara is different:

*   **Purpose-Built:** It's not a multi-purpose tool; it's a dedicated companion.
*   **Always in Character:** Empathy is its permanent state, requiring no special prompting from the user.
*   **Voice-First:** The high-quality voice is a core feature, not an afterthought, making the interaction feel more human.
*   **Safe & Focused:** The simple UI and specialized safety protocols create a trusted space free from distractions.

---

## 🛠️ Technology Stack & Architecture

Sahara is built on a modern, full-stack architecture deployed as two separate services on Render.

*   **Client (Static Site):**
    *   **Framework:** React.js
    *   **Build Tool:** Vite
    *   **Styling:** Tailwind CSS
    *   **Routing:** `react-router-dom`
    *   **HTTP Client:** `axios`

*   **Server (Web Service):**
    *   **Runtime:** Node.js with Express.js
    *   **Database:** MongoDB Atlas with Mongoose
    *   **Authentication:** `jsonwebtoken` & `bcryptjs`

*   **AI & Third-Party Services:**
    *   **Core AI Logic:** Google Gemini API (`gemini-1.0-pro`)
    *   **Text-to-Speech:** Murf.ai API
    *   **Deployment:** Render

---

## 🚀 Getting Started Locally

To run this project on your local machine, follow these steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm
*   MongoDB Atlas Account
*   Google Gemini API Key
*   Murf.ai API Key (Enterprise Plan for API access)

### 1. Clone the Repository

```bash
git clone https://github.com/Ananya-git-07/Sahara-GenAI/
cd sahara-voice-project
```

### 2. Backend Setup (`/server`)

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file and add your secret keys
touch .env
```

Your `server/.env` file should look like this:
```env
MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET=YOUR_REFRESH_TOKEN_SECRET
PORT=5001
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
MURF_API_KEY=YOUR_MURF_API_KEY
CLIENT_ORIGIN_URL=http://localhost:5173
```

**CRITICAL:** In `server/index.js`, remember to replace the placeholder for the Murf.ai `voice` ID with a real ID from your Murf account.

```bash
# Start the backend server
npm start
```

### 3. Frontend Setup (`/client`)

```bash
# Navigate to the client directory from the root
cd client

# Install dependencies
npm install

# Create a .env.development file for local development
touch .env.development
```

Your `client/.env.development` file should contain the backend URL:
```env
VITE_API_BASE_URL=http://localhost:5001
```

```bash
# Start the frontend development server
npm run dev
```

The application should now be running locally at `http://localhost:5173`.

---

## 🤝 Acknowledgements

This project was developed as a hackathon prototype with the goal of exploring how AI can be thoughtfully applied to create accessible mental wellness tools.
