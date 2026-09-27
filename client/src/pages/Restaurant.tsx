import { useEffect, useState } from "react";
import type { IMenu, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItem from "../components/MenuItem";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import { BiFoodMenu, BiPlusCircle, BiBarChartAlt2 } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");
  const [menuItem, setMenuItem] = useState<IMenu[]>([]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/v1/restaurant/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/v1/item/all/${restaurantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMenuItem(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center space-y-3">
        <VscLoading className="animate-spin text-orange-400 text-3xl" />
        <p className="text-xs text-slate-400 font-medium">Loading your restaurant console...</p>
      </div>
    );
  }

  if (!restaurant) {
    return <AddRestaurant fetchRestaurant={fetchRestaurant} />;
  }

  const tabs: { key: SellerTab; label: string; icon: React.ReactNode }[] = [
    { key: "menu", label: "Menu Catalog", icon: <BiFoodMenu className="text-base" /> },
    { key: "add-item", label: "Add New Dish", icon: <BiPlusCircle className="text-base" /> },
    { key: "sales", label: "Analytics & Sales", icon: <BiBarChartAlt2 className="text-base" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-10 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-6xl space-y-6 relative z-10">
        {/* Restaurant Profile Banner & Quick Status */}
        <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={true} />

        {/* Live Incoming & In-Kitchen Orders */}
        <RestaurantOrders restaurantId={restaurant._id} />

        {/* Seller Navigation Tabs & Panes */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl overflow-hidden">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-800/80 bg-slate-950/40 p-2 gap-2">
            {tabs.map((t) => {
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-3 px-5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="p-6 sm:p-8">
            {tab === "menu" && (
              <MenuItem
                itmes={menuItem}
                onItemDeleted={() => fetchMenuItems(restaurant._id)}
                isSeller={true}
              />
            )}
            {tab === "add-item" && (
              <AddMenuItem
                restaurantId={restaurant._id}
                onComplete={() => {
                  fetchMenuItems(restaurant._id);
                  setTab("menu");
                }}
              />
            )}
            {tab === "sales" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-10 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <BiBarChartAlt2 className="text-2xl" />
                </div>
                <h3 className="font-bold text-white text-base">Sales & Performance Analytics</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Detailed revenue reports, popular dishes, and peak order hours telemetry will be available soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurant;