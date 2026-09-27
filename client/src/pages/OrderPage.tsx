import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";
import {
  BiCheckCircle,
  BiChevronLeft,
  BiCreditCard,
  BiMapPin,
  BiMobile,
  BiPackage,
  BiTime,
} from "react-icons/bi";
import { IoFlashOutline } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";

const ORDER_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Cooking" },
  { key: "ready_for_rider", label: "Ready" },
  { key: "rider_assigned", label: "Assigned" },
  { key: "picked_up", label: "On The Way" },
  { key: "delivered", label: "Delivered" },
];

const getStepIndex = (status: string) => {
  const index = ORDER_STEPS.findIndex((s) => s.key === status);
  return index !== -1 ? index : 0;
};

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/v1/order/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(data.order || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join", `user:${id}`);

    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({ latitude, longitude }: any) => {
      setRiderLocation([latitude, longitude]);
    };

    socket.on("rider:location", onRiderLocation);

    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <VscLoading className="animate-spin text-orange-400 text-3xl" />
        <p className="text-xs text-slate-400 font-medium">Fetching live order status...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">We couldn&apos;t retrieve details for this order.</p>
        <button
          onClick={() => navigate("/orders")}
          className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isOutForDelivery = order.status === "rider_assigned" || order.status === "picked_up";

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="self-start inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <BiChevronLeft className="text-base" />
            <span>All Orders</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-white tracking-wider">
              #{order._id.slice(-6).toUpperCase()}
            </span>
            <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-400">
              {order.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        {/* 7-Stage Visual Stepper */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between relative overflow-x-auto pb-2">
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1 min-w-[70px] relative z-10">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                      isPast
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : isCurrent
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white ring-4 ring-orange-500/20 animate-pulse"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {isPast ? <BiCheckCircle className="text-base" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-semibold tracking-tight text-center ${
                      isCurrent ? "text-orange-400" : isPast ? "text-slate-200" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Rider GPS Map (when active) */}
        {isOutForDelivery && (
          <div className="rounded-3xl border border-orange-500/30 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                </span>
                <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <IoFlashOutline className="text-orange-400 text-base" />
                  Live Delivery Partner Tracking
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {riderLocation ? "GPS Connected" : "Connecting..."}
              </span>
            </div>

            <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-slate-800">
              {riderLocation && order.delivaryAddress?.latitude && order.delivaryAddress?.longitude ? (
                <UserOrderMap
                  riderLocation={riderLocation}
                  deliveryLocation={[order.delivaryAddress.latitude, order.delivaryAddress.longitude]}
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-2 bg-slate-950/80 text-xs text-slate-400">
                  <VscLoading className="animate-spin text-orange-400 text-xl" />
                  <span>Waiting for live coordinates from rider...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items & Address */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BiPackage className="text-orange-400 text-lg" />
                <h2 className="text-sm font-bold text-white">Dishes in Order</h2>
              </div>
              <div className="space-y-2.5">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">
                      {item.name} <span className="text-slate-500 font-bold ml-1">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-slate-200">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BiMapPin className="text-orange-400 text-lg" />
                <h2 className="text-sm font-bold text-white">Delivery Address</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {order.delivaryAddress?.formattedAddress}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono pt-1">
                <BiMobile className="text-orange-400" />
                <span>{order.delivaryAddress?.mobile}</span>
              </p>
            </div>
          </div>

          {/* Payment & Receipt Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BiCreditCard className="text-orange-400 text-lg" />
                <h2 className="text-sm font-bold text-white">Payment & Billing</h2>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-200">₹{order.subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Fee</span>
                  <span className={order.delivaryFee === 0 ? "text-emerald-400 font-bold uppercase text-[11px]" : "text-slate-200"}>
                    {order.delivaryFee === 0 ? "Free" : `₹${order.delivaryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Platform Handling Fee</span>
                  <span className="text-slate-200">₹{order.platfromFee}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Grand Total Paid</span>
                <span className="text-xl font-extrabold text-orange-400">₹{order.totalAmount}</span>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold text-slate-200 uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="font-bold text-emerald-400 uppercase">{order.paymentStatus}</span>
                </div>
                {order.createdAt && (
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <BiTime />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;