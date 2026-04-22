import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto bg-civicCard p-6 rounded-xl border border-green-100 space-y-4">
      <h1 className="text-xl font-semibold text-civicGreen">Login</h1>
      <input
        className="w-full p-2 border rounded"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="w-full p-2 border rounded"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="w-full bg-civicGreen text-white p-2 rounded" disabled={loading} type="submit">
        {loading ? "Logging in..." : "Login"}
      </button>
      <p className="text-xs text-gray-600">Demo password for seeded users: `password123`</p>
    </form>
  );
}
