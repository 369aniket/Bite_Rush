import { useState } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiFoodMenu, BiPlus } from "react-icons/bi";

interface Props {
  restaurantId: string;
  onComplete: () => void;
}

// Client-side image compression: 10MB raw photos ko 200KB-300KB clean JPEG me convert karta hai
const compressImage = async (imageFile: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  if (!imageFile.type.startsWith("image/") || imageFile.size <= 300 * 1024) {
    return imageFile;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < imageFile.size) {
              const compressedFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(imageFile);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(imageFile);
    };
    reader.onerror = () => resolve(imageFile);
  });
};

const AddMenuItem = ({ restaurantId, onComplete }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload an image for this dish");
      return;
    }

    setLoading(true);
    try {
      // Image compress karke upload pipeline me timeout aur aborted stream se bachata hai
      const readyFile = await compressImage(file);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("restaurantId", restaurantId);
      formData.append("file", readyFile);

      await axios.post(`${restaurantService}/api/v1/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Dish added to your menu!");
      setName("");
      setDescription("");
      setPrice("");
      setFile(null);
      onComplete();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add dish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <BiFoodMenu className="text-xl" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Add New Dish to Menu</h2>
          <p className="text-xs text-slate-400">Introduce a new culinary item to your customers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Dish Name</label>
          <input
            required
            type="text"
            placeholder="e.g. Paneer Butter Masala"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Description</label>
          <textarea
            rows={3}
            placeholder="e.g. Rich, creamy tomato-butter gravy with soft cottage cheese cubes."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Price (INR ₹)</label>
          <input
            required
            type="number"
            placeholder="e.g. 299"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Dish Photo</label>
          <input
            required
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-2.5 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25"
        >
          <BiPlus className="text-base" />
          <span>{loading ? "Publishing Dish..." : "Save & Add to Catalog"}</span>
        </button>
      </form>
    </div>
  );
};

export default AddMenuItem;