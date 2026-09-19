import axios from "axios";
import { useEffect, useState } from "react";
import { riderService } from "../main";
import toast from "react-hot-toast";

interface Props {
    orderId: string;
    onAccepted: () => void;
}
const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
    const [accepting, setAccepting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(10);

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onAccepted();
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);

        return () => clearInterval(interval)
    }, [onAccepted])

    const acceptOrder = async () => {
        try {
            await axios.post(`${riderService}/api/v1/rider/accept/${orderId}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

            toast.success("Order Accepted")
            onAccepted()
        } catch (error: any) {
            toast.error(error?.response?.data?.message)
            console.log("Something went wrong while Accepting Order", error?.response?.data?.message)
            onAccepted()
        } finally {
            setAccepting(false)
        }
    }
    return (
        <div className="rounded-xl shadow-sm shadow-gray-800 p-4 space-y-3">
            <p className="text-center text-xs font-semibold text-red-600">Accept within {secondsLeft}</p>
            <p className="text-center text-xs font-semibold text-green-600">New Delivery Request</p>

            <p className="text-xs text-gray-600">Order ID: <b>{orderId.slice(-6)}</b></p>

            <button
                disabled={accepting}
                onClick={() => acceptOrder()}
                className="rounded-lg border border-green-600 p-2 text-sm font-semibold text-green-600 hover:border-green-800 disabled:opacity-50"
            >{accepting ? 'Accepting...' : 'Accept Order'}
            </button>
        </div>
    )
}

export default RiderOrderRequest