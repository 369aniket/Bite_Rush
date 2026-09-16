import { useEffect, useState } from "react"
import type { IMenu, IRestaurant } from "../types"
import { restaurantService } from "../main"
import axios from "axios"
import AddRestaurant from "../components/AddRestaurant"
import RestaurantProfile from "../components/RestaurantProfile"
import MenuItem from "../components/MenuItem"
import AddMenuItem from "../components/AddMenuItem"
import RestaurantOrders from "../components/RestaurantOrders"

type SellerTab = "menu" | "add-item" | "sales"

const Restaurant = () => {
    const[restaurant, setRestaurant] = useState<IRestaurant>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<SellerTab>("menu")

    const fetchRestaurant = async()=>{
      try {
        const { data } = await axios.get(`${restaurantService}/api/v1/restaurant/my`,{ headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}})
        setRestaurant(data.restaurant || null);

        if(data.token){
          localStorage.setItem("token", data.token)
          window.location.reload()
        }


      } catch (error) {
        console.log(error);
      }finally{setLoading(false)}
    }

    useEffect(()=>{
      fetchRestaurant()
    },[]);

    const [menuItem, setMenuItem] = useState<IMenu[]>([])

    const fetchMenuItems = async (restaurantId:string) => {
      try {
        const { data } = await axios.get(`${restaurantService}/api/v1/item/all/${restaurantId}`, {headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}})

        setMenuItem(data)
      } catch (error) {
        console.log(error);
      }
    }

    useEffect(()=>{
      if(restaurant?._id){
        fetchMenuItems(restaurant._id)
      }
    },[restaurant])
    if(loading) return <div className="flex justify-center items-center min-h-screen"> <p className="text-gray-500">Loading your restaurant....</p></div>

    if(!restaurant){
      return <AddRestaurant fetchRestaurant={fetchRestaurant}/>
    }
  return (
    <div className="min-h-screen bg-custom px-4 py-6 space-y-6">
      <RestaurantProfile  restaurant={restaurant} onUpdate={setRestaurant} isSeller={true}/>

      <RestaurantOrders restaurantId={restaurant._id} />

      <div className="rounded-xl bg-gray-900 shadow-sm">
        <div className="flex border-b border-gray-500">
          {
            [{key: "menu", label: "Menu Items"},
              {key: "add-item", label: "Add Item"},
              {key: "sales", label: "Sales"},
            ].map(t=> (
            <button 
              className={`mb-1 flex-1 px-4 py-3 text-sm font-medium transition cursor-pointer ${tab === t.key ? "border border-gray-500 rounded-4xl bg-gray-800 text-orange-500 " : "text-gray-500 hover:text-gray-700"}`}
              key={t.key} 
              onClick={()=> setTab(t.key as SellerTab)}>
                {t.label}
              </button>))
          }
        </div>

        <div className="p-5 flex">
          {tab === "menu" && <MenuItem itmes={menuItem} onItemDeleted={()=> fetchMenuItems(restaurant._id)} isSeller={true}/>}
          {tab === "add-item" && <AddMenuItem onItemAdded={() => fetchMenuItems(restaurant._id)}/>}
          {tab === "sales" && <p  className="text-gray-500 font-semibold">Sales Page</p>}
        </div>
      </div>
    </div>
  )
}

export default Restaurant