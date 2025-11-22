import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:4000/api";

export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/vendors`)
      .then(res => res.json())
      .then(setVendors)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Vendor Dashboard</h1>
      <p className="mb-4 text-sm text-slate-600">
        Central “report card” for suppliers across government departments.
      </p>

      <div className="grid gap-4">
        {vendors.map(v => (
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
