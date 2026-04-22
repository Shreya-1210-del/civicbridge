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
  return "bg-green-200";
}

export default function HeatmapGrid({ data, onSelect }) {
  const byPincode = new Map(data.map((x) => [x.pincode, x]));
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 overflow-hidden">
      {CITY_LAYOUT.map((spot) => {
        const row = byPincode.get(spot.pincode);
        const count = row?.issue_count || 0;
        return (
          <button
            key={spot.pincode}
            type="button"
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${getColor(
              count
            )} border-2 border-white shadow text-[10px] font-semibold text-black`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            onClick={() => onSelect({ ...spot, ...row, issue_count: count })}
          >
            {spot.pincode}
          </button>
        );
      })}
      <div className="absolute bottom-3 left-3 text-xs bg-white/90 p-2 rounded border border-green-100">
        <p>Red: 5+</p>
        <p>Orange: 3-4</p>
        <p>Yellow: 1-2</p>
      </div>
    </div>
  );
}
