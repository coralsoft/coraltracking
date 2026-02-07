import type { HistoryPosition } from '@/types';
import L from 'leaflet';
import { Fragment, useEffect, useRef } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

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

export interface HistoryRoute {
    vehicleName: string;
    color: string;
    positions: HistoryPosition[];
}

const MAX_ROUTE_POINTS = 300;

function thinPositions(positions: HistoryPosition[]): HistoryPosition[] {
    if (positions.length <= MAX_ROUTE_POINTS) return positions;
    const step = Math.ceil(positions.length / MAX_ROUTE_POINTS);
    return positions.filter((_, index) => index % step === 0 || index === positions.length - 1);
}

function FitPositions({ positions }: { positions: HistoryPosition[] }) {
    const map = useMap();
    const fitted = useRef(false);
    useEffect(() => {
        if (positions.length === 0 || fitted.current) return;
        const bounds = L.latLngBounds(positions.map((p) => [p.latitude, p.longitude] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        fitted.current = true;
    }, [map, positions]);
    return null;
}

function FitRoutes({ routes }: { routes: HistoryRoute[] }) {
    const map = useMap();
    const fitted = useRef(false);
    useEffect(() => {
        const allPositions = routes.flatMap((r) => r.positions);
        if (allPositions.length === 0 || fitted.current) return;
        const bounds = L.latLngBounds(allPositions.map((p) => [p.latitude, p.longitude] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        fitted.current = true;
    }, [map, routes]);
    return null;
}

interface MapHistoryProps {
    positions: HistoryPosition[];
    vehicleName?: string;
    selectedIndex?: number;
    onSelectIndex?: (index: number) => void;
    /** When provided, show multiple routes (by tag filter) instead of single vehicle. */
    routes?: HistoryRoute[];
    /** Toggle route line visibility (to avoid clutter). */
    showRoute?: boolean;
}

export default function MapHistory({ positions, vehicleName, selectedIndex, onSelectIndex, routes = [], showRoute = true }: MapHistoryProps) {
    const thinnedPositions = thinPositions(positions);
    const latLngs = thinnedPositions.map((p) => [p.latitude, p.longitude] as [number, number]);
    const hasSingleRoute = routes.length === 0 && latLngs.length > 0;
    const hasMultiRoutes = routes.length > 0;
    const clampedIndex =
        selectedIndex == null
            ? null
            : Math.min(Math.max(selectedIndex, 0), Math.max(positions.length - 1, 0));
    const selectedPosition = clampedIndex != null ? positions[clampedIndex] : null;

    return (
        <div className="h-full w-full min-h-[400px] rounded-xl overflow-hidden border border-sidebar-border/70 dark:border-sidebar-border">
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
                {hasMultiRoutes && <FitRoutes routes={routes} />}
                {hasMultiRoutes && showRoute && routes.map((route) => {
                    const routeLatLngs = thinPositions(route.positions).map((p) => [p.latitude, p.longitude] as [number, number]);
                    if (routeLatLngs.length === 0) return null;
                    return (
                        <Polyline
                            key={route.vehicleName + route.color}
                            positions={routeLatLngs}
                            pathOptions={{ color: route.color, weight: 3, smoothFactor: 1.5 }}
                        />
                    );
                })}
                {hasMultiRoutes && showRoute && routes.map((route) => {
                    const routeLatLngs = thinPositions(route.positions).map((p) => [p.latitude, p.longitude] as [number, number]);
                    return (
                        <Fragment key={route.vehicleName}>
                            {routeLatLngs[0] && (
                                <Marker position={routeLatLngs[0]}>
                                    <Popup>Start · {route.vehicleName}</Popup>
                                </Marker>
                            )}
                            {routeLatLngs.length > 1 && routeLatLngs[routeLatLngs.length - 1] && (
                                <Marker position={routeLatLngs[routeLatLngs.length - 1]}>
                                    <Popup>End · {route.vehicleName}</Popup>
                                </Marker>
                            )}
                        </Fragment>
                    );
                })}
                {hasSingleRoute && <FitPositions positions={positions} />}
                {hasSingleRoute && showRoute && (
                    <>
                        <Polyline positions={latLngs} pathOptions={{ color: '#c8246b', weight: 3, smoothFactor: 1.5 }} />
                        {latLngs[0] && (
                            <Marker position={latLngs[0]}>
                                <Popup>Start{vehicleName ? ` · ${vehicleName}` : ''}</Popup>
                            </Marker>
                        )}
                        {latLngs.length > 1 && latLngs[latLngs.length - 1] && (
                            <Marker position={latLngs[latLngs.length - 1]}>
                                <Popup>End</Popup>
                            </Marker>
                        )}
                    </>
                )}
                {hasSingleRoute && selectedPosition && (
                    <Marker
                        position={[selectedPosition.latitude, selectedPosition.longitude]}
                        eventHandlers={{
                            click: () => {
                                if (clampedIndex != null) onSelectIndex?.(clampedIndex);
                            },
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-semibold">
                                    {vehicleName ? vehicleName : 'Posición'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(selectedPosition.recorded_at).toLocaleString()}
                                </p>
                                {selectedPosition.speed != null && (
                                    <p className="text-xs text-muted-foreground">
                                        Velocidad: {selectedPosition.speed} km/h
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {selectedPosition.latitude.toFixed(6)}, {selectedPosition.longitude.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
