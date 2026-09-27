import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/msg-received.mp3";
import { restaurantService } from "../main";
import axios from "axios";
import { BiBell, BiCheckCircle } from "react-icons/bi";
import OrderCart from "./OrderCart";
import { VscLoading } from "react-icons/vsc";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.load();
  }, []);

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          setAudioUnlocked(true);
        })
        .catch((err) => {
          console.error("Failed to unlock audio:", err);
        });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/v1/order/restaurant/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const onNewOrder = () => {
      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error("Audio playback error: ", err);
        });
      }
      fetchOrders();
    };

    socket.on("order:new", onNewOrder);

    return () => {
      socket.off("order:new", onNewOrder);
    };
  }, [socket, audioUnlocked]);

  // Rider update
  useEffect(() => {
    if (!socket) return;

    const onUpdateOrder = () => {
      fetchOrders();
    };

    socket.on("order:rider_assigned", onUpdateOrder);

    return () => {
      socket.off("order:rider_assigned", onUpdateOrder);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
        <VscLoading className="animate-spin text-orange-400 text-2xl" />
        <span className="text-xs">Connecting to live kitchen feed...</span>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="space-y-6">
      {/* Audio Chime Notification Banner */}
      {!audioUnlocked && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <BiBell className="text-xl animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-white">Enable Sound Alerts</p>
              <p className="text-xs text-slate-400">Play an audible chime when customers place new orders</p>
            </div>
          </div>

          <button
            onClick={unlockAudio}
            className="self-start sm:self-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            Enable Audio Chime
          </button>
        </div>
      )}

      {/* Active Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
            <h2 className="text-base font-bold text-white">Live Kitchen Orders</h2>
          </div>
          <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-xs font-bold text-orange-400">
            {activeOrders.length} In Progress
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
            No active orders right now. New incoming requests will appear here automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map((order) => (
              <OrderCart key={order._id} order={order} onStatusUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Orders */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-2">
            <BiCheckCircle className="text-emerald-400 text-lg" />
            <h2 className="text-base font-bold text-white">Completed Orders</h2>
          </div>
          <span className="text-xs text-slate-400">{completedOrders.length} delivered</span>
        </div>

        {completedOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
            No past completed orders today.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedOrders.map((order) => (
              <OrderCart key={order._id} order={order} onStatusUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;