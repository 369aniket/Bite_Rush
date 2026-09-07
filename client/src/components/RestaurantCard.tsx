import { useNavigate } from "react-router-dom";

type props = {
    id: string;
    image: string;
    name: string;
    distance: string;
    isOpen: boolean;
}

const RestaurantCard = ({id, image, name, distance, isOpen}: props) => {
    const navigate = useNavigate();

  return (
    <div className={`cursor-pointer overflow-hidden, rounded-xl bg-gray-900 shadow-sm transition hover:shadow-md ${!isOpen ? "opacity-80" : ""}`}onClick={()=> navigate(`/restaurant/${id}`)} >
        <div className="relative h-40 w-full overflow-hidden rounded-xl">
          <img src={image} alt=""className={`h-full w-full  object-cover transition duration-300 hover:scale-105 ${!isOpen ? "grayscale" : " "}`}/>

          {
            !isOpen && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-md bg-black/80 px-3 py-1 font-semibold text-sm text-orange-500">Closed</span>
              </div>
            )
          }
        </div>

        <div className="px-2 truncate text-base font-semibold text-gray-300">{name}</div>
        <p className="px-2 py-2 text-sm text-gray-400 ">{distance} KM away</p>
    </div>
  )
}

export default RestaurantCard