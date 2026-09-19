import { useParams } from "react-router-dom"
import { useSocket } from "../context/SocketContext"
import { useEffect, useState } from "react"
import type { IOrder } from "../types"
import axios from "axios"
import { restaurantService } from "../main"
import { DiVim } from "react-icons/di"

const OrderPage = () => {
    const { id } = useParams()
    const { socket } = useSocket()
    const [order, setOrder] = useState<IOrder | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchOrder = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/v1/order/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

            setOrder(data.order || [])
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchOrder();
    }, [])

    useEffect(() => {
        if (!socket) return;

        const onOrderUpdate = () => {
            fetchOrder();
        }

        socket.on("order:update", onOrderUpdate)
        socket.on('order:rider_assigned', onOrderUpdate)

        return () => {
            socket.off("order:update", onOrderUpdate)
            socket.off('order:rider_assigned', onOrderUpdate)

        }
    }, [socket])

    if (loading) {
        return (
            <p className="text-center text-gray-500"> Loading Orders...</p>
        )
    }

    if (!order) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-gray-500">No orders found</p>
            </div>
        )
    }
    return (
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
            <h1 className="text-xl font-bold ">Order #{order._id.slice(-6)}</h1>

            <div className="rounded-lg p-3 text-sm font-medium shadow-sm shadow-gray-800">
                Status: <span className="capitalize text-gray-300">{order.status.replaceAll("_", " ")}</span>
            </div>

            <div className="p-4 rounded-lg shadow-sm shadow-gray-800 space-y-6">
                <h2 className="font-semibold ">Items</h2>
                {
                    order.items.map((item, index) => (
                        <div className="flex justify-between text-sm" key={index}>
                            <span>{item.name} X {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                        </div>
                    ))
                }
            </div>


            <div className="rounded-lg shadow-sm shadow-gray-800 space-y-1 p-4">
                <h2 className="font-semibold">Delivery Address</h2>
                <p className="text-sm text-gray-500">
                    {order.delivaryAddress.formattedAddress}
                </p>
                <p className="text-sm text-gray-500">Mobile: {order.delivaryAddress.mobile}</p>
            </div>

            <div className="rounded-lg shadow-sm shadow-gray-800 space-y-2 p-4">
                <div className="flex justify-between text-sm ">
                    <span>SubTotal</span>
                    <span>₹{order.subTotal}</span>
                </div>

                <div className="flex justify-between text-sm ">
                    <span>Delivery Fee </span>
                    <span>₹{order.delivaryFee}</span>
                </div>

                <div className="flex justify-between text-sm ">
                    <span>PlatForm Fee </span>
                    <span>₹{order.platfromFee}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span>Total </span>
                    <span>₹{order.totalAmount}</span>
                </div>

                <p className="text-xs text-gray-500">Payment Method: {order.paymentMethod}</p>
                <p className="text-xs text-gray-500">Payment Status: {order.paymentStatus}</p>
            </div>
        </div>
    )
}

export default OrderPage