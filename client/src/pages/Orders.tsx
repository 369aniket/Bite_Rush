import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import { BiReceipt, BiShoppingBag, BiTime, BiCheckCircle } from "react-icons/bi";
import { IoFlashOutline } from "react-icons/io5";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "placed":
      return { label: "Order Placed", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    case "accepted":
    case "preparing":
      return { label: "Preparing in Kitchen", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    case "ready_for_rider":
    case "rider_assigned":
      return { label: "Rider Assigned", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    case "picked_up":
      return { label: "Out for Delivery", bg: "bg-orange-500/15 text-orange-400 border-orange-500/30 animate-pulse" };
    case "delivered":
      return { label: "Delivered", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    default:
      return { label: status.replaceAll("_", " "), bg: "bg-slate-800 text-slate-300 border-slate-700" };
  }
};

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/v1/order/my-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <BiReceipt className="text-4xl text-orange-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">No Orders Yet</h2>
        <p className="max-w-md text-sm text-slate-400 mb-6">
          You haven&apos;t placed any orders yet. Treat yourself to your favorite meals today!
        </p>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  const displayedOrders =
    activeTab === "active" ? activeOrders : activeTab === "completed" ? completedOrders : orders;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-8 relative">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">My Orders</h1>
            <p className="text-xs text-slate-400 mt-1">Track live orders and view past receipts</p>
          </div>

          {/* Segmented Filter Pills */}
          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900/80 p-1 backdrop-blur-md self-start sm:self-auto">
            {(
              [
                { id: "all", label: `All (${orders.length})` },
                { id: "active", label: `Active (${activeOrders.length})` },
                { id: "completed", label: `Past (${completedOrders.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        {displayedOrders.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
            No orders found under this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrders.map((order) => (
              <OrderCard key={order._id} order={order} onClick={() => navigate(`/order/${order._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

// Clean Sub-Component OrderCard
const OrderCard = ({ order, onClick }: { order: IOrder; onClick: () => void }) => {
  const badge = getStatusBadge(order.status);
  const isActive = ACTIVE_STATUSES.includes(order.status);

  return (
    <div
      onClick={onClick}
      className={`group rounded-3xl border p-5 backdrop-blur-xl transition-all cursor-pointer ${
        isActive
          ? "border-orange-500/30 bg-slate-900/80 hover:border-orange-500/60 hover:shadow-xl hover:shadow-orange-500/10"
          : "border-slate-800 bg-slate-900/50 hover:border-slate-700/80"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              isActive
                ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {isActive ? <IoFlashOutline className="text-xl" /> : <BiShoppingBag className="text-xl" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-wide">
                #{order._id.slice(-6).toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.bg}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <BiTime className="text-slate-500" />
              <span>
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent Order"}
              </span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Amount</p>
          <p className="text-base font-extrabold text-orange-400">₹{order.totalAmount}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-300 leading-relaxed">
          {order.items.map((item, i) => (
            <span key={i} className="inline-block mr-2">
              <span className="font-semibold text-slate-200">{item.name}</span>
              <span className="text-slate-500 ml-1">×{item.quantity}</span>
              {i < order.items.length - 1 && <span className="text-slate-600 ml-2">•</span>}
            </span>
          ))}
        </div>

        {isActive ? (
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-orange-500 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
            Track Live Order →
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 self-start sm:self-auto text-slate-400 group-hover:text-slate-200 text-xs">
            <BiCheckCircle className="text-emerald-400 text-sm" />
            <span>View Receipt →</span>
          </span>
        )}
      </div>
    </div>
  );
};