import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH =
  process.env.JSON_PATH || path.join(__dirname, "..", "data", "data.json");

async function readJsonData() {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeJsonData(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function withRiskFlags(vendors, evaluations) {
  const vendorIdToEvals = new Map();
  for (const ev of evaluations) {
    if (!vendorIdToEvals.has(ev.vendor_id)) vendorIdToEvals.set(ev.vendor_id, []);
    vendorIdToEvals.get(ev.vendor_id).push(ev);
  }
  return vendors
    .map(v => {
      const evals = vendorIdToEvals.get(v.id) || [];
      const avg =
        evals.length === 0
          ? 0
          : evals.reduce((s, e) => s + Number(e.overall_score || 0), 0) /
            evals.length;
      let risk = "Neutral";
      if (avg && avg < 2.5) risk = "High Risk";
      if (avg && avg >= 4) risk = "Preferred";
      return { ...v, avg_score: Number(avg).toFixed(2), risk };
    })
    .sort((a, b) => Number(b.avg_score) - Number(a.avg_score));
}

// GET all vendors with avg score + risk flag
router.get("/", (req, res) => {
  readJsonData()
    .then(data => {
      const list = withRiskFlags(data.vendors || [], data.evaluations || []);
      res.json(list);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Failed to read data" });
    });
});

// GET single vendor + evaluations
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  readJsonData()
    .then(data => {
      const vendor = (data.vendors || []).find(v => v.id === id);
      if (!vendor) return res.status(404).json({ error: "Vendor not found" });
      const evaluations = (data.evaluations || [])
        .filter(ev => Number(ev.vendor_id) === id)
        .sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
        );
      res.json({ vendor, evaluations });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Failed to read data" });
    });
});

// POST new vendor
router.post("/", (req, res) => {
  const { name, industry, description } = req.body;
  readJsonData()
    .then(async data => {
      const vendors = data.vendors || [];
      const nextId = vendors.length ? Math.max(...vendors.map(v => v.id)) + 1 : 1;
      const vendor = {
        id: nextId,
        name,
        industry: industry || "",
        description: description || "",
      };
      vendors.push(vendor);
      await writeJsonData({ ...data, vendors });
      res.status(201).json({ id: nextId });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Failed to save vendor" });
    });
});

// POST new evaluation for vendor
router.post("/:id/evaluations", (req, res) => {
  const vendorId = Number(req.params.id);
  const {
    department,
    quality,
    cost_adherence,
    schedule,
    management,
    overall_score,
    rationale,
  } = req.body;
  readJsonData()
    .then(async data => {
      const evaluations = data.evaluations || [];
      const nextId = evaluations.length
        ? Math.max(...evaluations.map(e => e.id || 0)) + 1
        : 1;
      const created_at = new Date().toISOString().replace("T", " ").slice(0, 19);
      const ev = {
        id: nextId,
        vendor_id: vendorId,
        department,
        quality,
        cost_adherence,
        schedule,
        management,
        overall_score,
        rationale: rationale || "",
        created_at,
      };
      evaluations.push(ev);
      await writeJsonData({ ...data, evaluations });
      res.status(201).json({ id: nextId });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Failed to save evaluation" });
    });
});

export default router;
