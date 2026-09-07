import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext"
import { useState } from "react";
import type { ICart, IMenu, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";

const CartPage = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate()

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)
  const [clearingCart, setCearingCart] = useState(false)

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    )
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;

  const platFromFee = 7;

  const grandTotal = subTotal + deliveryFee + platFromFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(`${restaurantService}/api/v1/cart/inc`, { itemId }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

      await fetchCart()
    } catch (error: any) {
      toast.error("something went wrong")
    } finally {
      setLoadingItemId(null)
    }
  }


  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(`${restaurantService}/api/v1/cart/dec`, { itemId }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

      await fetchCart()
    } catch (error: any) {
      toast.error("something went wrong")
    } finally {
      setLoadingItemId(null)
    }
  }

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure, you want to clear cart")

    if (!confirm) return;
    try {
      setCearingCart(true)
      await axios.delete(`${restaurantService}/api/v1/cart/clear`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

      await fetchCart()
    } catch (error: any) {
      toast.error("something went wrong")
    } finally {
      setCearingCart(false)
    }
  }

  const checkout = () => {

    navigate('/checkout')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="rounded-xl p-4 shadow-sm shadow-gray-700/60">
        <h2 className="text-xl font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500 ">{restaurant.autoLocation.formatedAddress}</p>
      </div>

      <div className="space-y-6">
        {
          cart.map((cartItem: ICart) => {
            const item = cartItem.itemId as IMenu
            const isLoading = loadingItemId === item._id;

            return <div key={item._id} className="flex items-center rounded-xl gap-4 shadow-sm shadow-gray-700/60">
              <img src={item.image} alt="" className="h-20 w-20 rounded object-cover " />
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">₹ {item.price}</p>
              </div>

              <div className="flex items-center gap-3 ">
                <button className="rounded-full shadow-sm shadow-gray-500 p-2 hover:bg-gary-100 disabled:opacity-50 cursor-pointer" disabled={isLoading} onClick={() => decreaseQty(item._id)}>
                  {isLoading ? <VscLoading size={16} className="animate-spin " /> : <BiMinus size={16} />}
                </button>
                <span className="font-medium">{cartItem.quantity}</span>
                <button className="rounded-full shadow-sm shadow-gray-500 p-2 hover:bg-gary-100 disabled:opacity-50 cursor-pointer" disabled={isLoading} onClick={() => increaseQty(item._id)}
                >
                  {isLoading ? <VscLoading size={16} className="animate-spin " /> : <BiPlus size={16} />}
                </button>
              </div>
              <p className="text-right font-medium m-2">₹ {item.price * cartItem.quantity}</p>
            </div>
          })
        }
      </div>

      <div className="rounded-xl p-4 shadow-sm shadow-gray-700/60 spcace-y3">
        <div className="flex justify-between text-sm">
          <span>Total Items</span>
          <span>{quantity}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>subtotal</span>
          <span>₹ {subTotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>delivery fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹ ${deliveryFee}`}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Platefrom fee</span>
          <span>₹ {platFromFee}</span>
        </div>

        {
          subTotal < 250 && <p className="text-xs text-gray-500">Add item worth ₹ {250 - subTotal} more to get free delivery</p>
        }

        <div className="flex justify-between text-base font-semibold border-t border-gray-500 pt-2 mt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>

        <button
          onClick={() => checkout()}
          className={`mt-3 w-full rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-700 cursor-default transition-all ${!restaurant.isOpen ? "opacity-50 cursor-not-allowed" : ''}`}
          disabled={!restaurant.isOpen}
        >
          {!restaurant.isOpen ? "Restaurant is Closed" : "Proceed to Checkout"}
        </button>


        <button
          onClick={() => clearCart()}
          className="flex justify-center items-center mt-3 w-full gap-3 rounded-lg bg-gray-800 py-3 text-sm font-semibold text-white hover:bg-gray-900 cursor-pointer transition-all"
        >
          Clear Cart <TbTrash size={16}/>
        </button>
      </div>
    </div>
  )
}

export default CartPage