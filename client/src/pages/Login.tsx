import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";
import { IoFlame } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);

    try {
      const result = await axios.post(`${authService}/api/v1/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message || "Welcome to BiteRush!");
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error: any) {
      console.error(error?.message);
      toast.error(error?.response?.data?.message || "Problem while logging in");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/15 blur-[120px]" />

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 text-center space-y-7">
        {/* Brand Flame Icon */}
        <div className="inline-flex items-center justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-xl shadow-orange-500/30">
            <IoFlame className="text-3xl text-white drop-shadow-md" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome to <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">BiteRush</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in with your Google account to discover lightning-fast food delivery.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/80 hover:bg-slate-800/80 px-4 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <VscLoading className="animate-spin text-base text-orange-400" />
                <span>Signing in securely...</span>
              </>
            ) : (
              <>
                <FcGoogle size={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed px-4">
          By continuing, you agree to our{" "}
          <span className="text-orange-400 hover:underline cursor-pointer">Terms of Service</span> &{" "}
          <span className="text-orange-400 hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;