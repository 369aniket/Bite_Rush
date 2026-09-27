import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { BiDish, BiSearch, BiSliderAlt } from "react-icons/bi";
import { FaFire, FaBolt, FaMotorcycle } from "react-icons/fa";

const CATEGORIES = [
  { label: "All", icon: "🔥" },
  { label: "Burgers", icon: "🍔" },
  { label: "Pizzas", icon: "🍕" },
  { label: "Biryani", icon: "🍛" },
  { label: "Asian", icon: "🍜" },
  { label: "Shakes", icon: "🥤" },
  { label: "Desserts", icon: "🍰" },
];

const Home = () => {
  const { location, city } = useAppData();
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState("All");

  const [restaurant, setRestaurant] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return +(R * c).toFixed(2);
  };

  const fetchRestaurant = async () => {
    if (!location || !location.latitude || !location.longitude) {
      return;
    }

    const querySearch = search || (activeCategory !== "All" ? activeCategory : "");

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/v1/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search: querySearch,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [location, search, activeCategory]);

  return (
    <div className="min-h-screen bg-[#080c14] pb-24 text-slate-100">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-6 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Glow Spheres */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900/90 to-slate-950 border border-orange-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <FaFire className="w-3.5 h-3.5 animate-pulse text-orange-400" /> Fastest Delivery in Town
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                <FaBolt className="text-amber-400 text-[10px]" /> ~20 min arrival
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Crave it? <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-amber-200 bg-clip-text text-transparent">Bite it.</span> Rush it.
            </h1>

            <p className="mt-3 text-slate-300 text-sm sm:text-base font-normal max-w-lg leading-relaxed">
              Explore the finest restaurants, top-rated delicacies, and quick gourmet bites around you with real-time GPS telemetry.
            </p>
          </div>

          {/* Quick Category Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BiSliderAlt className="text-orange-400 text-sm" /> Browse by Cuisines
              </span>
              {activeCategory !== "All" && (
                <button
                  onClick={() => setActiveCategory("All")}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeCategory === cat.label
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Popular Restaurants {city ? `in ${city}` : "Near You"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified dining spots delivering to your current location
            </p>
          </div>

          <div className="flex items-center gap-2">
            {restaurant.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-bold">
                <FaMotorcycle className="text-xs" /> {restaurant.length} spots open
              </span>
            )}
          </div>
        </div>

        {/* Loading State with Shimmer Skeletons */}
        {loading || !location ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-slate-900/60 border border-slate-800/80 overflow-hidden animate-pulse flex flex-col"
              >
                <div className="h-48 bg-slate-800/80" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                  </div>
                  <div className="pt-3 border-t border-slate-800/50 flex justify-between">
                    <div className="h-3 bg-slate-800 rounded w-1/4" />
                    <div className="h-6 w-6 rounded-full bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurant.length > 0 ? (
          /* Restaurant Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {restaurant.map((res) => {
              const [resLng, resLat] = res.autoLocation.coordinates;
              const distance = getDistanceKm(
                location.latitude,
                location.longitude,
                resLat,
                resLng
              );

              return (
                <RestaurantCard
                  key={res._id}
                  id={res._id}
                  name={res.name}
                  image={res.image ?? ""}
                  distance={`${distance}`}
                  isOpen={res.isOpen}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl bg-slate-900/30 border border-slate-800/80 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
              {search || activeCategory !== "All" ? <BiSearch className="w-8 h-8" /> : <BiDish className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-white">No restaurants found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              {search || activeCategory !== "All"
                ? `We couldn't find any spots matching "${search || activeCategory}". Try searching for something else.`
                : "No restaurants currently available within your delivery radius. Please check back soon!"}
            </p>
            {(search || activeCategory !== "All") && (
              <button
                onClick={() => setActiveCategory("All")}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;