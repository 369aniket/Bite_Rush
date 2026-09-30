import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "../context/SocketContext";

interface Props {
  order: IOrder;
}

const riderIcon = new L.DivIcon({
  html: '<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🛵</div>',
  iconSize: [32, 32],
  className: "rider-marker",
});

const deliveryIcon = new L.DivIcon({
  html: '<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">📍</div>',
  iconSize: [32, 32],
  className: "delivery-marker",
});

const Routing = ({ from, to }: { from: [number, number]; to: [number, number] }) => {
  const [routePositions, setRoutePositions] = useState<[number, number][]>([from, to]);

  useEffect(() => {
    let isCancelled = false;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (!isCancelled && data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          setRoutePositions(coords);
        }
      } catch (err) {
        console.warn("OSRM routing error, fallback to direct line: ", err);
        if (!isCancelled) {
          setRoutePositions([from, to]);
        }
      }
    };

    fetchRoute();

    return () => {
      isCancelled = true;
    };
  }, [from[0], from[1], to[0], to[1]]);

  return (
    <Polyline
      positions={routePositions}
      pathOptions={{ color: "#f97316", weight: 5, opacity: 0.85 }}
    />
  );
};

const RiderOrderMap = ({ order }: Props) => {
  const { socket } = useSocket();
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  if (
    order.delivaryAddress?.latitude == null ||
    order.delivaryAddress?.longitude == null
  ) {
    return null;
  }

  const deliveryLocation: [number, number] = [
    order.delivaryAddress.latitude,
    order.delivaryAddress.longitude,
  ];

  useEffect(() => {
    const fetchLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          setRiderLocation([latitude, longitude]);

          if (socket && socket.connected) {
            socket.emit("rider:location:update", {
              targetUserId: order.userId,
              latitude,
              longitude,
            });
          }
        },
        (err) => console.warn("Rider location error: ", err),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);

    return () => clearInterval(interval);
  }, [order.userId, socket]);

  if (!riderLocation) return null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800">
      <MapContainer
        center={riderLocation}
        zoom={14}
        className="h-full w-full min-h-[300px]"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={riderLocation} icon={riderIcon}>
          <Popup>
            <div className="text-xs font-semibold">🛵 You (Rider GPS)</div>
          </Popup>
        </Marker>

        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>
            <div className="text-xs font-semibold">📍 Delivery Destination</div>
          </Popup>
        </Marker>

        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default RiderOrderMap;