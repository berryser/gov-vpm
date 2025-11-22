import db from "./db.js";

db.exec("DELETE FROM evaluations;");
db.exec("DELETE FROM vendors;");

const vendors = [
  ["MapleTech Solutions", "IT Services", "Cloud migration and app dev"],
  ["TrueNorth Construction", "Construction", "Infrastructure projects"],
  ["CanHealth Supplies", "Medical Supplies", "PPE and hospital equipment"],
];

const insertVendor = db.prepare(
  "INSERT INTO vendors (name, industry, description) VALUES (?, ?, ?)"
);

vendors.forEach(v => insertVendor.run(...v));

console.log("Seeded vendors.");
