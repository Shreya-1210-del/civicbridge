import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const skillOptions = [
  "medical",
  "first aid",
  "food distribution",
  "teaching",
  "sanitation",
  "disaster response",
  "infrastructure",
  "livelihood",
  "community outreach"
];

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    user_type: "Community Member",
    pincode: "",
    skills: [],
    language: "",
    transport: "none",
    availability: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill]
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, skills: form.user_type === "Volunteer" ? form.skills : [] };
      const { data } = await api.post("/auth/register", payload);
      login(data.token, data.user);
      toast.success(`Registered successfully. Your ID: ${data.user.anonymous_id}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-civicCard p-6 rounded-xl border border-green-100 space-y-4">
      <h1 className="text-xl font-semibold text-civicGreen">Register</h1>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="p-2 border rounded"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="p-2 border rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="p-2 border rounded"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          className="p-2 border rounded"
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />
        <select className="p-2 border rounded" value={form.user_type} onChange={(e) => setForm({ ...form, user_type: e.target.value })}>
          <option>Volunteer</option>
          <option>Community Member</option>
          <option>NGO</option>
        </select>
        <input
          className="p-2 border rounded"
          placeholder="Language"
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
        />
        <input
          className="p-2 border rounded"
          placeholder="Availability (e.g. weekends/evening)"
          value={form.availability}
          onChange={(e) => setForm({ ...form, availability: e.target.value })}
        />
        <select className="p-2 border rounded" value={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.value })}>
          <option value="none">No Transport</option>
          <option value="bike">Bike</option>
          <option value="scooter">Scooter</option>
          <option value="car">Car</option>
        </select>
      </div>
      {form.user_type === "Volunteer" && (
        <div>
          <p className="text-sm font-medium text-civicGreen mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-2 py-1 text-xs rounded-full border ${
                  form.skills.includes(skill) ? "bg-civicGreen text-white border-civicGreen" : "bg-white border-green-200 text-civicGreen"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}
      <button className="bg-civicGreen text-white px-4 py-2 rounded" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
