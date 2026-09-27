import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiCalendar, BiCheck, BiEdit, BiLogOut, BiMapPin, BiSave, BiX } from "react-icons/bi";
import { useAppData } from "../context/AppContext";
import { VscLoading } from "react-icons/vsc";

interface Props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const { setIsAuth, setUser } = useAppData();

  const toggleOpenStatus = async () => {
    try {
      setTogglingStatus(true);
      const { data } = await axios.put(
        `${restaurantService}/api/v1/restaurant/status`,
        { status: !isOpen },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success(data.message || "Store status updated");
      setIsOpen(data.restaurant.isOpen);
      onUpdate({ ...restaurant, isOpen: data.restaurant.isOpen });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingStatus(false);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/v1/restaurant/edit`,
        { name, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      onUpdate(data.restaurant);
      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const logoutHandler = async () => {
    try {
      await axios.put(
        `${restaurantService}/api/v1/restaurant/status`,
        { status: false },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch {
      // Proceed even if status update fails
    }

    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out from seller console");
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-xl overflow-hidden">
      {/* Cover Image Banner */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-orange-950/40 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Live Status Badge on Banner */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isOpen ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Accepting Orders
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Closed for Orders
            </span>
          )}
        </div>
      </div>

      {/* Profile Details & Controls */}
      <div className="p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {editMode ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Restaurant name"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-lg font-bold text-white focus:outline-none focus:border-orange-500"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                {restaurant.name}
              </h1>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <BiMapPin className="text-orange-400 text-sm shrink-0" />
              <span className="truncate max-w-lg">
                {restaurant.autoLocation?.formatedAddress || "Location coordinates detected"}
              </span>
            </div>
          </div>

          {/* Edit Mode Toggle for Seller */}
          {isSeller && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {editMode ? (
                <>
                  <button
                    onClick={saveChanges}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <VscLoading className="animate-spin text-sm" /> : <BiSave className="text-sm" />}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setName(restaurant.name);
                      setDescription(restaurant.description);
                      setEditMode(false);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <BiX className="text-sm" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all cursor-pointer"
                >
                  <BiEdit className="text-sm text-orange-400" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          {editMode ? (
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about your kitchen and specialties..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 resize-none"
            />
          ) : (
            <p className="text-xs text-slate-300 leading-relaxed">
              {restaurant.description || "Authentic culinary experience prepared fresh on order."}
            </p>
          )}
        </div>

        {/* Controls Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <BiCalendar className="text-sm" />
            <span>
              Partner since {new Date(restaurant.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isSeller && (
            <div className="flex items-center gap-3">
              {/* Open / Close Button */}
              <button
                onClick={toggleOpenStatus}
                disabled={togglingStatus}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
                  isOpen
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                }`}
              >
                {togglingStatus ? (
                  <VscLoading className="animate-spin text-sm" />
                ) : isOpen ? (
                  <BiX className="text-base" />
                ) : (
                  <BiCheck className="text-base" />
                )}
                <span>{isOpen ? "Close Kitchen" : "Open Kitchen"}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logoutHandler}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
              >
                <BiLogOut className="text-sm" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;