const CITY_LAYOUT = [
  { pincode: "560001", city: "Bengaluru Central", x: 30, y: 45 },
  { pincode: "560002", city: "Bengaluru South", x: 38, y: 56 },
  { pincode: "560003", city: "Bengaluru North", x: 35, y: 34 },
  { pincode: "110001", city: "New Delhi", x: 42, y: 18 },
  { pincode: "400001", city: "Mumbai", x: 24, y: 58 },
  { pincode: "600001", city: "Chennai", x: 55, y: 76 },
  { pincode: "700001", city: "Kolkata", x: 72, y: 44 },
  { pincode: "500001", city: "Hyderabad", x: 46, y: 64 }
];

function getColor(issueCount) {
  if (issueCount >= 5) return "bg-red-500";
  if (issueCount >= 3) return "bg-orange-400";
  if (issueCount >= 1) return "bg-yellow-300";
  return "bg-emerald-400";
}

export default function HeatmapGrid({ data, onSelect }) {
  const byPincode = new Map(data.map((x) => [x.pincode, x]));

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-3xl border border-emerald-800 bg-[#052e2b] shadow-2xl shadow-emerald-950/30">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute left-[18%] top-[12%] h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-[8%] right-[18%] h-56 w-56 rounded-full bg-amber-500/20 blur-3xl" />

      {CITY_LAYOUT.map((spot) => {
        const row = byPincode.get(spot.pincode);
        const count = row?.issue_count || 0;
        const critical = count >= 5;

        return (
          <button
            key={spot.pincode}
            type="button"
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${getColor(count)} ${
              critical ? "pulse-critical h-16 w-16" : "h-12 w-12"
            } border-4 border-white/80 text-[10px] font-black text-slate-950 shadow-xl transition hover:scale-110`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onClick={() => onSelect({ ...spot, ...row, issue_count: count })}
          >
            {spot.pincode}
          </button>
        );
      })}

      <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-xs font-bold text-white backdrop-blur">
        <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500" />Red: 5+ issues</p>
        <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-orange-400" />Orange: 3-4 issues</p>
        <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-yellow-300" />Yellow: 1-2 issues</p>
        <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-emerald-400" />Green: no current issues</p>
      </div>
    </div>
  );
}
