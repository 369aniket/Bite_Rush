import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import { VscLoading } from "react-icons/vsc";
import { useAppData } from "../context/AppContext";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const { fetchCart } = useAppData();
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        await axios.post(`${utilsService}/api/v1/payment/stripe/verify`, {
          sessionId,
        });
        await fetchCart(); // Refresh cart after successful payment
        toast.success("Payment verified successfully!");
      } catch (error) {
        toast.error("Stripe payment verification failed");
        console.error(error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-emerald-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-orange-600/15 blur-[120px]" />

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 text-center space-y-6">
        {/* Animated Check Icon */}
        <div className="inline-flex items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/20">
            {verifying ? (
              <VscLoading className="text-4xl animate-spin text-orange-400" />
            ) : (
              <BiCheckCircle className="text-5xl" />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {verifying ? "Verifying Payment..." : "Order Placed Successfully!"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Your Stripe payment has been confirmed. The kitchen has begun preparing your food.
          </p>
        </div>

        {sessionId && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Stripe Session Reference
            </span>
            <p className="font-mono text-slate-300 break-all select-all text-[11px]">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>View Live Orders</span>
            <BsArrowRight className="text-sm" />
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 py-3 px-4 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <span>Back to Restaurants</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;