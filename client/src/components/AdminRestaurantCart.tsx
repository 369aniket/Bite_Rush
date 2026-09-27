import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { BiCheckCircle, BiMapPin, BiPhone, BiStore } from "react-icons/bi";

interface Props {
  restaurant: any;
  onVerify: () => void;
}

const AdminRestaurantCart = ({ restaurant, onVerify }: Props) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/admin/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Restaurant verified successfully");
      onVerify();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to verify restaurant");
    }
  };

  return (
    <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md transition-all hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5">
      <div className="relative mb-4 h-44 w-full overflow-hidden rounded-2xl bg-slate-950">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2.5 right-2.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30 backdrop-blur-md">
          Pending Approval
        </div>
      </div>

      <div className="flex-1 space-y-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <BiStore className="text-orange-400 text-base shrink-0" />
          <h3 className="font-bold text-sm text-white truncate">{restaurant.name}</h3>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <BiPhone className="text-orange-400 text-sm shrink-0" />
          <span className="font-mono text-slate-200">{restaurant.phone}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-400">
          <BiMapPin className="text-orange-400 text-sm shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed">{restaurant.autoLocation?.formatedAddress}</span>
        </div>
      </div>

      <button
        onClick={verify}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
      >
        <BiCheckCircle className="text-base" />
        <span>Verify & Approve Restaurant</span>
      </button>
    </div>
  );
};

export default AdminRestaurantCart;