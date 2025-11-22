import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/suggest-score", async (req, res) => {
  try {
    const { vendorName, contractSummary, incidentDescription } = req.body;

    const prompt = `
You are helping the Government of Canada evaluate a vendor.

Rate this vendor on a 1-5 integer scale for:
- quality
- cost_adherence
- schedule
- management

Then provide:
- overall_score (1-5 integer)
- a short rationale (2-3 sentences, plain text)

Return ONLY valid JSON in this format:
{
  "quality": 1-5,
  "cost_adherence": 1-5,
  "schedule": 1-5,
  "management": 1-5,
  "overall_score": 1-5,
  "rationale": "..."
}

Vendor: ${vendorName}
Contract summary: ${contractSummary}
Performance description: ${incidentDescription}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const jsonString = text.slice(jsonStart, jsonEnd + 1);

    const scores = JSON.parse(jsonString);
    res.json(scores);
  } catch (err) {
    console.error("AI error", err);
    res.status(500).json({ error: "AI scoring failed" });
  }
});

export default router;
