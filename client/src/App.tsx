import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicRoute from "./components/publicRoutes";
import ProtectedRoute from "./components/protectedRoutes";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/CartPage";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import RiderEarnings from "./pages/RiderEarnings";
import Admin from "./pages/Admin";
import { IoFlame } from "react-icons/io5";

const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#080C14]">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-xl shadow-orange-500/25 flex items-center justify-center animate-pulse">
            <IoFlame className="text-3xl text-white" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-orange-500/10 blur-xl pointer-events-none" />
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
          <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
            Initializing BiteRush...
          </span>
        </div>
      </div>
    );
  }

  if (user && user.role === "seller") {
    return <Restaurant />;
  }

  // Rider Routes: / par Dashboard aur /my-earnings par Earnings
  if (user && user.role === "rider") {
    return (
      <Routes>
        <Route path="/" element={<RiderDashboard />} />
        <Route path="/my-earnings" element={<RiderEarnings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user && user.role === "admin") {
    return <Admin />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
          <Route path="/ordersuccess" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/address" element={<Address />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;