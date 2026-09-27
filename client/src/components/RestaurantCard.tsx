import { useNavigate } from "react-router-dom";
import { BiNavigation, BiRightArrowAlt } from "react-icons/bi";
import { FaFire } from "react-icons/fa";

interface Props {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
}

const RestaurantCard = ({ id, image, name, distance, isOpen }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/restaurant/${id}`)}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer ${
        !isOpen ? "opacity-75" : ""
      }`}
    >
      {/* Thumbnail Banner with Zoom Effect */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={
            image ||
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"
          }
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !isOpen ? "grayscale" : ""
          }`}
          loading="lazy"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-black/30" />

        {/* Open / Closed Status Badge */}
        <div className="absolute top-3 left-3">
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold backdrop-blur-md shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open Now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold backdrop-blur-md shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Closed
            </span>
          )}
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-[11px] font-semibold backdrop-blur-md">
            <BiNavigation className="text-orange-400 text-xs" />
            {distance} km away
          </span>
        </div>

        {/* Closed Overlay Alert */}
        {!isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <span className="rounded-xl bg-black/80 px-4 py-1.5 font-bold text-xs uppercase tracking-wider text-rose-400 border border-rose-500/30">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-bold text-white group-hover:text-orange-400 transition-colors">
              {name}
            </h3>
            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
              <FaFire className="text-[10px]" /> Top Pick
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 line-clamp-1">
            Fast preparation &bull; Authentic delicacies &bull; Contactless delivery
          </p>
        </div>

        {/* Explore Menu Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-orange-400 transition-colors">
          <span>Explore Menu</span>
          <div className="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
            <BiRightArrowAlt className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;