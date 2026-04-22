import { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const categories = [
  "Medical",
  "Food",
  "Disaster",
  "Education",
  "Sanitation",
  "Infrastructure",
  "Livelihood",
  "Community Welfare"
];

export default function ReportIssue() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    category: "Medical",
    description: "",
    pincode: "",
    people_affected: 1,
    online_resolvable: false,
    photo: null
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to report an issue");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "photo" && !value) return;
        payload.append(key, value);
      });
      const { data } = await api.post("/issues", payload, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Issue submitted: ${data.need_id}`);
      toast.info("Volunteer matching has been triggered");
      setForm({
        category: "Medical",
        description: "",
        pincode: "",
        people_affected: 1,
        online_resolvable: false,
        photo: null
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-civicCard p-6 rounded-xl border border-green-100 space-y-4">
      <h1 className="text-xl font-semibold text-civicGreen">Report Community Issue</h1>
      <select className="w-full p-2 border rounded" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        placeholder="Describe the issue..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="grid md:grid-cols-2 gap-3">
        <input className="p-2 border rounded" placeholder="Pincode / Ward" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        <input
          className="p-2 border rounded"
          type="number"
          min={1}
          value={form.people_affected}
          onChange={(e) => setForm({ ...form, people_affected: Number(e.target.value) })}
        />
      </div>
      <label className="block text-sm">
        <span className="text-gray-700">Photo Upload</span>
        <input className="mt-1 block w-full" type="file" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.online_resolvable}
          onChange={(e) => setForm({ ...form, online_resolvable: e.target.checked })}
        />
        Can be resolved online?
      </label>
      <button className="bg-civicGreen text-white px-4 py-2 rounded" type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Issue"}
      </button>
    </form>
  );
}
