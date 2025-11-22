import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE =
  (import.meta?.env?.VITE_API_URL || "http://localhost:4000") + "/api";

export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);
  const [riskFilter, setRiskFilter] = useState("all");

  useEffect(() => {
    fetch(`${API_BASE}/vendors`)
      .then(res => res.json())
      .then(setVendors)
      .catch(console.error);
  }, []);

  const filtered = vendors.filter(v =>
    riskFilter === "all" ? true : v.risk === riskFilter
  );

  const riskData = [
    { name: "Preferred", value: vendors.filter(v => v.risk === "Preferred").length },
    { name: "Neutral", value: vendors.filter(v => v.risk === "Neutral").length },
    { name: "High Risk", value: vendors.filter(v => v.risk === "High Risk").length },
  ];

  const RISK_COLORS = {
    Preferred: "#10b981", // emerald-500
    Neutral: "#64748b",   // slate-500
    "High Risk": "#ef4444", // red-500
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Vendor Dashboard</h1>
      <p className="mb-4 text-sm text-slate-600">
        Central “report card” for suppliers across government departments.
      </p>

      <section className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-semibold">Risk Overview</h2>
            <p className="text-xs text-slate-500">
              Snapshot of vendor performance across government.
            </p>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={60} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="flex gap-2 mb-4 text-xs">
        {["all", "Preferred", "Neutral", "High Risk"].map((label) => (
          <button
            key={label}
            onClick={() => setRiskFilter(label === "all" ? "all" : label)}
            className={`px-3 py-1 rounded-full border ${
              riskFilter === label
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            {label === "all" ? "All vendors" : label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map(v => (
          <Link
            key={v.id}
            to={`/vendors/${v.id}`}
            className="border bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium">{v.name}</h2>
                <p className="text-sm text-slate-500">{v.industry}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Avg Score</div>
                <div className="text-xl font-semibold">{v.avg_score}</div>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                    v.risk === "High Risk"
                      ? "bg-red-100 text-red-700"
                      : v.risk === "Preferred"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {v.risk}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
