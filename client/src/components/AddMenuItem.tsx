import axios from "axios"
import { useState } from "react"
import { restaurantService } from "../main"
import toast from "react-hot-toast"
import { BiUpload } from "react-icons/bi"


const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const resetForm = () => {
        setName("")
        setDescription("")
        setPrice('')
        setImage(null)

    }

    const handleSubmit = async () => {
        if (!name || !price || !image) {
            alert("Name, Price and Image is required")
            return
        }

        const formData = new FormData()

        formData.append("name", name)
        formData.append("description", description)
        formData.append("price", price)
        formData.append("file", image)

        try {
            setLoading(true)
            await axios.post(`${restaurantService}/api/v1/item/new`,  formData , { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })

            toast.success("Item added successfully")
            resetForm()
            onItemAdded();
        } catch (error) {
            console.log(error);
            toast.error("Failed to add item")
        } finally {
            setLoading(false)
        }

    }
    return (
        <div className="max-w-md space-4 m-auto">
            <h2 className="text-lg font-semibold">Add Menu Item</h2>

            <input
                type="text"
                placeholder="Item name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full cursor-pointer rounded-lg border mb-1 px-4 py-2 text-sm outline-none"
            />

            <textarea
                placeholder="add description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full cursor-pointer rounded-lg mb-1  border px-4 py-2 text-sm outline-none"
            />

            <input
                type="number"
                placeholder="Price ₹"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full cursor-pointer rounded-lg border mb-1 px-4 py-2 text-sm outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-500 hover:text-white transition-all">
                <BiUpload className="h-5 w-5" />
                {image ? image.name : "Upload restaurant image"}

                <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0] || null)} />
            </label>

            <button disabled={loading} onClick={handleSubmit} className="w-full rounded-lg my-1 py-3 text-white text-sm font-semibold transition bg-orange-500 cursor-pointer">{loading ? "Adding..." : "Add Item"}</button>
        </div>
    )
}

export default AddMenuItem