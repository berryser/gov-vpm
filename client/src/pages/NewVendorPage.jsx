import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000/api";

export default function NewVendorPage() {
  const [form, setForm] = useState({
    name: "",
    industry: "",
    description: "",
  });
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    navigate(`/vendors/${data.id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Add Vendor</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded-xl shadow"
      >
        <input
          name="name"
          placeholder="Vendor Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2"
          required
        />

        <input
          name="industry"
          placeholder="Industry"
          value={form.industry}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 h-24"
        />

        <button className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm">
          Save
        </button>
      </form>
    </div>
  );
}
