import { useParams, Link } from "react-router-dom";
import type { IMenu, IRestaurant } from "../types";
import { useEffect, useState } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItem from "../components/MenuItem";
import { BiArrowBack, BiDish, BiShoppingBag, BiRightArrowAlt } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

const RestaurantPage = () => {
  const { id } = useParams();
  const { quantity, subTotal } = useAppData();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItem, setMenuItem] = useState<IMenu[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/v1/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/v1/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItem(data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-[75vh] items-center justify-center bg-[#080c14]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full pointer-events-none" />
        </div>
        <p className="mt-4 text-slate-400 font-medium text-xs sm:text-sm">
          Loading restaurant and delicious menus...
        </p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col min-h-[75vh] items-center justify-center bg-[#080c14] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4 shadow-lg shadow-orange-500/10">
          <BiDish className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Restaurant Not Found</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 mb-6 max-w-sm">
          The restaurant you are looking for may have been closed or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition cursor-pointer"
        >
          <BiArrowBack /> Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] pb-28 text-slate-100">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-md sticky top-[61px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-orange-400 transition-colors"
          >
            <BiArrowBack className="w-4 h-4" /> Back to Restaurants
          </Link>
          <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            {menuItem.length} Dishes Listed
          </span>
        </div>
      </div>

      {/* Main 12-Column Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Left Sidebar: Restaurant Profile (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <RestaurantProfile
              restaurant={restaurant}
              onUpdate={setRestaurant}
              isSeller={false}
            />
          </div>

          {/* Right Column: Menu Catalog (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Recommended Dishes
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Freshly prepared with authentic ingredients and fast kitchen dispatch
                </p>
              </div>
            </div>

            {menuItem.length > 0 ? (
              <MenuItem
                itmes={menuItem}
                isSeller={false}
                onItemDeleted={() => {}}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-3xl bg-slate-900/30 border border-slate-800/80 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
                  <BiDish className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-200 text-base">No dishes listed yet</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm">
                  This restaurant hasn't uploaded dishes yet. Please check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Seamless Checkout */}
      {quantity > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Link
            to="/cart"
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-2xl shadow-orange-500/40 hover:from-orange-500 hover:to-amber-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-orange-400/30 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 text-white">
                <BiShoppingBag className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-100">
                  {quantity} {quantity === 1 ? "Item" : "Items"} in Cart
                </p>
                <p className="text-base font-black font-mono leading-none mt-0.5">
                  ₹{subTotal.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-black/20 hover:bg-black/30 px-3.5 py-2 rounded-xl transition">
              <span>View Cart</span>
              <BiRightArrowAlt className="text-base" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;