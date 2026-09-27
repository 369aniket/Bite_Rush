import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload, BiStore } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";

interface Props {
  fetchRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchRestaurant }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image || !location) {
      toast.error("Please fill all required fields and ensure location is detected");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("formatedAddress", location.formatedAddress);
    formData.append("phone", phone);
    formData.append("file", image);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/v1/restaurant/new`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Restaurant registered successfully!");
      await fetchRestaurant();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to register restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-orange-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-5">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <BiStore className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Register Restaurant</h1>
            <p className="text-xs text-slate-400">Join BiteRush partner network and start accepting orders</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Restaurant Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Spice Symphony"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Contact Number</label>
            <input
              required
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Cuisine & Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Authentic North Indian & Tandoor delicacies served with passion."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Restaurant Banner Image</label>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-5 text-sm text-slate-400 hover:border-orange-500/50 hover:bg-slate-950/80 transition-all">
              <BiUpload className="h-5 w-5 text-orange-400" />
              <span className="truncate max-w-xs">{image ? image.name : "Upload storefront photo"}</span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <BiMapPin className="text-orange-400 text-sm" />
              <span>Auto-Detected Location</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              {loadingLocation ? "Detecting GPS location..." : location?.formatedAddress || "Location coordinates unavailable"}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25"
          >
            {submitting ? (
              <>
                <VscLoading className="animate-spin text-base" />
                <span>Registering Restaurant...</span>
              </>
            ) : (
              <span>Submit & Open Restaurant</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;