import axios from "axios";
import { useEffect, useState } from "react";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { RiMotorbikeLine } from "react-icons/ri";
import { VscLoading } from "react-icons/vsc";
import { BiCheck } from "react-icons/bi";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      setAccepting(true);
      await axios.post(
        `${riderService}/api/v1/rider/accept/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success("Order accepted successfully!");
      onAccepted();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Order expired or already accepted");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  const progressPercent = (secondsLeft / 10) * 100;

  return (
    <div className="rounded-3xl border border-orange-500/40 bg-slate-900/90 p-5 backdrop-blur-xl shadow-2xl space-y-4">
      {/* Header alert */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <RiMotorbikeLine className="text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Incoming Delivery Request</h3>
            <span className="font-mono text-[11px] text-slate-400">
              Order #{orderId.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Countdown Pill */}
        <div className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
          <span>{secondsLeft}s</span>
        </div>
      </div>

      {/* Progress Bar Timer */}
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <button
        disabled={accepting || secondsLeft === 0}
        onClick={acceptOrder}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
      >
        {accepting ? (
          <>
            <VscLoading className="animate-spin text-base" />
            <span>Accepting Delivery...</span>
          </>
        ) : (
          <>
            <BiCheck className="text-lg" />
            <span>Accept Order & Start Pickup</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RiderOrderRequest;