import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiBell, BiUpload } from "react-icons/bi";
import audio from '../assets/msg-received.mp3'
import RiderOrderRequest from "../components/RiderOrderRequest";

interface IRiderAccount {
    _id: string;
    userId: string;
    picture: string;
    phoneNumber: string;
    aadharNumber: string;
    drivingLicenseNumber: string;
    isVerified: boolean;
    isAvailable: boolean;
    lastActiveAt: string;
    createdAt: string;
    updatedAt: string;
}

interface IRiderResponse {
    message: string;
    account: IRiderAccount;
}

const RiderDashboard = () => {
    const { user } = useAppData()
    const { socket } = useSocket()

    const [profile, setProfile] = useState<IRiderAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    const [incomingOrders, setIncomingOrders] = useState<string[]>([])
    const [currentOrder, setCurrentOrder] = useState<IRiderAccount | null>(null)
    const [audioUnlocked, setAudioUnlocked] = useState(false)

    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio(audio)
        audioRef.current.preload = 'auto'
    }, [])

    const unlockAudio = async () => {
        try {
            if (!audioRef.current) return;
            await audioRef.current.play();

            audioRef.current.pause()
            audioRef.current.currentTime = 0;
            setAudioUnlocked(true)
            toast.success('Sound Enabled')
        } catch (error) {
            toast.error('Tap again to enable sound')
        }
    }

    useEffect(() => {
        if (!socket) return;

        const timeouts: ReturnType<typeof setTimeout>[] = [];

        const onOrderAvailable = ({ orderId }: { orderId: string }) => {
            setIncomingOrders((prev) =>
                prev.includes(orderId) ? prev : [...prev, orderId]
            );

            if (audioUnlocked && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => { });
            }

            const t = setTimeout(() => {
                setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
            }, 10000);
            timeouts.push(t);
        };

        socket.on('order:available', onOrderAvailable);

        return () => {
            socket.off('order:available', onOrderAvailable);
            timeouts.forEach(clearTimeout);
        };
    }, [socket, audioUnlocked]);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get<IRiderResponse>(`${riderService}/api/v1/rider/my-profile`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })

            setProfile(data?.account || null)

        } catch (error) {
            console.log(error)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.role === 'rider') {
            fetchProfile()
        } else {
            setLoading(false)
        }
    }, [user])

    const fetchCurrentOrder = async () => {
        try {
            const { data } = await axios.get(`${riderService}/api/v1/rider/order/current`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

            setCurrentOrder(data.order)
        } catch (error) {
            console.log(error);
            setCurrentOrder(null)
        }
    }

    useEffect(() => {
        fetchCurrentOrder()
    }, [])

    const toggleAvailability = async () => {
        if (!navigator.geolocation) {
            toast.error("Location access required");
            return
        }
        setToggling(true)

        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                await axios.patch(`${riderService}/api/v1/rider/toggle`, {
                    isAvailable: !profile.isAvailable,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })

                toast.success(profile.isAvailable ? "You are offline" : "You are online")
                fetchProfile();
            } catch (error: any) {
                toast.error(error.response.data.message)
            } finally {
                setToggling(false)
            }
        })
    }

    const [phoneNumber, setPhoneNumber] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [aadharNumber, setAadharNumber] = useState('')
    const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!navigator.geolocation) {
            toast.error("Location access required");
            return
        }
        setSubmitting(true)

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const formData = new FormData()

            formData.append("phoneNumber", phoneNumber)
            formData.append("aadharNumber", aadharNumber)
            formData.append("drivingLicenseNumber", drivingLicenseNumber)
            formData.append("latitude", pos.coords.latitude.toString())
            formData.append("longitude", pos.coords.longitude.toString())
            if (image) {
                formData.append("file", image)
            }
            try {
                const { data } = await axios.post(`${riderService}/api/v1/rider/new`,
                    formData
                    , {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    })

                toast.success("Your account added")
                fetchProfile();
            } catch (error: any) {
                toast.error(error.response.data.message)
            } finally {
                setSubmitting(false)
            }
        })
    }

    if (user?.role !== 'rider') {
        return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
            You are not resgister as rider
        </div>
    }

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
            Loading rider details...
        </div>
    }



    if (!profile) {
        return (
            <div className="min-h-screen custom-bg px-4 py-6">
                <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
                    <h1 className="text-xl font-semibold text-orange-500">Add Your Profile</h1>
                    <input
                        type="number"
                        placeholder="Aadha number"
                        value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)}
                        className="w-full text-black rounded-lg border border-orange-500 px-4 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <input
                        type="number"
                        placeholder="Contact Number"
                        value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full text-black rounded-lg border border-orange-500 px-4 py-2 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <input
                        type="text"
                        placeholder="Driving Licence"
                        value={drivingLicenseNumber} onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                        className="w-full text-black rounded-lg border border-orange-500 px-4 py-2 text-sm outline-none"
                    />

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-orange-500 p-4 text-sm text-gray-600 hover:bg-gray-50">
                        <BiUpload className="h-5 w-5 text-orange-500" />
                        {image ? image.name : "Upload Your image"}

                        <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0] || null)} />
                    </label>

                    <button
                        className="flex items-center justify-center w-full rounded-lg p-2 text-sm font-semibold text-gray-50 bg-orange-500 "
                        disabled={submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? "Submitting..." : "Add Profile"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 ">
            <div className="mx-auto max-w-md px-4 py-4">
                <div className="rounded-xl p-4 shadow shadow-gray-800 space-y-3">
                    <img src={profile.picture} alt="Profile picture" className="h-24 w-24 mx-auto rounded-full object-cover" />
                    <p className="text-center font-semibold ">{user?.name}</p>
                    <p className="text-center text-sm text-gray-500">{profile.phoneNumber}</p>

                    <div className="flex justify-center gap-2 ">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                            {profile.isVerified ? "Verified" : "Pending"}
                        </span>

                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${profile.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                            {profile.isAvailable ? "Online" : "Offline"}
                        </span>
                    </div>

                    <div>
                        <p className="text-gray-300 text-sm font-semibold">Please be within a 500 m radius of any restaurant <span className="text-gray-500">( which we call a hotspot )</span> before going online as a rider to receive orders.</p>
                    </div>

                    {
                        profile.isVerified && !currentOrder && <button onClick={toggleAvailability} disabled={toggling}
                            className={`w-full py-2 rounded-lg font-semibold border ${toggling ? 'bg-gray-400/50' : profile.isAvailable ? 'border-gray-500 text-red-500' : 'border-gray-500 text-green-500'}`}>
                            {toggling ? "Updating..." : profile.isAvailable ? "Go to Offline" : "Go to Online"}
                        </button>
                    }
                </div>

            </div>

            {!audioUnlocked &&
                <div className="shadow shadow-gray-800 rounded-lg flex items-center justify-between mx-auto max-w-md p-2">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-2xl "><BiBell size={18} /></span>
                        <div>
                            <p className="font-medium text-blue-500">Enable Sound Notification</p>
                            <p className="text-sm text-blue-600">Get Notified when new orders arrive</p>
                        </div>
                    </div>

                    <button onClick={unlockAudio} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-sm cursor-pointer font-semibold transition">Enable Sound</button>
                </div>
            }

            {profile.isAvailable && incomingOrders.length > 0 &&
                <div className="mx-auto max-w-md px-4 space-y-3">
                    <h3 className="font-semibold text-gray-700">Incoming Order's</h3>

                    {
                        incomingOrders.map((id) => (
                            <RiderOrderRequest key={id} orderId={id} onAccepted={() => {
                                fetchProfile();
                                fetchCurrentOrder();
                            }} />
                        ))
                    }
                </div>
            }
        </div>
    )
}

export default RiderDashboard