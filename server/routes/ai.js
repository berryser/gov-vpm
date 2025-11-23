import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

router.post("/recommend-vendor", async (req, res) => {
    try {
      const { vendorA, vendorB } = req.body;
  
      const prompt = `
  You are advising the Government of Canada on vendor selection.
  
  Here is Vendor A:
  ${JSON.stringify(vendorA, null, 2)}
  
  Here is Vendor B:
  ${JSON.stringify(vendorB, null, 2)}
  
  Using ONLY the data given (scores, departments, rationale), decide:
  1. Which vendor is a safer choice for a new critical contract.
  2. Why, in 3–5 bullet points.
  3. A one-sentence recommendation starting with "Recommendation:".
  
  Keep it short and in plain English.
  `;
  
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      res.json({ recommendation: text });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI recommendation failed" });
    }
  });

// Executive brief for a single vendor + their evaluations
router.post("/executive-brief", async (req, res) => {
  try {
    const { vendor, evaluations } = req.body;
    const prompt = `Summarize for executives:
Vendor: ${vendor?.name}
Industry: ${vendor?.industry}
Description: ${vendor?.description}
Recent evaluations:
${JSON.stringify(evaluations ?? [], null, 2)}

Return sections:
- Key strengths (3-5 bullets)
- Key risks (3-5 bullets)
- Recommendation (1 sentence starting with "Recommendation:")`;
    const result = await model.generateContent(prompt);
    res.json({ brief: result.response.text() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI brief failed" });
  }
});

// What-if analysis given weights for criteria
router.post("/what-if", async (req, res) => {
  try {
    const { vendor, evaluations, weights } = req.body;
    const prompt = `You are assessing a vendor under weighted criteria.
Vendor:
${JSON.stringify(vendor ?? {}, null, 2)}
Recent evaluations:
${JSON.stringify(evaluations ?? [], null, 2)}
Weights (higher = more important):
${JSON.stringify(weights ?? {}, null, 2)}

Explain in 3–5 short bullets how the recommendation changes under these weights.
End with a one-sentence "Recommendation: ..."`;
    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI what-if failed" });
  }
});

// Explain recent risk/anomaly based on evaluations
router.post("/risk-explain", async (req, res) => {
  try {
    const { evaluations } = req.body;
    const prompt = `Analyze these evaluations and explain any anomalies or trend shifts in 3–5 bullets:
${JSON.stringify(evaluations ?? [], null, 2)}`;
    const result = await model.generateContent(prompt);
    res.json({ explanation: result.response.text() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI risk explain failed" });
  }
});

// Policy/compliance quick check on rationale text
router.post("/policy-check", async (req, res) => {
  try {
    const { rationale } = req.body;
    const prompt = `Classify the following text as "Compliant" or "Needs Review" and add one sentence why.
Return format:
Decision: <Compliant|Needs Review>
Reason: <1 sentence>

Text:
${rationale ?? ""}`;
    const result = await model.generateContent(prompt);
    res.json({ decision: result.response.text() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI policy check failed" });
  }
});

export default router;
