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

function itemsWithPosition(
    vehicles: DashboardVehicle[],
    standaloneDevices: DashboardVehicle[],
): Array<{ key: string; item: DashboardVehicle }> {
    const fromVehicles = vehicles
        .filter((v) => v.device?.last_latitude != null && v.device?.last_longitude != null)
        .map((v) => ({ key: `v-${v.id}`, item: v }));
    const fromDevices = standaloneDevices
        .filter((d) => d.device?.last_latitude != null && d.device?.last_longitude != null)
        .map((d) => ({ key: `d-${d.device!.id}`, item: d }));
    return [...fromVehicles, ...fromDevices];
}

function FitBounds({
    vehicles,
    standaloneDevices,
}: {
    vehicles: DashboardVehicle[];
    standaloneDevices: DashboardVehicle[];
}) {
    const map = useMap();
    const fitted = useRef(false);
    const items = itemsWithPosition(vehicles, standaloneDevices);
    useEffect(() => {
        if (items.length === 0 || fitted.current) return;
        const bounds = L.latLngBounds(
            items.map(({ item }) => [
                item.device!.last_latitude!,
                item.device!.last_longitude!,
            ] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        fitted.current = true;
    }, [map, items.length]);
    return null;
}

interface MapMonitoringProps {
    vehicles: DashboardVehicle[];
    standaloneDevices?: DashboardVehicle[];
}

export default function MapMonitoring({ vehicles, standaloneDevices = [] }: MapMonitoringProps) {
    const items = itemsWithPosition(vehicles, standaloneDevices);

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
                {items.length > 0 && (
                    <FitBounds vehicles={vehicles} standaloneDevices={standaloneDevices} />
                )}
                {items.map(({ key, item }) => (
                    <Marker
                        key={key}
                        position={[item.device!.last_latitude!, item.device!.last_longitude!]}
                    >
                        <Popup>
                            <div className="text-sm">
                                {item.is_standalone_device ? (
                                    <>
                                        <p className="font-semibold">Dispositivo: {item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.device!.identifier}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold">{item.name}</p>
                                        {item.plate && <p className="text-muted-foreground">{item.plate}</p>}
                                    </>
                                )}
                                <p className="capitalize text-muted-foreground">{item.device!.status}</p>
                                {item.device!.last_recorded_at && (
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(item.device!.last_recorded_at).toLocaleString()}
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
