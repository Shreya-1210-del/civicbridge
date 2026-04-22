export default function DonationCard({ issue, onPledge }) {
  return (
    <div className="bg-civicCard p-4 rounded-xl border border-green-100">
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="text-xs text-gray-600">{issue.need_id}</p>
          <h3 className="font-semibold text-civicGreen">{issue.category}</h3>
        </div>
        <span className="text-xs bg-white rounded px-2 py-1 border border-green-200">Credibility: {issue.credibility_score}</span>
      </div>
      <p className="text-sm text-gray-700 mt-2">{issue.description}</p>
      <p className="text-xs text-gray-600 mt-2">People affected: {issue.people_affected}</p>
      <p className="text-xs text-gray-600">Total pledges: {issue.total_pledges}</p>
      <div className="w-full bg-white rounded-full h-3 mt-3 overflow-hidden border border-green-100">
        <div className="bg-civicGreen h-3" style={{ width: `${issue.progress}%` }} />
      </div>
      <p className="text-xs text-gray-600 mt-1">
        {issue.pledged_amount} / {issue.fundingGoal} goal ({issue.progress}%)
      </p>
      <button
        type="button"
        onClick={() => onPledge(issue.need_id)}
        className="mt-3 bg-civicGreen text-white px-3 py-2 rounded-lg text-sm"
      >
        Donate / Help Online
      </button>
    </div>
  );
}
