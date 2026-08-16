import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const firstLetter = user?.name.charAt(0).toUpperCase();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logout success");
  };
  return (
    <div className="min-h-screen  px-4 py-6">
      <div className="mx-auto max-w-md rounded-lg bg-[#10141E] shadow-sm">
        <div className="flex items-center gap-4 border-b p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-700 text-xl font-semibold text-white">
            {firstLetter}
          </div>
          <div className="">
            <h2 className="text-lg font-semibold ">
              {user?.name
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
                }
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="divide-y">
          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-[#1D202A] "
            onClick={() => navigate("/orders")}
          >
            <BiPackage className="h-5 w-5 text-orange-700" />
            <span className="font-medium">Your orders</span>
          </div>

          <div
            className="flex cursor-pointer items-center gap-4 p-5 hover:bg-[#1D202A] "
            onClick={() => navigate("/address")}
          >
            <BiMapPin className="h-5 w-5 text-orange-700" />
            <span className="font-medium">Addresses</span>
          </div>

          <div
            className="flex cursor-pointer rounded-lg items-center gap-4 p-5 hover:bg-[#1D202A] "
            onClick={logoutHandler}
          >
            <BiLogOut className="h-5 w-5 text-orange-700" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
