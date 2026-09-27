import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCart from "../components/AdminRestaurantCart";
import AdminRiderCart from "../components/AdminRiderCart";
import { BiRestaurant, BiShieldQuarter } from "react-icons/bi";
import { RiMotorbikeLine } from "react-icons/ri";
import { VscLoading } from "react-icons/vsc";

const Admin = () => {
  const [restaurant, setRestaurant] = useState<any[]>([]);
  const [rider, setRider] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${adminService}/api/v1/admin/restaurant/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const response = await axios.get(`${adminService}/api/v1/admin/rider/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setRestaurant(data.restaurants || []);
      setRider(response.data.riders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <VscLoading className="animate-spin text-orange-400 text-3xl" />
        <p className="text-xs text-slate-400 font-medium">Loading admin verification portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-6xl space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <BiShieldQuarter className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Admin Portal</h1>
              <p className="text-xs text-slate-400">Review and verify pending restaurant partners and delivery riders</p>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 backdrop-blur-md self-start sm:self-auto">
            <button
              onClick={() => setTab("restaurant")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                tab === "restaurant"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BiRestaurant className="text-sm" />
              <span>Pending Restaurants ({restaurant.length})</span>
            </button>

            <button
              onClick={() => setTab("rider")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                tab === "rider"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <RiMotorbikeLine className="text-sm" />
              <span>Pending Riders ({rider.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {tab === "restaurant" && (
          <div>
            {restaurant.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-300">All Caught Up</p>
                <p className="text-xs text-slate-500">No pending restaurants awaiting verification at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurant.map((r) => (
                  <AdminRestaurantCart key={r._id} restaurant={r} onVerify={fetchData} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "rider" && (
          <div>
            {rider.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-300">All Caught Up</p>
                <p className="text-xs text-slate-500">No pending riders awaiting license and ID approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rider.map((r) => (
                  <AdminRiderCart key={r._id} rider={r} onVerify={fetchData} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;