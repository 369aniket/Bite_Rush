import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import PublicRoute from './components/publicRoutes'
import ProtectedRoute from './components/protectedRoutes'
import SelectRole from './pages/SelectRole'
import Navbar from './components/Navbar'
import Account from './pages/Account'
import { useAppData } from './context/AppContext'
import Restaurant from './pages/Restaurant'
import RestaurantPage from './pages/RestaurantPage'
import CartPage from './pages/CartPage'
import Address from './pages/Address'
import Checkout from './pages/Checkout'
import Paymentsuccess from './pages/Paymentsuccess'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import OrderPage from './pages/OrderPage'
import RiderDashboard from './pages/RiderDashboard'

const App = () => {

  const { user, loading } = useAppData()

  if(loading){
    return <h1 className='text-2xl font-bold text-red-500 text-center mt-50'>Loading...</h1>
  }

  if (user && user.role === "seller") {
    return <Restaurant />
  }

   if (user && user.role === "rider") {
    return <RiderDashboard />
  }
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path='/login' element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
           <Route path='/' element={<Home />} />
           <Route path='/paymentsuccess/:paymentId' element={<Paymentsuccess />} />
           <Route path='/ordersuccess' element={<OrderSuccess />} />
           <Route path='/orders' element={<Orders />} />
           <Route path='/order/:id' element={<OrderPage />} />
           <Route path='/address' element={<Address />} />
           <Route path='/checkout' element={<Checkout />} />
            <Route path='/restaurant/:id' element={<RestaurantPage />} />
            <Route path='/cart' element={<CartPage />} />

            <Route path='/select-role' element={<SelectRole />} />
            <Route path='/account' element={<Account />} />
          </Route>


        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App