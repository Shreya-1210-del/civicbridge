import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BadgeChip from "../components/BadgeChip";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function VolunteerDashboard() {
  const [data, setData] = useState(null);

  const load = async () => {
    const { data: res } = await api.get("/matches/volunteer/dashboard");
    setData(res);
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (matchId, action) => {
    await api.patch(`/matches/${matchId}/respond`, { action });
    if (action === "accept") toast.success("Task accepted");
    load();
  };

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="text-lg font-semibold text-civicGreen">Impact Stats</h2>
        <div className="grid md:grid-cols-3 gap-3 mt-2 text-sm">
          <p>Tasks completed: {data.impact.total_tasks_completed}</p>
          <p>People helped: {data.impact.people_helped}</p>
          <p>Hours contributed: {data.impact.hours_contributed}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.badges.map((b) => (
            <BadgeChip key={b.badge_name} name={b.badge_name} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-civicGreen mb-2">Pending Task Matches</h2>
        <div className="space-y-3">
          {data.pending.map((m) => (
            <div key={m.id} className="bg-white p-3 rounded border border-green-100">
              <p className="font-medium">
                {m.need_id} - {m.category}
              </p>
              <p className="text-sm text-gray-600">{m.description}</p>
              <p className="text-sm">Match score: {m.match_score}</p>
              <div className="flex gap-2 mt-2">
                <button className="bg-civicGreen text-white px-2 py-1 rounded text-sm" type="button" onClick={() => respond(m.id, "accept")}>
                  Accept
                </button>
                <button className="bg-gray-200 px-2 py-1 rounded text-sm" type="button" onClick={() => respond(m.id, "decline")}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-civicGreen mb-2">Active Accepted Tasks</h2>
        <div className="space-y-3">
          {data.active.map((m) => (
            <div key={m.id} className="bg-civicCard p-3 rounded border border-green-100">
              <p className="font-medium">{m.need_id}</p>
              <p className="text-sm">Token: {m.contact_token || "Pending"}</p>
              <p className="text-xs text-gray-600">Valid till: {m.token_expiry ? new Date(m.token_expiry).toLocaleString() : "-"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NgoDashboard({ user }) {
  const [data, setData] = useState(null);
  const [announcement, setAnnouncement] = useState("");

  const load = async () => {
    const { data: res } = await api.get("/community/ngo/dashboard");
    setData(res);
  };

  useEffect(() => {
    load();
  }, []);

  const verify = async (needId) => {
    await api.patch(`/issues/${needId}/verify`);
    toast.success("Issue verified and credibility updated");
    load();
  };

  if (!data) return <p>Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="font-semibold text-civicGreen">Your Posted Issues</h2>
        <div className="space-y-2 mt-2">
          {data.postedByNgo.map((issue) => (
            <div key={issue.need_id} className="bg-white p-3 rounded border border-green-100">
              <p className="font-medium">
                {issue.need_id} - {issue.category}
              </p>
              <p className="text-sm">
                Status: {issue.status} | Credibility: {issue.credibility_score}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="font-semibold text-civicGreen">Issues in Your Area</h2>
        <div className="space-y-2 mt-2">
          {data.areaIssues.map((issue) => (
            <div key={issue.need_id} className="bg-white p-3 rounded border border-green-100">
              <p className="font-medium">
                {issue.need_id} - {issue.category}
              </p>
              <p className="text-sm">Credibility: {issue.credibility_score}</p>
              <p className="text-sm">Verified: {issue.ngo_verified ? "Yes" : "No"}</p>
              {!issue.ngo_verified && (
                <button className="mt-2 bg-civicGreen text-white px-2 py-1 rounded text-sm" type="button" onClick={() => verify(issue.need_id)}>
                  Verify Issue
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="font-semibold text-civicGreen">Volunteer Match Results</h2>
        <div className="space-y-2 mt-2">
          {data.matchResults.map((m, idx) => (
            <p className="text-sm" key={`${m.need_id}-${m.volunteer_anonymous_id}-${idx}`}>
              {m.need_id}: {m.volunteer_anonymous_id} ({m.match_score}) - {m.status}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="font-semibold text-civicGreen">Post Announcement</h2>
        <textarea
          className="w-full p-2 border rounded mt-2"
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Write a public area update..."
        />
        <button
          type="button"
          onClick={async () => {
            try {
              await api.post("/community/posts", { content: announcement, pincode: user.pincode });
              setAnnouncement("");
              toast.success("Announcement posted");
              load();
            } catch (e) {
              toast.error(e.response?.data?.message || "Failed to post");
            }
          }}
          className="bg-civicGreen text-white px-3 py-2 rounded mt-2"
        >
          Publish
        </button>
      </section>
    </div>
  );
}

function CommunityDashboard() {
  const [issues, setIssues] = useState([]);
  const [assigned, setAssigned] = useState([]);

  const load = async () => {
    const [issuesRes, assignedRes] = await Promise.all([api.get("/issues/reporter/my"), api.get("/matches/community/assigned")]);
    setIssues(issuesRes.data);
    setAssigned(assignedRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (needId) => {
    await api.patch(`/issues/${needId}/resolve`);
    toast.success("Issue marked resolved");
    load();
  };

  return (
    <div className="space-y-6">
      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="font-semibold text-civicGreen">My Reported Issues</h2>
        <div className="space-y-2 mt-2">
          {issues.map((issue) => (
            <div key={issue.need_id} className="bg-white p-3 rounded border border-green-100">
              <p className="font-medium">
                <Link to={`/issue/${issue.need_id}`} className="text-civicGreen">
                  {issue.need_id}
                </Link>{" "}
                - {issue.category}
              </p>
              <p className="text-sm">
                Status: {issue.status} | Credibility: {issue.credibility_score}
              </p>
              {issue.status !== "resolved" && (
                <button className="mt-2 bg-civicGreen text-white px-2 py-1 rounded text-sm" type="button" onClick={() => resolve(issue.need_id)}>
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-civicCard p-4 rounded-xl border border-green-100">
        <h2 className="font-semibold text-civicGreen">Assigned Volunteers</h2>
        <div className="space-y-2 mt-2">
          {assigned.map((a) => (
            <div key={a.need_id} className="bg-white p-3 rounded border border-green-100">
              <p className="text-sm">
                {a.need_id} - {a.category}
              </p>
              <p className="text-sm">Volunteer: {a.volunteer_anonymous_id || "Awaiting acceptance"}</p>
              <p className="text-xs text-gray-600">Token: {a.contact_token || "-"}</p>
              <p className="text-xs text-gray-600">Task Status: {a.match_status || "pending"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <p>Please login.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-civicGreen mb-4">
        {user.user_type} Dashboard ({user.anonymous_id})
      </h1>
      {user.user_type === "Volunteer" && <VolunteerDashboard />}
      {user.user_type === "NGO" && <NgoDashboard user={user} />}
      {user.user_type === "Community Member" && <CommunityDashboard />}
    </div>
  );
}
