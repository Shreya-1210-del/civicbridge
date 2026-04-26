import { Link } from "react-router-dom";
import Icon from "./Icon";

const categoryStyles = {
  Medical: { icon: "heart", border: "border-l-red-500", badge: "bg-red-100 text-red-700" },
  Food: { icon: "hand", border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700" },
  Disaster: { icon: "spark", border: "border-l-red-600", badge: "bg-red-100 text-red-700" },
  Education: { icon: "brain", border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700" },
  Sanitation: { icon: "shield", border: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  Infrastructure: { icon: "mapPin", border: "border-l-slate-500", badge: "bg-slate-100 text-slate-700" },
  Livelihood: { icon: "users", border: "border-l-purple-500", badge: "bg-purple-100 text-purple-700" },
  "Community Welfare": { icon: "heart", border: "border-l-blue-500", badge: "bg-blue-100 text-blue-700" }
};

export default function IssueCard({ issue }) {
  const style = categoryStyles[issue.category] || categoryStyles.Medical;
  const resolved = issue.status === "resolved";

  return (
    <article className={`lift-card soft-card overflow-hidden rounded-2xl border-l-4 ${style.border}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${style.badge}`}>
              <Icon name={style.icon} className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{issue.need_id}</p>
              <h3 className="text-lg font-black text-civicDark">{issue.category}</h3>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-civicGreen shadow-sm">
            {issue.urgency_tier}
          </span>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-emerald-950/75">{issue.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-emerald-800">
          <span className="rounded-full bg-emerald-50 px-3 py-1">Pincode {issue.pincode}</span>
          <span className={`rounded-full px-3 py-1 ${resolved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {resolved ? "Resolved" : issue.status}
          </span>
          {issue.people_affected && <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">{issue.people_affected} people</span>}
        </div>
        <Link to={`/issue/${issue.need_id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-civicGreen transition hover:translate-x-1">
          View Details
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </article>
  );
}
