import { useState } from "react"
import {useNavigate} from "react-router-dom"
import { authService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {setUser, setIsAuth} = useAppData()

    const responseGoogle = async (authResult: any)=>{
        setLoading(true)
       
        try {
            const result = await axios.post(`${authService}/api/v1/auth/login`, {code: authResult['code']})

            localStorage.setItem('token', result.data.token);
            toast.success(result.data.message);
            setLoading(false);
            setUser(result.data.user)
            setIsAuth(true)
            navigate('/')

        } catch (error) {
            console.log(error.message)
            toast.error("Problem While Login")
            setLoading(false)
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess:responseGoogle,
        onError:responseGoogle,
        flow: "auth-code"
    })
  return (
    <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-sm space-y-6">
            <h1 className="text-center text-3xl font-bold text-orange-500">BiteRush</h1>
            <p className="text-center text-sm text-gray-500">
                Login or Signup to continue
            </p>

            <button
            onClick={googleLogin}
            disabled={loading}
            className="flex text-orange-500 w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-2 cursor-pointer hover:bg-gray-200 transition-all"
            >
                <FcGoogle size={20}/>
                {loading? "Signing in...": 'Continue with Google'}
            </button>

            <p className="text-center text-xs text-gray-400">
                By continuing, you agree with our{" "}
                <span className="text-orange-500">Terms of Service</span> & {" "}
                <span className="text-orange-500">Privacy Policy</span>
            </p>
        </div>
    </div>
  )
}

export default Login