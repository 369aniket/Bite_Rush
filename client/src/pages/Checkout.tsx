import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenu, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiMobile, BiMapPin, BiStore, BiCheckShield, BiPlus } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import { SiRazorpay, SiStripe } from "react-icons/si";
import { loadStripe } from "@stripe/stripe-js";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(`${restaurantService}/api/v1/address/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const list: Address[] = data.addresses || [];
        setAddresses(list);
        if (list.length > 0 && !selectedAddressId) {
          setSelectedAddressId(list[0]._id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 mb-6">Add dishes to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/v1/order/new`,
        { paymentMethod, addressId: selectedAddressId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      return data;
    } catch {
      toast.error("Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  // Razorpay integration
  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsService}/api/v1/payment/create`, { orderId });
      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "BiteRush",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/v1/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment Successful!");
            navigate(`/paymentsuccess/${response.razorpay_payment_id}`);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#f97316",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment failed. Please refresh and try again.");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  // Stripe integration
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId } = order;
      try {
        await stripePromise;
        const { data } = await axios.post(`${utilsService}/api/v1/payment/stripe/create`, { orderId });

        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error("Failed to create Stripe checkout session");
        }
      } catch {
        toast.error("Stripe payment initiation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-5xl space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Checkout</h1>
          <p className="text-xs text-slate-400 mt-1">Review your address, order summary, and choose payment method</p>
        </div>

        {/* Restaurant Header */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <BiStore className="text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-white truncate">{restaurant.name}</h2>
            <p className="text-xs text-slate-400 truncate">{restaurant.autoLocation?.formatedAddress}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Address Selection & Payment CTA */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Selection */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BiMapPin className="text-orange-400 text-lg" />
                  <h3 className="text-sm font-bold text-white">Delivery Address</h3>
                </div>
                <button
                  onClick={() => navigate("/address")}
                  className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                >
                  <BiPlus />
                  <span>Add New</span>
                </button>
              </div>

              {loadingAddress ? (
                <div className="flex items-center justify-center py-6 text-xs text-slate-400 gap-2">
                  <VscLoading className="animate-spin text-orange-400 text-base" />
                  <span>Loading delivery addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-slate-400">No saved addresses found.</p>
                  <button
                    onClick={() => navigate("/address")}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? "border-orange-500 bg-orange-500/10 shadow-md shadow-orange-500/5"
                          : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-orange-500"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                      <div className="space-y-1 text-xs flex-1">
                        <p className="font-semibold text-slate-200 leading-relaxed">{addr.formattedAddress}</p>
                        <p className="text-slate-400 flex items-center gap-1">
                          <BiMobile className="text-slate-400" />
                          <span className="font-mono text-slate-300">{addr.mobile}</span>
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BiCreditCard className="text-orange-400 text-lg" />
                <h3 className="text-sm font-bold text-white">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Razorpay Button */}
                <button
                  disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
                  onClick={payWithRazorpay}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 p-4 text-xs font-bold text-blue-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/5 active:scale-[0.98]"
                >
                  {loadingRazorpay ? (
                    <VscLoading className="animate-spin text-base" />
                  ) : (
                    <SiRazorpay className="text-xl text-blue-400" />
                  )}
                  <span>Pay with Razorpay / UPI</span>
                </button>

                {/* Stripe Button */}
                <button
                  disabled={!selectedAddressId || loadingStripe || creatingOrder}
                  onClick={payWithStripe}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 p-4 text-xs font-bold text-indigo-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/5 active:scale-[0.98]"
                >
                  {loadingStripe ? (
                    <VscLoading className="animate-spin text-base" />
                  ) : (
                    <SiStripe className="text-xl text-indigo-400" />
                  )}
                  <span>Pay with Stripe / Cards</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-500">
                <BiCheckShield className="text-emerald-400 text-sm" />
                <span>256-bit encrypted secure checkout. Instant refund policy.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">Order Summary</h2>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {cart.map((cartItem: ICart) => {
                  const item = cartItem.itemId as IMenu;
                  return (
                    <div key={cartItem._id} className="flex justify-between text-xs py-1">
                      <span className="text-slate-300 truncate max-w-[160px]">
                        {item.name} <span className="text-slate-500">× {cartItem.quantity}</span>
                      </span>
                      <span className="font-semibold text-slate-200">₹{item.price * cartItem.quantity}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Items ({quantity})</span>
                  <span>₹{subTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-emerald-400 font-bold uppercase text-[11px]" : ""}>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Platform Handling Fee</span>
                  <span>₹{platformFee}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Amount</span>
                <span className="text-xl font-extrabold text-orange-400">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;