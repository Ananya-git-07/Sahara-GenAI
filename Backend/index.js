// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authenticateToken');

// --- Initialize Gemini Client ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas.'))
  .catch(err => console.error('❌ Database connection error:', err));

app.use('/api/auth', authRoutes);

// --- Empathetic Prompt ---
const SAHARA_SYSTEM_PROMPT = `
You are "Sahara," an AI mental wellness companion...
(rest of the prompt remains the same)
`;

// --- Chat Route with Gemini + Murf ---
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;

  // --- Safety Check ---
  const selfHarmKeywords = ['suicide', 'kill myself', 'self-harm', 'end my life', 'want to die'];
  const isEmergency = selfHarmKeywords.some(keyword => message.toLowerCase().includes(keyword));
  if (isEmergency) {
    return res.json({
      reply: "It sounds like you might be in a really difficult place right now. You're not alone. Please call your local emergency number or a suicide prevention hotline immediately."
    });
  }

  try {
    // --- Step 1: Get text reply from Gemini ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const fullPrompt = `${SAHARA_SYSTEM_PROMPT}\n\nUser: ${message}\nSahara:`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const textReply = response.text();

    // --- Step 2: Convert Text Reply to Speech using Murf.ai ---
    console.log("Sending text to Murf.ai for speech synthesis...");

    const murfApiResponse = await axios.post(
      "https://api.murf.ai/v1/speech/generate",
      {
        text: textReply,
        voiceId: "en-IN-arohi", // ✅ change if needed (check your Murf account voices)
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "api-key": process.env.MURF_API_KEY,
        },
      }
    );

    const audioUrl = murfApiResponse.data.audioFile;

    // --- Step 3: Send Both Text and Audio URL to Frontend ---
    res.json({
      reply: textReply,
      audioUrl: audioUrl,
    });

  } catch (error) {
    console.error("--- API ERROR ---");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error Message:", error.message);
    }

    res.status(500).json({
      reply: "I'm having a little trouble thinking right now. Please try again."
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
