import { useEffect, useState } from "react";
import api from "../services/api";
import IssueCard from "../components/IssueCard";

export default function Home() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get("/issues").then((res) => setIssues(res.data.slice(0, 6))).catch(() => setIssues([]));
  }, []);

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-civicGreen to-green-700 text-white rounded-2xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold">CivicBridge</h1>
        <p className="mt-2 text-sm md:text-base">
          A data-driven volunteer coordination platform for faster, anonymous, and credible community response.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-civicGreen mb-3">Recent Needs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.map((issue) => (
            <IssueCard key={issue.need_id} issue={issue} />
          ))}
        </div>
      </section>
    </div>
  );
}
