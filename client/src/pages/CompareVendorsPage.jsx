import { useEffect, useState } from "react";

const API_BASE =
  (import.meta?.env?.VITE_API_URL || "http://localhost:4000") + "/api";

export default function CompareVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [vendorAId, setVendorAId] = useState("");
  const [vendorBId, setVendorBId] = useState("");
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [recommendation, setRecommendation] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/vendors`)
      .then((res) => res.json())
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const selectedVendorA =
    vendors.find((v) => String(v.id) === String(vendorAId)) || null;
  const selectedVendorB =
    vendors.find((v) => String(v.id) === String(vendorBId)) || null;

  async function handleCompare() {
    if (!selectedVendorA || !selectedVendorB) {
      alert("Select two vendors to compare.");
      return;
    }
    setComparing(true);
    setRecommendation("");
    try {
      const res = await fetch(`${API_BASE}/ai/recommend-vendor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorA: selectedVendorA,
          vendorB: selectedVendorB,
        }),
      });
      const data = await res.json();
      setRecommendation(data.recommendation || "No recommendation returned.");
    } catch (e) {
      console.error(e);
      alert("AI recommendation failed");
    } finally {
      setComparing(false);
    }
  }

  function copyRecommendation() {
    if (!recommendation) return;
    navigator.clipboard.writeText(recommendation).catch(() => {});
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Compare Vendors</h1>
      {loading ? (
        <div className="text-sm text-slate-600">Loading vendors…</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vendor A
                </label>
                <select
                  value={vendorAId}
                  onChange={(e) => setVendorAId(e.target.value)}
                  className="w-full border rounded-md px-2 py-2 text-sm"
                >
                  <option value="">Select vendor…</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.avg_score})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vendor B
                </label>
                <select
                  value={vendorBId}
                  onChange={(e) => setVendorBId(e.target.value)}
                  className="w-full border rounded-md px-2 py-2 text-sm"
                >
                  <option value="">Select vendor…</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.avg_score})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={handleCompare}
                disabled={comparing}
                className="px-4 py-2 text-sm rounded-md bg-slate-900 text-white"
              >
                {comparing ? "Comparing..." : "Compare"}
              </button>
            </div>
          </div>

          {recommendation && (
            <section className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold">AI Recommendation</h2>
                <button
                  onClick={copyRecommendation}
                  className="text-xs px-3 py-1 border rounded-md"
                >
                  Copy
                </button>
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {recommendation}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

