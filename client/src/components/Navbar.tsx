import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { BiMapPin, BiSearch, BiShoppingBag, BiUser } from "react-icons/bi";
import { IoFlame } from "react-icons/io5";

const Navbar = () => {
  const { isAuth, city, quantity, user } = useAppData();
  const currentLocation = useLocation();

  const isHomePage = currentLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080C14]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Brand Logo & Location Chip */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <IoFlame className="text-xl text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              BiteRush
            </span>
          </Link>

          {city && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
              <BiMapPin className="text-orange-400 text-sm" />
              <span className="truncate max-w-[140px] font-medium">{city}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-orange-500/40 hover:text-orange-400 hover:bg-slate-800 transition-all cursor-pointer"
            title="Cart"
          >
            <BiShoppingBag className="text-xl" />
            {quantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-1 text-[10px] font-extrabold text-white shadow-md shadow-orange-500/30 animate-pulse">
                {quantity}
              </span>
            )}
          </Link>

          {/* User Account / Login */}
          {isAuth ? (
            <Link
              to="/account"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-orange-500/40 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <BiUser />}
              </div>
              <span className="hidden sm:inline font-medium truncate max-w-[100px]">
                {user?.name?.split(" ")[0] || "Account"}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Global Search Bar (Only on Homepage) */}
      {isHomePage && (
        <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg shadow-black/20 focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
            {city && (
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-r border-slate-800 text-xs font-medium text-slate-300 shrink-0">
                <BiMapPin className="text-orange-400 text-sm" />
                <span className="truncate max-w-[110px]">{city}</span>
              </div>
            )}

            <div className="flex flex-1 items-center gap-2.5 px-3.5 py-2">
              <BiSearch className="text-slate-400 text-base shrink-0" />
              <input
                type="text"
                placeholder="Search dishes, cuisines, or restaurants near you..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;