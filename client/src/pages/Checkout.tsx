import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenu, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader, BiMobile } from "react-icons/bi";
import { loadStripe } from '@stripe/stripe-js'

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const [loadingAddress, setLoadingAddress] = useState(true)
  const [loadingRazorpay, setLoadingRazorpay] = useState(false)
  const [loadingStripe, setLoadingStripe] = useState(false)

  const [creatingOrder, setCreatingOrder] = useState(false)

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false)
        return;
      }

      try {
        const { data } = await axios.get(`${restaurantService}/api/v1/address/all`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })


        setAddresses(data.addresses || [])
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false)
      }
    }

    fetchAddresses();
  }, [cart])

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] justify-center items-center">
        <p className="text-gray-500 text-lg font-semibold">Your cart is Empty</p>
      </div>
    )
  }




  const restaurant = cart[0].restaurantId as IRestaurant

  const deliveryFee = subTotal < 250 ? 49 : 0
  const platfromFee = 7;
  const grandTotal = subTotal + deliveryFee + platfromFee

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return;

    setCreatingOrder(true)
    try {
      const { data } = await axios.post(`${restaurantService}/api/v1/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId
        }, {
        headers:
        {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      return data;

    } catch (error) {
      toast.error("Failed to create order")
    } finally {
      setCreatingOrder(false)
    }
  }
// Razorpay integration

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true)

      const order = await createOrder("razorpay")

      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/v1/payment/create`, { orderId })

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
            await axios.post(`${utilsService}/api/v1/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              }
            )

            toast.success("Payment Successfull")
            navigate('/paymentsuccess/' + response.razorpay_payment_id)
          } catch (error) {
            toast.error("Payment verification failed")
          }
        },
        theme: {
          color: "#f97316"
        }
      }
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed Please Refresh the Page")
    } finally {
      setLoadingRazorpay(false)
    }
  }


  // Stripe integration

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder('stripe')
      if (!order) {
        return;
      }

      const {orderId } = order

      try {
        const stripe = await stripePromise;
        const { data } = await axios.post(`${utilsService}/api/v1/payment/stripe/create`,{orderId})

        if(data.url){
          window.location.href = data.url
        }else{
          toast.error("failed to create payment session")
        }
      } catch (error) {
        toast.error('Payment Failed')
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed")
    } finally {
      setLoadingStripe(false)
    }
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="rounded-xl p-4 shadow-sm shadow-gray-800">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">{restaurant.autoLocation.formatedAddress}</p>
      </div>

      <div className="p-4 rounded-xl shadow-sm shadow-gray-800 space-y-3">
        <h3 className="font-semibold">Delivery Address</h3>
        {
          loadingAddress ? <p className="text-sm text-gray-500">Loading Address...</p> : addresses.length === 0 ? <p className="text-sm text-gray-500 ">No Address Found</p> : addresses.map((addr) => (
            <label
              key={addr._id}
              className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition 
                ${selectedAddressId === addr._id ? "border-orange-500" : "hover:border-orange-600"
                }`}>
              <input type="radio" checked={selectedAddressId === addr._id} onChange={() => setSelectedAddressId(addr._id)} />

              <div>
                <p className="text-sm font-medium">{addr.formattedAddress}</p>
                <p className="text-xs text-gray-500 flex items-center"><BiMobile size={16} />{addr.mobile}</p>

              </div>
            </label>
          ))
        }
      </div>

      <div className="p-4 rounded-xl shadow-sm shadow-gray-800 space-y-4">
        <h3 className="font-semibold">Order Summary</h3>

        {
          cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenu
            return (
              <div className="flex justify-between text-sm" key={cartItem._id}>
                <span>{item.name} x {cartItem.quantity}</span>
                <span>₹{item.price * cartItem.quantity}</span>
              </div>
            )
          })
        }
        <hr />
        <div className="flex justify-between text-sm">
          <span>Items ({quantity})</span>
          <span>₹{subTotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Platform Fee</span>
          <span>₹{platfromFee}</span>
        </div>

        {
          subTotal < 250 && <p className="text-xs text-gray-500">Add item worth ₹ {250 - subTotal} more to get free delivery</p>
        }


        <div className="flex justify-between text-base font-semibold border-t border-gray-500 pt-2 mt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <div className="rounded-xl p-4 shadow-sm shadow-gray-800 space-y-3">
        <h3 className="font-semibold">Patment Method</h3>
        <button
          disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
          onClick={() => payWithRazorpay()}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-blue-500 px-2 py-2 rounded-lg hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {
            loadingRazorpay ? (
              <BiLoader size={18} className="animate-spin" />
            ) : (<BiCreditCard size={18} />)
          }
          Pay With Razorpay
        </button>

            <button
          disabled={!selectedAddressId || loadingStripe || creatingOrder}
          onClick={() => payWithStripe()}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-gray-800 px-2 py-2 rounded-lg hover:bg-gray-900 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {
            loadingRazorpay ? (
              <BiLoader size={18} className="animate-spin" />
            ) : (<BiCreditCard size={18} />)
          }
          Pay With Stripe
        </button>
      </div>
    </div>
  )
}

export default Checkout