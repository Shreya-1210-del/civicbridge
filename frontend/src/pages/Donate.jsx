import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DonationCard from "../components/DonationCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Donate() {
  const [items, setItems] = useState([]);
  const { isAuthenticated } = useAuth();

  const load = async () => {
    const { data } = await api.get("/donations/online-needs");
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const pledge = async (needId) => {
    if (!isAuthenticated) {
      toast.error("Login required to pledge");
      return;
    }
    try {
      await api.post(`/donations/pledge/${needId}`, { amount_mock: 100 });
      toast.success("Pledge recorded");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Pledge failed");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-civicGreen mb-4">Donation / Online Action</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <DonationCard key={item.need_id} issue={item} onPledge={pledge} />
        ))}
      </div>
    </div>
  );
}
