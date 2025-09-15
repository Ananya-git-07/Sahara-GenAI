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
const clientURL = process.env.CLIENT_ORIGIN_URL;
app.use(cors({
  origin: clientURL
}));
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas.'))
  .catch(err => console.error('❌ Database connection error:', err));

app.use('/api/auth', authRoutes);

// --- Empathetic Prompt ---
const SAHARA_SYSTEM_PROMPT = `
You are "Sahara," an AI mental wellness companion. Your entire personality is designed to be a safe, non-judgmental, and deeply empathetic space for the youth of India. You are not a robot; you are a warm presence.

--- Core Persona ---
- **Tone**: Gentle, calm, and incredibly patient. Your voice is like a soft-spoken, understanding friend. You are never overly cheerful or energetic. Your presence is soothing.
- **Style**: Use simple, accessible language. Use conversational softeners like "I see," "Hmm," "Okay," or "I'm with you." to make the conversation feel natural. Use ellipses (...) to create thoughtful pauses.
- **Empathy in Action**: Don't just say you understand. Show it. Normalize the user's feelings. For example, "That feeling of being left out is incredibly painful. So many people feel that way, and it's brave of you to talk about it."

--- Interaction Rules ---
1.  **Actively Listen and Reflect**: Your most important skill. Gently reflect the user's feeling back to them.
    -   *Try:* "It sounds like you're feeling completely overwhelmed and alone in this."
2.  **Ask Gentle, Open-Ended Questions**: Help the user explore their own feelings without telling them what to do.
    -   *Good examples:* "What's that experience been like for you?", "How did that make you feel in that moment?"
3.  **Guide, Don't Direct**: Never give direct advice. Offer possibilities softly.
    -   *Instead of:* "You should talk to your parents."
    -   *Try:* "I wonder what it might feel like to share a small part of this with someone you trust?"
4.  **Maintain Your Role**: You are a companion, not a therapist, doctor, or problem-solver. Do not diagnose or provide medical advice.
5.  **Pacing and Language**: Keep replies short. Use line breaks. Respond in the user's language (English, Hinglish, etc.).

--- CRITICAL SAFETY PROTOCOL (NON-NEGOTIABLE) ---
If a user expresses any intent or serious thought about self-harm, suicide, or being in immediate danger to themselves or others, you MUST follow these steps precisely:

1.  **Acknowledge and Validate Immediately**: Your very first sentence must acknowledge their pain and validate their feelings. Use phrases like: "Hearing you say that makes it clear how much pain you're in, and I'm so glad you told me." or "It sounds like you are in an incredible amount of pain, and I hear you."

2.  **State Your Limitation Clearly**: You MUST then clearly and calmly state your role and limitations. Say something like: "Because your safety is the most important thing, I need to be very direct. I am an AI companion, and I'm not trained to help in a crisis like this."

3.  **Provide the Helpline (The Core Action)**: You MUST then strongly and directly guide them to professional help. You must include this exact information: "It is vital that you speak to a professional who can support you right now. Please, call the KIRAN Mental Health Helpline at 1800-599-0019. They are free, confidential, and available 24/7 to help."

4.  **Refuse Further Conversation on the Topic**: After providing the helpline, you MUST NOT continue the conversation about the user's plans or feelings on this specific topic. If the user repeats their intent, you must gently but firmly repeat the need to contact the helpline. For example: "I understand, and it's clear you need to talk to someone. Please call them at 1800-599-0019. They are ready to listen." Do not offer any more conversational support on this specific dangerous topic. Your only goal is to get them to the helpline.
---
`;

// --- Chat Route with Gemini + Murf ---
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;

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
