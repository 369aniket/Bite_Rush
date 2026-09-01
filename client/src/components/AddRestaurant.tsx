import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload } from "react-icons/bi";

interface props {
    fetchRestaurant: () => Promise<void>;
}

const AddRestaurant = ({fetchRestaurant}:props) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [phone, setPhone] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const {loadingLocation, location} = useAppData()

    const handleSubmit = async () =>{
        if(!name || !image || !location){
            alert("All filed's are required")
            return;
        }

        const formData = new FormData()

        formData.append("name", name)
        formData.append("description", description)
        formData.append("latitude", String(location.latitude))
        formData.append("longitude", String(location.longitude))
        formData.append("formatedAddress", location.formatedAddress)
        formData.append("phone", phone)
        formData.append("file", image)
    
        try {
            setSubmitting(true)

            await axios.post(`${restaurantService}/api/v1/restaurant/new`, formData, {headers:{Authorization: `Bearer ${localStorage.getItem("token")}`}})

            toast.success('Restaurant Added Successfully')
            fetchRestaurant()
        } catch (error: any) {
            toast.error(error.response.data.message)
        }finally{
            setSubmitting(false)
        }
    }

  return (
    <div className="min-h-screen custom-bg px-4 py-6">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
            <h1 className="text-xl font-semibold text-orange-500">Add Your Restaurant</h1>
            <input
            type="text"
            placeholder="Restaurant name"
            value={name} onChange={(e)=> setName(e.target.value)} 
            className="w-full text-black rounded-lg border border-orange-500 px-4 py-2 text-sm outline-none"
            />

            <input
            type="number"
            placeholder="Contact Number"
            value={phone} onChange={(e)=> setPhone(e.target.value)} 
            className="w-full text-black rounded-lg border border-orange-500 px-4 py-2 text-sm outline-none"
            />

            <textarea
            placeholder="Restaurant Description"
            value={description} onChange={(e)=> setDescription(e.target.value)} 
            className="w-full text-black rounded-lg border border-orange-500 px-4 py-2 text-sm outline-none"
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-orange-500 p-4 text-sm text-gray-600 hover:bg-gray-50">
                <BiUpload className="h-5 w-5 text-orange-500"/>
                {image ? image.name: "Upload restaurant image"}

                <input type="file" accept="image/*" hidden onChange={(e)=> setImage(e.target.files[0] || null)}/>
            </label>


            <div className="flex items-start gap-3 rounded-lg border p-4">
                <BiMapPin className="mt-0.5 h-5 w-5 text-orange-500"/>
                <div className="text-sm text-gray-500">
                    {
                        loadingLocation ? "Fetching your location..." : location.formatedAddress || "Location not available"
                    }
                </div>
            </div>

            <button 
            className="w-full rounded-lg pt-3 text-sm font-semibold text-gray-50 bg-orange-500 "
            disabled={submitting}
            onClick={handleSubmit}
            >
                {submitting ? "Submitting...": "Add Restaurant"}
            </button>
        </div>
    </div>
  )
}

export default AddRestaurant;