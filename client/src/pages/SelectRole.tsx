import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";
import toast from "react-hot-toast";
import { BiCheckCircle, BiRestaurant, BiShoppingBag } from "react-icons/bi";
import { RiMotorbikeLine } from "react-icons/ri";
import { VscLoading } from "react-icons/vsc";

type Role = "customer" | "rider" | "seller";

interface RoleOption {
  id: Role;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
}

const SelectRole = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const roleOptions: RoleOption[] = [
    {
      id: "customer",
      title: "Customer",
      subtitle: "Order mouthwatering food from top local restaurants",
      icon: <BiShoppingBag className="text-2xl text-orange-400" />,
      badge: "Food Lover",
    },
    {
      id: "rider",
      title: "Delivery Partner",
      subtitle: "Accept local deliveries, earn money on your schedule",
      icon: <RiMotorbikeLine className="text-2xl text-orange-400" />,
      badge: "Flexible Payouts",
    },
    {
      id: "seller",
      title: "Restaurant Owner",
      subtitle: "List menu items, accept live orders & grow your store",
      icon: <BiRestaurant className="text-2xl text-orange-400" />,
      badge: "Grow Business",
    },
  ];

  const addRole = async () => {
    if (!role) return;

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${authService}/api/v1/auth/add/role`,
        { role },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success(`Role selected: ${role.toUpperCase()}`);
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to set role");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-orange-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-amber-500/15 blur-[120px]" />

      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Choose Your <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Role</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tell us how you would like to experience BiteRush today
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          {roleOptions.map((opt) => {
            const isSelected = role === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setRole(opt.id)}
                className={`relative flex items-center gap-4 rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10 scale-[1.01]"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950/90"
                }`}
              >
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-orange-500/20 border-orange-500/40"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  {opt.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">{opt.title}</h3>
                    <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.subtitle}</p>
                </div>

                <div className="shrink-0">
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-slate-700 bg-slate-900"
                    }`}
                  >
                    {isSelected && <BiCheckCircle className="text-sm" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          disabled={!role || loading}
          onClick={addRole}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25"
        >
          {loading ? (
            <>
              <VscLoading className="animate-spin text-base" />
              <span>Setting up profile...</span>
            </>
          ) : (
            <span>Continue to BiteRush →</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SelectRole;