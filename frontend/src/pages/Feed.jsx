import { useEffect, useState } from "react";
import IssueCard from "../components/IssueCard";
import api from "../services/api";

export default function Feed() {
  const [pincode, setPincode] = useState("");
  const [data, setData] = useState({ issues: [], announcements: [], active_volunteers: 0 });

  const load = async (pin) => {
    const { data: response } = await api.get("/community/feed", { params: { pincode: pin || undefined } });
    setData(response);
  };

  useEffect(() => {
    load("");
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h1 className="text-xl font-semibold text-civicGreen">Community Feed</h1>
        <div className="mt-3 flex gap-2">
          <input
            className="p-2 border rounded w-52"
            placeholder="Filter by pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
          <button className="bg-civicGreen text-white px-3 py-2 rounded" type="button" onClick={() => load(pincode)}>
            Apply
          </button>
        </div>
        <p className="text-sm mt-2 text-gray-600">Active volunteers in area: {data.active_volunteers}</p>
      </div>

      <section>
        <h2 className="font-semibold text-civicGreen mb-2">Recent Issues</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.issues.map((issue) => (
            <IssueCard key={issue.need_id} issue={issue} />
          ))}
        </div>
      </section>

      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="font-semibold text-civicGreen mb-2">Announcements</h2>
        <div className="space-y-2">
          {data.announcements.map((a) => (
            <div key={a.id} className="bg-white p-3 rounded border border-green-100">
              <p className="text-sm">{a.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {a.pincode} | {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
