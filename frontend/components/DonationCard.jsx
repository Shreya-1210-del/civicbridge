import Icon from "./Icon";

export default function DonationCard({ issue, onPledge }) {
  return (
    <div className="lift-card soft-card overflow-hidden rounded-2xl">
      <div className="h-2 bg-gradient-to-r from-civicGreen via-civicAmber to-civicBlue" />
      <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{issue.need_id}</p>
          <h3 className="text-xl font-black text-civicDark">{issue.category}</h3>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">Credibility {issue.credibility_score}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-emerald-950/75">{issue.description}</p>
      <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-civicGreen">
        Your help could change {issue.people_affected} lives
      </p>
      <div className="mt-5 flex items-center justify-between text-xs font-black text-emerald-800">
        <span>{issue.pledged_amount} pledged</span>
        <span>{issue.total_pledges} pledges</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border border-emerald-100 bg-white">
        <div className="h-full rounded-full bg-gradient-to-r from-civicGreen to-civicAmber transition-all duration-500" style={{ width: `${issue.progress}%` }} />
      </div>
      <p className="mt-1 text-xs font-semibold text-emerald-700">{issue.progress}% toward {issue.fundingGoal} mock goal</p>
      <button
        type="button"
        onClick={() => onPledge(issue.need_id)}
        className="brand-button mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white"
      >
        <Icon name="heart" className="h-4 w-4" />
        Donate / Help Online
      </button>
      </div>
    </div>
  );
}
