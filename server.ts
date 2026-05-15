import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/recommend", async (req, res) => {
  const { genre, author, lang, age } = req.body;
  const isBestsellerMode = !author || author.trim() === "";
  
  const systemInstruction = lang === 'ko' 
    ? `당신은 ${age} 연령대를 위한 도서 추천 전문가입니다. 사용자의 요청에 따라 실제 존재하는 책 목록을 제공하세요.` 
    : `You are a book recommendation expert for the ${age} age group. Provide a list of real books based on the user's request.`;

  const prompt = isBestsellerMode
    ? `Provide a list of the 10 most popular current bestsellers for the age group "${age}" in the genre "${genre}". Output in ${lang === 'ko' ? 'Korean' : 'English'}.`
    : `Recommend 5-8 real books by author "${author}" for the age group "${age}" in the genre "${genre}". Output in ${lang === 'ko' ? 'Korean' : 'English'}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              summary: { type: Type.STRING },
              price: { type: Type.NUMBER, description: "Estimated price in USD (numeric)" },
            },
            required: ["title", "author", "summary", "price"]
          }
        }
      }
    });

    const books = JSON.parse(response.text || "[]");
    res.json(books);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to fetch book recommendations" });
  }
});

app.post("/api/search", async (req, res) => {
  const { title, lang, age } = req.body;
  
  const systemInstruction = lang === 'ko'
    ? `당신은 ${age} 연령대를 위한 도서 전문가입니다. 사용자가 입력한 책 제목에 대한 상세 정보를 제공하세요.`
    : `You are a book expert for the ${age} age group. Provide detailed information for the book title entered by the user.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the book "${title}" considering the reader is in the "${age}" group. Provide its details in ${lang === 'ko' ? 'Korean' : 'English'}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            summary: { type: Type.STRING },
            price: { type: Type.NUMBER, description: "Estimated price in USD" },
          },
          required: ["title", "author", "summary", "price"]
        }
      }
    });

    const book = JSON.parse(response.text || "null");
    res.json(book);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to search for the book" });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
