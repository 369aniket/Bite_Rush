import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiMapPin, BiMobile, BiPlus, BiTrash } from "react-icons/bi";

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

// Click-to-select location on map
const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Locate me button
const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied")
    );
  };

  return (
    <button
      onClick={locateUser}
      type="button"
      className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md hover:border-orange-500/50 hover:bg-slate-800 transition-all cursor-pointer"
    >
      <LuLocateFixed className="text-orange-400 text-sm" />
      <span>Use Current Location</span>
    </button>
  );
};

const Address = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Reverse geocoding
  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch {
      toast.error("Failed to fetch address from map coordinates");
    }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/v1/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setAddresses(data.addresses || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Add address
  const addAddress = async () => {
    if (!mobile || !formattedAddress || latitude === null || longitude === null) {
      toast.error("Please click on the map to set your location coordinates");
      return;
    }

    try {
      setAdding(true);
      await axios.post(
        `${restaurantService}/api/v1/address/new`,
        {
          formattedAddress,
          mobile,
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Delivery address saved!");
      setMobile("");
      setFormattedAddress("");
      setLatitude(null);
      setLongitude(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save address");
    } finally {
      setAdding(false);
    }
  };

  // Delete address
  const deleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/v1/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Address removed");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-8 relative">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Delivery Addresses</h1>
          <p className="text-xs text-slate-400 mt-1">Pin your exact location on the map and save for fast checkout</p>
        </div>

        {/* Map Picker Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-2xl border border-slate-800 shadow-inner">
            <MapContainer
              center={[latitude || 28.6139, longitude || 77.209]}
              zoom={13}
              className="h-full w-full"
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <LocationPicker setLocation={setLocation} />
              <LocateMeButton onLocate={setLocation} />
              {latitude && longitude && <Marker position={[latitude, longitude]} />}
            </MapContainer>
          </div>

          {/* Detected Address Display */}
          {formattedAddress && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-xs text-slate-200">
              <BiMapPin className="text-orange-400 text-base shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold text-orange-400 block mb-0.5">Selected Map Location</span>
                {formattedAddress}
              </div>
            </div>
          )}

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <input
                type="number"
                placeholder="Receiver phone number (e.g. 9876543210)"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <button
              disabled={adding}
              onClick={addAddress}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {adding ? <BiLoader className="animate-spin text-base" /> : <BiPlus className="text-base" />}
              <span>Save Address</span>
            </button>
          </div>
        </div>

        {/* Saved Addresses List */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Saved Addresses</h2>
            <span className="text-xs text-slate-400">{addresses.length} total</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <BiLoader className="animate-spin text-orange-400 text-base" />
              <span>Loading addresses...</span>
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No saved addresses found. Pin your home or office on the map above.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1 text-xs min-w-0">
                    <p className="font-semibold text-slate-200 leading-relaxed truncate max-w-lg">
                      {addr.formattedAddress}
                    </p>
                    <p className="text-slate-400 flex items-center gap-1.5 font-mono">
                      <BiMobile className="text-orange-400" />
                      <span>{addr.mobile}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAddress(addr._id)}
                    disabled={deletingId === addr._id}
                    title="Delete Address"
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  >
                    {deletingId === addr._id ? (
                      <BiLoader size={16} className="animate-spin" />
                    ) : (
                      <BiTrash size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;