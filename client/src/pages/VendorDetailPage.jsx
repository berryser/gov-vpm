import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "http://localhost:4000/api";

export default function VendorDetailPage() {
  const { id } = useParams();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [evalForm, setEvalForm] = useState({
    department: "PSPC",
    contractSummary: "",
    incidentDescription: "",
    quality: 3,
    cost_adherence: 3,
    schedule: 3,
    management: 3,
    overall_score: 3,
    rationale: "",
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  function fetchVendor() {
    setLoading(true);
    fetch(`${API_BASE}/vendors/${id}`)
      .then(res => res.json())
      .then(data => {
        setVendorData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchVendor();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setEvalForm(f => ({
      ...f,
      [name]:
        ["quality", "cost_adherence", "schedule", "management", "overall_score"].includes(
          name
        ) ? Number(value) : value,
    }));
  }

  async function handleUseAI() {
    if (!vendorData) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/suggest-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName: vendorData.vendor.name,
          contractSummary: evalForm.contractSummary,
          incidentDescription: evalForm.incidentDescription,
        }),
      });
      const data = await res.json();
      setEvalForm(f => ({
        ...f,
        quality: data.quality,
        cost_adherence: data.cost_adherence,
        schedule: data.schedule,
        management: data.management,
        overall_score: data.overall_score,
        rationale: data.rationale,
      }));
    } catch (e) {
      console.error(e);
      alert("AI scoring failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/vendors/${id}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalForm),
      });
      if (!res.ok) throw new Error("Save failed");
      setEvalForm(f => ({
        ...f,
        contractSummary: "",
        incidentDescription: "",
        rationale: "",
      }));
      fetchVendor();
    } catch (e) {
      console.error(e);
      alert("Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !vendorData) return <div>Loading...</div>;

  const { vendor, evaluations } = vendorData;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl shadow p-4">
        <h1 className="text-2xl font-semibold mb-1">{vendor.name}</h1>
        <p className="text-sm text-slate-500 mb-2">{vendor.industry}</p>
        <p className="text-sm text-slate-700">{vendor.description}</p>
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">New Evaluation</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <input
                name="department"
                value={evalForm.department}
                onChange={handleChange}
                className="w-full border rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Overall Score (1–5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                name="overall_score"
                value={evalForm.overall_score}
                onChange={handleChange}
                className="w-full border rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contract Summary
            </label>
            <textarea
              name="contractSummary"
              value={evalForm.contractSummary}
              onChange={handleChange}
              className="w-full border rounded-md px-2 py-1 text-sm h-16"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              What happened? (performance description)
            </label>
            <textarea
              name="incidentDescription"
              value={evalForm.incidentDescription}
              onChange={handleChange}
              className="w-full border rounded-md px-2 py-1 text-sm h-24"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["quality", "cost_adherence", "schedule", "management"].map(
              key => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1 capitalize">
                    {key.replace("_", " ")}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    name={key}
                    value={evalForm[key]}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-600">
                    {evalForm[key]}
                  </div>
                </div>
              )
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rationale</label>
            <textarea
              name="rationale"
              value={evalForm.rationale}
              onChange={handleChange}
              className="w-full border rounded-md px-2 py-1 text-sm h-20"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleUseAI}
              disabled={aiLoading}
              className="px-4 py-2 text-sm border rounded-md bg-slate-100"
            >
              {aiLoading ? "Asking Gemini..." : "Let AI suggest scores"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-md bg-slate-900 text-white"
            >
              {saving ? "Saving..." : "Save Evaluation"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Past Evaluations</h2>
        {evaluations.length === 0 && (
          <p className="text-sm text-slate-500">No evaluations yet.</p>
        )}
        <div className="space-y-3">
          {evaluations.map(ev => (
            <div
              key={ev.id}
              className="border rounded-lg p-3 text-sm flex justify-between"
            >
              <div>
                <div className="font-medium">{ev.department}</div>
                <div className="text-slate-500 text-xs mb-1">
                  {new Date(ev.created_at).toLocaleString()}
                </div>
                <div className="text-slate-700 mb-1">
                  {ev.rationale || "No rationale provided."}
                </div>
                <div className="text-[11px] text-slate-500">
                  Q:{ev.quality} | C:{ev.cost_adherence} | S:{ev.schedule} | M:
                  {ev.management}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Overall</div>
                <div className="text-xl font-semibold">
                  {ev.overall_score?.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
