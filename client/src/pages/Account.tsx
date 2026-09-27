import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiChevronRight, BiLogOut, BiMapPin, BiPackage, BiShieldQuarter } from "react-icons/bi";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const formattedName = user?.name
    ? user.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "BiteRush User";

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const navItems = [
    {
      title: "Your Orders",
      subtitle: "Track live status & past order history",
      icon: <BiPackage className="h-5 w-5 text-orange-400" />,
      action: () => navigate("/orders"),
    },
    {
      title: "Saved Addresses",
      subtitle: "Manage your delivery locations",
      icon: <BiMapPin className="h-5 w-5 text-orange-400" />,
      action: () => navigate("/address"),
    },
    {
      title: "Account Role & Access",
      subtitle: user?.role ? `Current active role: ${user.role.toUpperCase()}` : "Switch between Customer, Rider, Seller",
      icon: <BiShieldQuarter className="h-5 w-5 text-orange-400" />,
      action: () => navigate("/select-role"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 px-4 py-10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="mx-auto max-w-lg space-y-6 relative z-10">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-2xl font-extrabold text-white shadow-lg shadow-orange-500/30">
                {firstLetter}
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-slate-900 bg-emerald-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight truncate">{formattedName}</h1>
                {user?.role && (
                  <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-2 backdrop-blur-xl shadow-xl space-y-1">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-800/60 transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
              </div>
              <BiChevronRight className="text-lg text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}

          <div className="border-t border-slate-800/80 my-1 pt-1">
            <button
              onClick={logoutHandler}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-rose-500/10 transition-all group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <BiLogOut className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-rose-400">Logout</h3>
                  <p className="text-xs text-slate-500">Sign out of your account on this device</p>
                </div>
              </div>
              <BiChevronRight className="text-lg text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;