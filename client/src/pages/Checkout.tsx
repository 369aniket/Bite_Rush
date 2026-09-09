import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { IRestaurant } from "../types";
import toast from "react-hot-toast";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData()
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


  const navigate = useNavigate()

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
    }finally{
      setLoadingRazorpay(false)
    }
  }

  const payWithStripe = async ()=> {
    try {
      setLoadingStripe(true);
      const order = await createOrder('stripe')
      if(!order){
        return ;
      }

      console.log("Stripe Checkout", order);
    } catch (error) {
      console.log(error);
      toast.error("Payment failed")
    }finally{
      setLoadingStripe(false)
    }
  }
  return (
    <div>Checkout</div>
  )
}

export default Checkout