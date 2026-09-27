import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiCheckCircle, BiMapPin, BiNavigation, BiPhone, BiStore } from "react-icons/bi";
import { useState } from "react";
import { VscLoading } from "react-icons/vsc";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [loading, setLoading] = useState(false);

  const onUpdateStatus = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${riderService}/api/v1/rider/order/update/${order._id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success("Order status advanced successfully");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update trip status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-orange-500/30 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping" />
          <h2 className="font-bold text-sm text-white">Active Delivery Trip</h2>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-400">
          #{order._id.slice(-6).toUpperCase()}
        </span>
      </div>

      {/* Pickup & Drop Timeline */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
        {/* Pickup */}
        <div className="flex items-start gap-3">
          <div className="h-7 w-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
            <BiStore className="text-base" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Pickup Restaurant
            </span>
            <p className="font-bold text-slate-200 truncate">{order.restaurantName || "Restaurant Kitchen"}</p>
          </div>
        </div>

        <div className="ml-3.5 border-l-2 border-dashed border-slate-800 h-4" />

        {/* Drop */}
        <div className="flex items-start gap-3">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <BiMapPin className="text-base" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Drop Destination
            </span>
            <p className="font-semibold text-slate-300 leading-relaxed">
              {order.delivaryAddress?.formattedAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Trip Financials */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
            Order Total
          </span>
          <span className="font-extrabold text-sm text-white">₹{order.totalAmount}</span>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
            Your Payout
          </span>
          <span className="font-extrabold text-base text-orange-400">₹{order.riderAmount}</span>
        </div>
      </div>

      {/* Customer Contact */}
      {order.delivaryAddress?.mobile && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px]">Customer Phone</span>
            <span className="font-mono font-bold text-slate-200">{order.delivaryAddress.mobile}</span>
          </div>
          <a
            href={`tel:${order.delivaryAddress.mobile}`}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            <BiPhone className="text-orange-400" />
            <span>Call</span>
          </a>
        </div>
      )}

      {/* Action Progression Buttons */}
      <div className="pt-1">
        {order.status === "rider_assigned" && (
          <button
            disabled={loading}
            onClick={onUpdateStatus}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <VscLoading className="animate-spin text-base" /> : <BiNavigation className="text-base" />}
            <span>Reached Restaurant / Picked Up</span>
          </button>
        )}

        {order.status === "picked_up" && (
          <button
            disabled={loading}
            onClick={onUpdateStatus}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <VscLoading className="animate-spin text-base" /> : <BiCheckCircle className="text-base" />}
            <span>Delivered to Customer (Complete Order)</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;