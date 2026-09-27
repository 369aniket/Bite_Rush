import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenu, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiMinus, BiPlus, BiShoppingBag, BiMapPin } from "react-icons/bi";
import { IoSparkles } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";
import { TbTrash } from "react-icons/tb";

const CartPage = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
            <BiShoppingBag className="text-4xl text-orange-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Your cart is empty</h2>
        <p className="max-w-md text-sm text-slate-400 mb-6">
          Looks like you haven&apos;t added any delicious meals yet. Discover top restaurants near you.
        </p>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;
  const progressPercent = Math.min(100, Math.round((subTotal / 250) * 100));

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/v1/cart/inc`,
        { itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchCart();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/v1/cart/dec`,
        { itemId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await fetchCart();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear your cart?");
    if (!confirm) return;

    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/v1/cart/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCart();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-10 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-5xl space-y-6 relative z-10">
        {/* Restaurant Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-400">Ordering From</p>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">{restaurant.name}</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <BiMapPin className="text-orange-400 shrink-0" />
              <span className="truncate max-w-md">{restaurant.autoLocation?.formatedAddress}</span>
            </div>
          </div>
          <button
            onClick={clearCart}
            disabled={clearingCart}
            className="self-start sm:self-center flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-400 transition-all cursor-pointer disabled:opacity-50"
          >
            {clearingCart ? <VscLoading className="animate-spin text-sm" /> : <TbTrash className="text-sm" />}
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Free delivery tracker */}
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-orange-400">
              <IoSparkles className="text-base" />
              {subTotal >= 250 ? "Unlocked Free Delivery!" : `Add ₹${250 - subTotal} more for FREE Delivery`}
            </span>
            <span className="text-slate-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Grid: Items and Bill Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((cartItem: ICart) => {
              const item = cartItem.itemId as IMenu;
              const isLoading = loadingItemId === item._id;

              return (
                <div
                  key={item._id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md transition-all hover:border-slate-700/80"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-white truncate">{item.name}</h3>
                    <p className="text-xs text-orange-400 font-bold mt-0.5">₹{item.price}</p>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-2 py-1 shadow-inner">
                    <button
                      className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
                      disabled={isLoading}
                      onClick={() => decreaseQty(item._id)}
                    >
                      {isLoading ? <VscLoading size={14} className="animate-spin text-orange-400" /> : <BiMinus size={14} />}
                    </button>
                    <span className="font-bold text-xs sm:text-sm text-white w-5 text-center">{cartItem.quantity}</span>
                    <button
                      className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
                      disabled={isLoading}
                      onClick={() => increaseQty(item._id)}
                    >
                      {isLoading ? <VscLoading size={14} className="animate-spin text-orange-400" /> : <BiPlus size={14} />}
                    </button>
                  </div>

                  <p className="w-20 text-right font-bold text-sm text-white">₹{item.price * cartItem.quantity}</p>
                </div>
              );
            })}
          </div>

          {/* Bill Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">Bill Details</h2>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Items</span>
                  <span className="font-medium text-slate-200">{quantity}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Item Subtotal</span>
                  <span className="font-medium text-slate-200">₹{subTotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Partner Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Free</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Platform Handling Fee</span>
                  <span className="font-medium text-slate-200">₹{platformFee}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">To Pay</span>
                  <span className="text-xl font-extrabold text-orange-400">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                disabled={!restaurant.isOpen}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-lg active:scale-[0.98] ${
                  !restaurant.isOpen
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25 cursor-pointer"
                }`}
              >
                {!restaurant.isOpen ? "Restaurant Currently Closed" : "Proceed to Checkout →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;