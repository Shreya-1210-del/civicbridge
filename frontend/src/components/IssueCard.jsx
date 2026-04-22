import { Link } from "react-router-dom";

export default function IssueCard({ issue }) {
  return (
    <article className="bg-civicCard rounded-xl p-4 border border-green-100">
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="text-xs text-gray-600">{issue.need_id}</p>
          <h3 className="font-semibold text-civicGreen">{issue.category}</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-white rounded border border-green-200">{issue.urgency_tier}</span>
      </div>
      <p className="text-sm mt-2 text-gray-700 line-clamp-2">{issue.description}</p>
      <div className="mt-3 text-xs text-gray-600 flex flex-wrap gap-3">
        <span>Pincode: {issue.pincode}</span>
        <span>Status: {issue.status === "resolved" ? "✓ Resolved" : issue.status}</span>
      </div>
      <Link to={`/issue/${issue.need_id}`} className="inline-block mt-3 text-sm text-civicGreen font-medium">
        View Details
      </Link>
    </article>
  );
}
