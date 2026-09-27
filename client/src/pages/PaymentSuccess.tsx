import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-emerald-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-orange-600/15 blur-[120px]" />

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 text-center space-y-6">
        {/* Animated Check Icon */}
        <div className="inline-flex items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/20">
            <BiCheckCircle className="text-5xl" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Payment Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Your payment was successful and the kitchen has received your order.
          </p>
        </div>

        {paymentId && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Transaction Reference ID
            </span>
            <p className="font-mono text-slate-300 break-all select-all">{paymentId}</p>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => navigate("/orders")}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Track Order Status</span>
            <BsArrowRight className="text-sm" />
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 py-3 px-4 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <span>Order More Delicacies</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;