import db from "./db.js";

// Wipe existing data for a clean slate
db.exec("DELETE FROM evaluations;");
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('vendors','evaluations');");
db.exec("DELETE FROM vendors;");

// Helper utilities
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  // SQLite-friendly format
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// Demo vendors
const vendorRows = [
  ["MapleTech Solutions", "IT Services", "Cloud migration and application development for public sector."],
  ["TrueNorth Construction", "Construction", "Bridges, roads, and public infrastructure projects."],
  ["CanHealth Supplies", "Medical Supplies", "PPE and hospital equipment distribution."],
  ["Aurora Analytics", "Data & AI", "Advanced analytics and ML platforms for agencies."],
  ["Boreal Networks", "Telecom", "Wide-area network and connectivity for remote sites."],
  ["Polar Consulting", "Management Consulting", "Change management and strategic advisory."],
  ["PrairieSoft", "Software", "Custom enterprise systems and integration."],
  ["Harbour Security", "Security", "Facility and cyber security services."],
  ["Northern Lights Media", "Communications", "Public outreach and media production."],
  ["St. Laurent Logistics", "Logistics", "Supply chain and warehousing solutions."],
  ["Cascadia CleanTech", "Green Tech", "Energy efficiency retrofits and solar installations."],
  ["Frontier Drones", "Aerospace", "Aerial surveying and emergency response support."],
  ["BlueSpruce Labs", "IT Services", "DevOps, observability, and SRE enablement."],
  ["Granite Civil Works", "Construction", "Water treatment and municipal works."],
  ["Capitol Printworks", "Print & Office", "Secure printing and records digitization."],
  ["Snowy Owl Cyber", "Cybersecurity", "Pen-testing and incident response retainers."],
  ["Lakeside Staffing", "Staffing", "Temporary staffing and talent acquisition."],
  ["Summit Learning", "Training", "Leadership development and training programs."],
  ["True North Foods", "Catering", "Event catering and on-site canteen services."],
  ["Great Bear IT", "IT Services", "Legacy modernization and API gateways."],
  ["Muskoka Marine", "Transportation", "Marine transport and ferry maintenance."],
  ["Arctic DataVault", "Cloud", "Secure data archival and backup services."],
  ["Timberline Hardware", "Hardware", "End-user devices and peripherals procurement."],
  ["Cedar Ridge Labs", "R&D", "Prototyping and rapid experimentation services."],
];

const departments = [
  "PSPC",
  "CRA",
  "IRCC",
  "DND",
  "ESDC",
  "HC",
  "ISED",
  "Transport Canada",
  "Environment Canada",
];

const rationales = [
  "Met deliverables with minor schedule slips due to dependency issues.",
  "Exceeded expectations in quality and stakeholder communication.",
  "Cost variance observed; vendor provided credible mitigation plan.",
  "On-time and on-budget with stable performance across teams.",
  "Security incident reported and remediated; monitoring improved.",
  "Change requests impacted schedule; collaboration remained strong.",
  "Slight quality regressions; vendor agreed to corrective actions.",
  "Demonstrated strong risk management and transparent reporting.",
  "Delays due to supply constraints; recovery plan implemented.",
  "Outstanding leadership and proactive coordination across departments.",
];

// Insert vendors
const insertVendor = db.prepare(
  "INSERT INTO vendors (name, industry, description) VALUES (?, ?, ?)"
);
const vendorIds = vendorRows.map((v) => insertVendor.run(...v).lastInsertRowid);

// Prepare evaluation insertion (include created_at for historical spread)
const insertEval = db.prepare(`
  INSERT INTO evaluations
  (vendor_id, department, quality, cost_adherence, schedule, management, overall_score, rationale, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Cluster vendors into performance bands to produce nice variation:
// top (Preferred), middle (Neutral), bottom (High Risk)
vendorIds.forEach((vendorId, idx) => {
  const band = idx % 6 === 0 ? "low" : idx % 5 === 0 ? "high" : "mid";
  const numEvals = randomInt(6, 14);

  for (let i = 0; i < numEvals; i++) {
    const base =
      band === "high" ? 4.3 : band === "low" ? 2.1 : 3.2; // target mean
    const jitter = () => clamp(Math.round((base + (Math.random() - 0.5)) * 1) , 1, 5);
    // Generate each dimension roughly around the band base
    const quality = clamp(Math.round(base + (Math.random() - 0.5) * 1), 1, 5);
    const cost = clamp(Math.round(base + (Math.random() - 0.5) * 1), 1, 5);
    const schedule = clamp(Math.round(base + (Math.random() - 0.6) * 1.2), 1, 5);
    const management = clamp(Math.round(base + (Math.random() - 0.5) * 1), 1, 5);
    const overall =
      Math.round(((quality + cost + schedule + management) / 4) * 10) / 10;

    const dept = randomFrom(departments);
    const rationale = randomFrom(rationales);
    const created_at = daysAgoISO(randomInt(0, 180));

    insertEval.run(
      vendorId,
      dept,
      quality,
      cost,
      schedule,
      management,
      overall,
      rationale,
      created_at
    );
  }
});

console.log(
  `Seeded ${vendorIds.length} vendors with randomized evaluations over the last 6 months.`
);
