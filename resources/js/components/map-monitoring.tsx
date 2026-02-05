import type { DashboardVehicle } from '@/types';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

// Fix default marker icon (Vite resolves paths from node_modules)
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
const defaultIcon = L.icon({
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const defaultCenter: [number, number] = [19.4326, -99.1332];
const defaultZoom = 10;

function FitBounds({ vehicles }: { vehicles: DashboardVehicle[] }) {
    const map = useMap();
    const fitted = useRef(false);
    useEffect(() => {
        const withPosition = vehicles.filter(
            (v) => v.device?.last_latitude != null && v.device?.last_longitude != null,
        );
        if (withPosition.length === 0 || fitted.current) return;
        const bounds = L.latLngBounds(
            withPosition.map((v) => [v.device!.last_latitude!, v.device!.last_longitude!] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        fitted.current = true;
    }, [map, vehicles]);
    return null;
}

export default function MapMonitoring({ vehicles }: { vehicles: DashboardVehicle[] }) {
    const withPosition = vehicles.filter(
        (v) => v.device?.last_latitude != null && v.device?.last_longitude != null,
    );

    return (
        <div className="absolute inset-0 h-full w-full">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="h-full w-full"
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {withPosition.length > 0 && <FitBounds vehicles={vehicles} />}
                {withPosition.map((vehicle) => (
                    <Marker
                        key={vehicle.id}
                        position={[vehicle.device!.last_latitude!, vehicle.device!.last_longitude!]}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-semibold">{vehicle.name}</p>
                                {vehicle.plate && <p className="text-muted-foreground">{vehicle.plate}</p>}
                                <p className="capitalize text-muted-foreground">{vehicle.device!.status}</p>
                                {vehicle.device!.last_recorded_at && (
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(vehicle.device!.last_recorded_at).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
