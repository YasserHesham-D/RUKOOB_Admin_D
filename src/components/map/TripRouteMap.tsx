import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface TripRouteMapProps {
  pickup?: { lat: number; lng: number; address: string };
  dropoff?: { lat: number; lng: number; address: string };
  currentLocation?: { lat: number; lng: number };
  driverName?: string;
  height?: string;
  zoom?: number;
}

function MapUpdater({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
}

export const TripRouteMap: React.FC<TripRouteMapProps> = ({
  pickup = { lat: 24.0889, lng: 32.8998, address: 'موقف أسوان العمومي' },
  dropoff = { lat: 24.0932, lng: 32.9056, address: 'كورنيش النيل' },
  currentLocation,
  driverName,
  height = '350px',
  zoom = 13,
}) => {
  const center: [number, number] = [pickup.lat, pickup.lng];
  const polylineCoords: [number, number][] = [
    [pickup.lat, pickup.lng],
    [dropoff.lat, dropoff.lng],
  ];

  const bounds: L.LatLngBoundsExpression = [
    [pickup.lat, pickup.lng],
    [dropoff.lat, dropoff.lng],
  ];

  return (
    <div
      style={{ height }}
      className="w-full rounded-xl overflow-hidden border border-rukoob-forest/50 relative z-0 shadow-inner"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater bounds={bounds} />

        <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
          <Popup>
            <div className="font-cairo text-xs text-right">
              <p className="font-bold text-emerald-700">نقطة الانطلاق</p>
              <p className="text-slate-700">{pickup.address}</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
          <Popup>
            <div className="font-cairo text-xs text-right">
              <p className="font-bold text-amber-700">نقطة الوصول</p>
              <p className="text-slate-700">{dropoff.address}</p>
            </div>
          </Popup>
        </Marker>

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={driverIcon}>
            <Popup>
              <div className="font-cairo text-xs text-right">
                <p className="font-bold text-blue-700">موقع السائق</p>
                {driverName && <p className="text-slate-700">{driverName}</p>}
              </div>
            </Popup>
          </Marker>
        )}

        <Polyline positions={polylineCoords} color="#C5A880" weight={4} dashArray="8, 8" />
      </MapContainer>
    </div>
  );
};
