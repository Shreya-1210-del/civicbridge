import Icon from "./Icon";

export default function VolunteerCard({ volunteer }) {
  const rating = Math.min(5, Math.max(3, Math.round((volunteer.match_score / 20) * 10) / 10));

  return (
    <div className="lift-card rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-900/5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-civicGreen to-teal-500 text-white">
          <Icon name="users" className="h-5 w-5" />
        </span>
        <div>
          <p className="font-black text-civicDark">{volunteer.volunteer_anonymous_id}</p>
          <p className="text-xs font-bold text-emerald-700">Rating {rating}/5</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs font-black text-emerald-800">
          <span>Match Score</span>
          <span>{volunteer.match_score}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full rounded-full bg-gradient-to-r from-civicGreen to-civicBlue" style={{ width: `${Math.min(volunteer.match_score, 100)}%` }} />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-emerald-900/70">Skills: {(volunteer.skills || []).join(", ") || "N/A"}</p>
    </div>
  );
}
