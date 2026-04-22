import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Donate from "./pages/Donate";
import Feed from "./pages/Feed";
import Heatmap from "./pages/Heatmap";
import Home from "./pages/Home";
import IssueDetail from "./pages/IssueDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportIssue from "./pages/ReportIssue";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <p className="p-6">Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/issue/:needId" element={<IssueDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
