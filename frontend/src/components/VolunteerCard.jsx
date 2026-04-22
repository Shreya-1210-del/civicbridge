export default function VolunteerCard({ volunteer }) {
  return (
    <div className="bg-white border border-green-100 rounded-lg p-3">
      <p className="font-semibold text-civicGreen">{volunteer.volunteer_anonymous_id}</p>
      <p className="text-sm text-gray-600">Score: {volunteer.match_score}</p>
      <p className="text-xs mt-1 text-gray-600">Skills: {(volunteer.skills || []).join(", ") || "N/A"}</p>
      <p className="text-xs text-gray-600">Rating: {Math.min(5, Math.max(3, Math.round((volunteer.match_score / 20) * 10) / 10))}/5</p>
    </div>
  );
}
