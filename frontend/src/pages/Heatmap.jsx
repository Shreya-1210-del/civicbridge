import { useEffect, useState } from "react";
import HeatmapGrid from "../components/HeatmapGrid";
import api from "../services/api";

const categories = ["", "Medical", "Food", "Disaster", "Education", "Sanitation", "Infrastructure", "Livelihood", "Community Welfare"];
const tiers = ["", "Tier 1 (Critical)", "Tier 2 (High)", "Tier 3 (Medium)"];

export default function Heatmap() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ category: "", urgency: "" });

  const load = async () => {
    const { data } = await api.get("/community/heatmap", { params: filters });
    setRows(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h1 className="text-xl font-semibold text-civicGreen">Needs Heatmap</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="p-2 border rounded" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c || "All Categories"}
              </option>
            ))}
          </select>
          <select className="p-2 border rounded" value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t || "All Urgency Tiers"}
              </option>
            ))}
          </select>
          <button className="bg-civicGreen text-white px-3 rounded" type="button" onClick={load}>
            Apply
          </button>
        </div>
      </div>

      <HeatmapGrid data={rows} onSelect={setSelected} />

      {selected && (
        <div className="bg-civicCard p-4 rounded-xl border border-green-100">
          <h2 className="font-semibold text-civicGreen">{selected.city}</h2>
          <p className="text-sm">Pincode: {selected.pincode}</p>
          <p className="text-sm">Total Issues: {selected.issue_count || 0}</p>
          <p className="text-sm">Resolved: {selected.resolved_count || 0}</p>
        </div>
      )}
    </div>
  );
}
