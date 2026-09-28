import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import {
  BiBell,
  BiUpload,
  BiNavigation,
  BiShieldQuarter,
  BiLogOut,
  BiCheckShield,
  BiPhone,
  BiTrendingUp,
} from "react-icons/bi";
import { IoFlame } from "react-icons/io5";
import audio from "../assets/msg-received.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import type { IOrder } from "../types";

interface IRiderAccount {
  _id: string;
  userId: string;
  picture: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  isAvailable: boolean;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

interface IRiderResponse {
  message: string;
  account: IRiderAccount;
}

const RiderDashboard = () => {
  const { user, setIsAuth, setUser } = useAppData();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<IRiderAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();

      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioUnlocked(true);
      toast.success("Sound notifications enabled");
    } catch (error) {
      toast.error("Tap again to enable sound");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    if (!socket) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      const t = setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 15000);
      timeouts.push(t);
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
      timeouts.forEach(clearTimeout);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get<IRiderResponse>(
        `${riderService}/api/v1/rider/my-profile`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setProfile(data?.account || null);
    } catch (error) {
      console.log(error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/v1/rider/order/current`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailability = async () => {
    if (!profile) return;

    if (!navigator.geolocation) {
      toast.error("Location access is required to go online");
      return;
    }
    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/v1/rider/toggle`,
          {
            isAvailable: !profile.isAvailable,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(
          profile.isAvailable
            ? "You are now offline"
            : "You are now online & receiving orders"
        );
        fetchProfile();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to update availability");
      } finally {
        setToggling(false);
      }
    });
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [aadharNumber, setAadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location access required");
      return;
    }
    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("aadharNumber", aadharNumber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", pos.coords.latitude.toString());
      formData.append("longitude", pos.coords.longitude.toString());
      if (image) {
        formData.append("file", image);
      }

      try {
        await axios.post(`${riderService}/api/v1/rider/new`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        toast.success("Rider profile submitted for review");
        fetchProfile();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Submission failed");
      } finally {
        setSubmitting(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#080c14]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full pointer-events-none" />
        </div>
        <p className="mt-4 text-slate-400 font-medium text-xs sm:text-sm">
          Loading Rider Pilot Console...
        </p>
      </div>
    );
  }

  // Document registration form if profile doesn't exist
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#080c14] py-10 px-4 text-slate-100 flex flex-col justify-center items-center">
        {/* Top Header */}
        <div className="w-full max-w-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-md shadow-orange-500/25">
              <IoFlame className="text-xl text-white" />
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              BiteRush Rider
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-semibold text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <BiLogOut className="text-sm" /> Sign Out
          </button>
        </div>

        <div className="w-full max-w-lg rounded-3xl bg-slate-900/70 border border-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-md shadow-orange-500/10 shrink-0">
              <BiShieldQuarter className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white">Join as Delivery Partner</h1>
              <p className="text-xs text-slate-400">
                Deliver food with BiteRush and earn on every trip
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <BiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="number"
                  placeholder="10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/60 border border-slate-700/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Aadhar Card Number *
              </label>
              <input
                type="text"
                placeholder="12-digit Aadhar number"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                className="w-full rounded-xl bg-slate-800/60 border border-slate-700/80 px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Driving License Number *
              </label>
              <input
                type="text"
                placeholder="Valid Driving License number"
                value={drivingLicenseNumber}
                onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                className="w-full rounded-xl bg-slate-800/60 border border-slate-700/80 px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Profile Photo / Selfie *
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-700/80 hover:border-orange-500/50 bg-slate-800/30 cursor-pointer transition">
                <BiUpload className="text-xl text-orange-400 shrink-0" />
                <span className="text-xs text-slate-300 truncate">
                  {image ? image.name : "Upload Photo (JPG, PNG)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setImage(
                      e.target.files && e.target.files[0] ? e.target.files[0] : null
                    )
                  }
                />
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-xs sm:text-sm text-white shadow-xl shadow-orange-500/25 active:scale-[0.98] transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting Documents..." : "Submit Documents for Review"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] pb-20 text-slate-100">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-md shadow-orange-500/25">
              <IoFlame className="text-xl text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                BiteRush Pilot
              </span>
              <span className="block text-[10px] text-slate-400 font-medium">
                Rider Operations Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!audioUnlocked && (
              <button
                onClick={unlockAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 text-xs font-semibold transition cursor-pointer"
              >
                <BiBell className="animate-bounce" /> Audio On
              </button>
            )}

            {/* Show Earning Dashboard */}
            <button
              onClick={() => navigate("/my-earnings")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <BiTrendingUp className="text-sm" />
              <span>Earnings</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-semibold text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <BiLogOut className="text-sm" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Rider Status Profile Card */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={profile.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-2 border-orange-500/40 shadow-xl shadow-orange-500/20"
              />
              <span
                className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-slate-900 ${
                  profile.isAvailable && !currentOrder
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500"
                }`}
              />
            </div>

            <h2 className="text-lg font-bold text-white mt-3">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono">{profile.phoneNumber}</p>

            {/* Badges */}
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  profile.isVerified
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {profile.isVerified ? (
                  <>
                    <BiCheckShield className="text-sm" /> Verified Pilot
                  </>
                ) : (
                  "⏳ Review In Progress"
                )}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  profile.isAvailable && !currentOrder
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {profile.isAvailable && !currentOrder ? "● Online" : "○ Offline"}
              </span>
            </div>
          </div>

          {/* Hotspot Info */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800/80 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
            <BiNavigation className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <span>
              Stay within 500m of dense restaurant clusters to receive optimal dispatch orders and priority routing.
            </span>
          </div>

          {/* Earnings Quick Access Card */}
          <button
            onClick={() => navigate("/my-earnings")}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-800/60 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 text-xs text-slate-300 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-base shrink-0">
                <BiTrendingUp />
              </div>
              <div className="text-left">
                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Earnings & Delivery History
                </p>
                <p className="text-[11px] text-slate-400">
                  Track trip payouts & incentives
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg group-hover:bg-emerald-500/20 transition">
              View &rarr;
            </span>
          </button>

          {/* Online / Offline Toggle Button */}
          {profile.isVerified && !currentOrder && (
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-xl transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                profile.isAvailable
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
              }`}
            >
              {toggling
                ? "Updating Pilot State..."
                : profile.isAvailable
                ? "Go Offline"
                : "Go Online & Receive Trips"}
            </button>
          )}
        </div>

        {/* Audio notification prompt if not yet unlocked */}
        {!audioUnlocked && (
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between gap-3 shadow-lg shadow-orange-500/5">
            <div className="flex items-center gap-3">
              <BiBell className="w-6 h-6 text-orange-400 animate-bounce shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Enable Audio Alerts</p>
                <p className="text-[11px] text-slate-400">
                  Hear a chime when a delivery order is dispatched
                </p>
              </div>
            </div>
            <button
              onClick={unlockAudio}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
            >
              Enable
            </button>
          </div>
        )}

        {/* Incoming Orders Alert List */}
        {profile.isAvailable && incomingOrders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
              Incoming Dispatch Requests ({incomingOrders.length})
            </h3>

            {incomingOrders.map((id) => (
              <RiderOrderRequest
                key={id}
                orderId={id}
                onAccepted={() => {
                  fetchProfile();
                  fetchCurrentOrder();
                }}
              />
            ))}
          </div>
        )}

        {/* Active Trip Details & Navigation Map */}
        {currentOrder && (
          <div className="space-y-5">
            <RiderCurrentOrder
              order={currentOrder}
              onStatusUpdate={fetchCurrentOrder}
            />
            <RiderOrderMap order={currentOrder} />
          </div>
        )}
      </main>
    </div>
  );
};

export default RiderDashboard;