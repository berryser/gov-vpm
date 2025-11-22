import express from "express";
import db from "../db.js";

const router = express.Router();

// GET all vendors with avg score + risk flag
router.get("/", (req, res) => {
  const vendors = db
    .prepare(`
      SELECT v.*,
        COALESCE(AVG(e.overall_score), 0) as avg_score
      FROM vendors v
      LEFT JOIN evaluations e ON v.id = e.vendor_id
      GROUP BY v.id
      ORDER BY avg_score DESC;
    `)
    .all();

  const withFlags = vendors.map(v => {
    let risk = "Neutral";
    const avg = Number(v.avg_score || 0);
    if (avg && avg < 2.5) risk = "High Risk";
    if (avg && avg >= 4) risk = "Preferred";
    return { ...v, avg_score: avg.toFixed(2), risk };
  });

  res.json(withFlags);
});

// GET single vendor + evaluations
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const vendor = db.prepare("SELECT * FROM vendors WHERE id = ?").get(id);
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });

  const evaluations = db
    .prepare(
      "SELECT * FROM evaluations WHERE vendor_id = ? ORDER BY created_at DESC"
    )
    .all(id);

  res.json({ vendor, evaluations });
});

// POST new vendor
router.post("/", (req, res) => {
  const { name, industry, description } = req.body;
  const stmt = db.prepare(
    "INSERT INTO vendors (name, industry, description) VALUES (?, ?, ?)"
  );
  const info = stmt.run(name, industry || "", description || "");
  res.status(201).json({ id: info.lastInsertRowid });
});

// POST new evaluation for vendor
router.post("/:id/evaluations", (req, res) => {
  const vendorId = req.params.id;
  const {
    department,
    quality,
    cost_adherence,
    schedule,
    management,
    overall_score,
    rationale,
  } = req.body;

  const stmt = db.prepare(`
    INSERT INTO evaluations
    (vendor_id, department, quality, cost_adherence, schedule, management, overall_score, rationale)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    vendorId,
    department,
    quality,
    cost_adherence,
    schedule,
    management,
    overall_score,
    rationale || ""
  );

  res.status(201).json({ id: info.lastInsertRowid });
});

export default router;
