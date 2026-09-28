import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { riderService } from "../main";
import {
    BiArrowBack,
    BiCalendar,
    BiCheckCircle,
    BiDollarCircle,
    BiMapPin,
    BiNavigation,
    BiRefresh,
    BiTrendingUp,
} from "react-icons/bi";
import { FaMotorcycle } from "react-icons/fa";
import type { IOrder } from "../types";

interface IEarningsData {
    totalEarnings: number;
    todayEarnings: number;
    weeklyEarnings: number;
    totalDeliveries: number;
    totalDistance: number;
    orders: IOrder[];
}

const RiderEarnings = () => {
    const [data, setData] = useState<IEarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchEarnings = async () => {
        try {
            setRefreshing(true);
            const res = await axios.get(`${riderService}/api/v1/rider/earnings`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch rider earnings", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    const formatDate = (dateString?: Date | string) => {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-[#080c14] pb-24 text-slate-100">
            {/* Top Sticky Header */}
            <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080c14]/85 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                        <BiArrowBack className="text-base" />
                        <span>Back to Pilot Console</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchEarnings}
                            disabled={refreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer disabled:opacity-50"
                        >
                            <BiRefresh className={`text-base ${refreshing ? "animate-spin text-orange-400" : ""}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
                {/* Title & Description */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                            <BiDollarCircle className="text-xs" /> Payout Summary
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Pilot Earnings & Trips
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Track your delivery earnings, trip incentives, and payout performance history.
                    </p>
                </div>

                {/* Loading Skeletons */}
                {loading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 animate-pulse space-y-3"
                                >
                                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                                    <div className="h-8 bg-slate-800 rounded w-3/4" />
                                </div>
                            ))}
                        </div>

                        <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 animate-pulse space-y-4">
                            <div className="h-5 bg-slate-800 rounded w-1/4" />
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-slate-800/60 rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* KPI Metrics Cards Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Earnings */}
                            <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-500/30 p-5 shadow-xl backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                    <BiTrendingUp className="text-sm" /> Total Earned
                                </span>
                                <p className="text-2xl sm:text-3xl font-black font-mono text-white mt-2">
                                    ₹{(data?.totalEarnings || 0).toFixed(0)}
                                </p>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Lifetime delivery payout
                                </span>
                            </div>

                            {/* Today's Earnings */}
                            <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 shadow-xl backdrop-blur-xl relative overflow-hidden">
                                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                                    <BiCalendar className="text-sm" /> Today's Shift
                                </span>
                                <p className="text-2xl sm:text-3xl font-black font-mono text-white mt-2">
                                    ₹{(data?.todayEarnings || 0).toFixed(0)}
                                </p>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Earned since 12:00 AM
                                </span>
                            </div>

                            {/* Weekly Earnings */}
                            <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 shadow-xl backdrop-blur-xl relative overflow-hidden">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                    <BiTrendingUp className="text-sm" /> Last 7 Days
                                </span>
                                <p className="text-2xl sm:text-3xl font-black font-mono text-white mt-2">
                                    ₹{(data?.weeklyEarnings || 0).toFixed(0)}
                                </p>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Weekly rolling total
                                </span>
                            </div>

                            {/* Completed Deliveries */}
                            <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-5 shadow-xl backdrop-blur-xl relative overflow-hidden">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                                    <FaMotorcycle className="text-xs" /> Completed Trips
                                </span>
                                <p className="text-2xl sm:text-3xl font-black font-mono text-white mt-2">
                                    {data?.totalDeliveries || 0}
                                </p>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    {data?.totalDistance || 0} km travelled
                                </span>
                            </div>
                        </div>

                        {/* Trip Ledger & Delivery History */}
                        <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-xl space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                        <BiCheckCircle className="text-emerald-400 text-xl" /> Delivered Trip Records
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Itemized trip earnings and delivery confirmation logs
                                    </p>
                                </div>

                                {data?.orders && data.orders.length > 0 && (
                                    <span className="text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full self-start sm:self-auto">
                                        {data.orders.length} {data.orders.length === 1 ? "Delivery" : "Deliveries"}
                                    </span>
                                )}
                            </div>

                            {/* Orders List */}
                            {data?.orders && data.orders.length > 0 ? (
                                <div className="space-y-3">
                                    {data.orders.map((order) => (
                                        <div
                                            key={order._id}
                                            className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 sm:p-5 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-slate-300">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase">
                                                        Delivered
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                                        <BiCalendar /> {formatDate(order.updatedAt || order.createdAt)}
                                                    </span>
                                                </div>

                                                <h3 className="text-sm sm:text-base font-bold text-white">
                                                    {order.restaurantName || "Restaurant Pickup"}
                                                </h3>

                                                <p className="text-xs text-slate-400 flex items-center gap-1.5 max-w-md truncate">
                                                    <BiMapPin className="text-orange-400 shrink-0 text-sm" />
                                                    <span className="truncate">
                                                        {order.delivaryAddress?.formattedAddress || "Customer Delivery Address"}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Right Details: Distance & Amount */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 shrink-0">
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <BiNavigation className="text-orange-400" />
                                                    <span>{order.distance ? `${order.distance} km` : "Standard route"}</span>
                                                </div>

                                                <div className="flex items-baseline gap-1 mt-1">
                                                    <span className="text-xs font-semibold text-emerald-400">+</span>
                                                    <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                                                        ₹{(order.riderAmount || 0).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 shadow-lg shadow-orange-500/10">
                                        <FaMotorcycle className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-base font-bold text-white">No Completed Deliveries Yet</h3>
                                    <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-sm">
                                        Once you switch online in the Pilot Console and complete delivery trips, your earnings and payouts will appear right here!
                                    </p>
                                    <button
                                        onClick={() => navigate("/")}
                                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition cursor-pointer"
                                    >
                                        Go to Pilot Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default RiderEarnings;