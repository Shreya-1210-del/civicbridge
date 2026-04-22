import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VolunteerCard from "../components/VolunteerCard";
import api from "../services/api";

export default function IssueDetail() {
  const { needId } = useParams();
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    api.get(`/issues/${needId}`).then((res) => setIssue(res.data)).catch(() => setIssue(null));
  }, [needId]);

  if (!issue) {
    return <p className="text-gray-500">Loading issue...</p>;
  }

  return (
    <div className="space-y-4">
      <section className="bg-civicCard p-5 rounded-xl border border-green-100">
        <p className="text-xs text-gray-600">{issue.need_id}</p>
        <h1 className="text-2xl font-semibold text-civicGreen">{issue.category}</h1>
        <p className="text-sm mt-2 text-gray-700">{issue.description}</p>
        <div className="grid md:grid-cols-3 gap-3 mt-4 text-sm">
          <p>Pincode: {issue.pincode}</p>
          <p>Urgency: {issue.urgency_tier}</p>
          <p>Credibility: {issue.credibility_score}</p>
          <p>Status: {issue.status}</p>
          <p>People affected: {issue.people_affected}</p>
          <p>Reporter: {issue.reporter_anonymous_id}</p>
        </div>
        {issue.photo_path && <img src={issue.photo_path} alt="Issue evidence" className="mt-4 rounded-lg max-w-md border border-green-100" />}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-civicGreen mb-3">Matched Volunteers (Top 3)</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {issue.matches.map((m) => (
            <VolunteerCard key={m.id} volunteer={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
