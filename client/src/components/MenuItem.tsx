import { useState } from "react";
import type { IMenu } from "../types";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { BiTrash, BiPlus } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  itmes: IMenu[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItem = ({ itmes, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { fetchCart } = useAppData();

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this dish?");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/v1/item/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Dish deleted successfully");
      onItemDeleted();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete dish");
    }
  };

  const toggleAvailability = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/v1/item/status/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(data.message || "Dish status updated");
      onItemDeleted();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.post(
        `${restaurantService}/api/v1/cart/add`,
        { restaurantId, itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success(data.message || "Added to cart!");
      await fetchCart();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoadingItemId(null);
    }
  };

  if (!itmes || itmes.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400">
        No dishes available in this menu yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {itmes.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            key={item._id}
            className={`group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-slate-700/80 hover:shadow-lg hover:shadow-orange-500/5 ${
              !item.isAvailable ? "opacity-60" : ""
            }`}
          >
            <div className="space-y-3">
              {/* Dish Image */}
              <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-950">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    !item.isAvailable ? "grayscale brightness-75" : ""
                  }`}
                />
                {!item.isAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs font-bold uppercase tracking-wider text-rose-300 backdrop-blur-xs">
                    Currently Unavailable
                  </span>
                )}
              </div>

              {/* Dish Info */}
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-white truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Row: Price & Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-base font-extrabold text-orange-400">₹{item.price}</span>

              {isSeller ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleAvailability(item._id)}
                    title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                  >
                    {item.isAvailable ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    title="Delete Dish"
                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    <BiTrash size={15} />
                  </button>
                </div>
              ) : (
                <button
                  disabled={!item.isAvailable || isLoading}
                  onClick={() => addToCart(item.restaurantId, item._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                    !item.isAvailable || isLoading
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20"
                  }`}
                >
                  {isLoading ? (
                    <VscLoading size={14} className="animate-spin" />
                  ) : (
                    <BiPlus size={16} />
                  )}
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItem;