import express from 'express';
import cors from 'cors';
import { chatWithOpenAI } from './openai.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ✅ Define allowed frontend origins
const allowedOrigins = ['https://polite-ocean-0d1922b00.2.azurestaticapps.net'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // Change to true only if cookies are needed
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, messages } = req.body;

    const userPrompt = messages || [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt || 'No prompt provided.' }
    ];

    const response = await chatWithOpenAI(userPrompt);
    res.json(response);
  } catch (err) {
    console.error('🔴 OpenAI Proxy Error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
