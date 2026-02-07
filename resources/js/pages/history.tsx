import MapHistory, { type HistoryRoute } from '@/components/map-history';
import { TagChip } from '@/components/tag-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { HistoryPosition } from '@/types';
import type { DashboardVehicle } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Pause, Play, Route } from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Historial', href: '/history' },
];

interface TagOption {
    id: number;
    name: string;
    color: string | null;
}

interface HistoryProps {
    vehicles: DashboardVehicle[];
    standaloneDevices: DashboardVehicle[];
    tags: TagOption[];
    filterTagIds: number[];
}

export default function History() {
    const { vehicles, standaloneDevices = [], tags = [], filterTagIds = [] } = usePage<HistoryProps>().props;
    const [historyDate, setHistoryDate] = useState(() =>
        new Date().toISOString().slice(0, 10),
    );
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [positions, setPositions] = useState<HistoryPosition[]>([]);
    const [historyVehicleName, setHistoryVehicleName] = useState<string>('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showRoute, setShowRoute] = useState(true);
    const [routesByTag, setRoutesByTag] = useState<HistoryRoute[]>([]);
    const [loadingRoutesByTag, setLoadingRoutesByTag] = useState(false);
    const playTimer = useRef<number | null>(null);

    const toggleTagFilter = (tagId: number) => {
        const next = filterTagIds.includes(tagId)
            ? filterTagIds.filter((id) => id !== tagId)
            : [...filterTagIds, tagId];
        router.get(route('history'), next.length > 0 ? { tag_ids: next } : {}, { preserveScroll: true });
    };

    const loadRoutesByTags = async () => {
        if (filterTagIds.length === 0) return;
        setLoadingRoutesByTag(true);
        setRoutesByTag([]);
        setPositions([]);
        setHistoryVehicleName('');
        setSelectedDeviceId('');
        try {
            const url = route('dashboard.positionsByTags', {
                tag_ids: filterTagIds,
                date: historyDate,
            });
            const res = await fetch(url);
            const data = await res.json();
            const routes: HistoryRoute[] = (data.routes ?? []).map((r: { vehicle_name: string; color: string; positions: HistoryPosition[] }) => ({
                vehicleName: r.vehicle_name,
                color: r.color,
                positions: r.positions ?? [],
            }));
            setRoutesByTag(routes);
        } catch {
            setRoutesByTag([]);
        } finally {
            setLoadingRoutesByTag(false);
        }
    };

    const vehiclesWithDevice = vehicles.filter((v) => v.device != null);
    const historyOptions = [
        ...vehiclesWithDevice.map((v) => ({
            deviceId: String(v.device!.id),
            label: v.name + (v.plate ? ` (${v.plate})` : ''),
        })),
        ...standaloneDevices.filter((d) => d.device).map((d) => ({
            deviceId: String(d.device!.id),
            label: `Dispositivo: ${d.name}`,
        })),
    ];
    const selectedPosition = useMemo(
        () => (positions.length > 0 ? positions[Math.min(selectedIndex, positions.length - 1)] : null),
        [positions, selectedIndex],
    );

    const loadHistory = async () => {
        if (!selectedDeviceId) return;
        setLoadingHistory(true);
        setPositions([]);
        setHistoryVehicleName('');
        setSelectedIndex(0);
        setIsPlaying(false);
        try {
            const url = route('dashboard.positions', {
                device_id: selectedDeviceId,
                date: historyDate,
            });
            const res = await fetch(url);
            const data = await res.json();
            setPositions(data.positions ?? []);
            setHistoryVehicleName(
                data.vehicle?.name ?? data.device?.name ?? data.device?.identifier ?? '',
            );
        } catch {
            setPositions([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (!isPlaying) {
            if (playTimer.current != null) {
                window.clearInterval(playTimer.current);
                playTimer.current = null;
            }
            return;
        }
        if (positions.length <= 1) return;

        playTimer.current = window.setInterval(() => {
            setSelectedIndex((idx) => {
                const next = idx + 1;
                if (next >= positions.length) {
                    return positions.length - 1;
                }
                return next;
            });
        }, 700);

        return () => {
            if (playTimer.current != null) {
                window.clearInterval(playTimer.current);
                playTimer.current = null;
            }
        };
    }, [isPlaying, positions.length]);

    useEffect(() => {
        if (positions.length > 0 && selectedIndex >= positions.length) {
            setSelectedIndex(positions.length - 1);
        }
    }, [positions.length, selectedIndex]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <h2 className="text-lg font-semibold">Historial por día</h2>
                {tags.length > 0 && (
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <p className="text-sm font-medium mb-2">Filtrar vehículos por etiquetas</p>
                        <p className="text-xs text-muted-foreground mb-2">Haz clic en una etiqueta para filtrar los vehículos.</p>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <TagChip
                                    key={tag.id}
                                    label={tag.name}
                                    color={tag.color}
                                    selected={filterTagIds.includes(tag.id)}
                                    onClick={() => toggleTagFilter(tag.id)}
                                />
                            ))}
                        </div>
                        {filterTagIds.length > 0 && (
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="mt-3"
                                onClick={loadRoutesByTags}
                                disabled={loadingRoutesByTag}
                            >
                                <Route className="h-4 w-4 mr-2" />
                                {loadingRoutesByTag ? 'Cargando…' : 'Ver rutas de todos los vehículos con estas etiquetas'}
                            </Button>
                        )}
                    </div>
                )}
                <div className="flex flex-wrap items-end gap-4 rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <div className="space-y-2">
                        <Label htmlFor="history-date">Fecha</Label>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Input
                                id="history-date"
                                type="date"
                                value={historyDate}
                                onChange={(e) => setHistoryDate(e.target.value)}
                                className="w-40"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Vehículo o dispositivo</Label>
                        <Select
                            value={selectedDeviceId}
                            onValueChange={setSelectedDeviceId}
                        >
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Seleccionar vehículo o dispositivo" />
                            </SelectTrigger>
                            <SelectContent>
                                {historyOptions.map((opt) => (
                                    <SelectItem key={opt.deviceId} value={opt.deviceId}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={loadHistory}
                        disabled={!selectedDeviceId || loadingHistory}
                    >
                        {loadingHistory ? 'Cargando…' : 'Cargar ruta'}
                    </Button>
                </div>

                {positions.length > 0 && (
                    <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-medium">Reproducción</p>
                                <p className="text-xs text-muted-foreground">
                                    {historyVehicleName ? historyVehicleName : 'Vehículo'} · {positions.length} puntos
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedIndex(0);
                                        setIsPlaying(false);
                                    }}
                                >
                                    Reiniciar
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsPlaying((v) => !v)}
                                    disabled={positions.length <= 1}
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="h-4 w-4 mr-2" />
                                            Pausar
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Reproducir
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3">
                            <input
                                type="range"
                                min={0}
                                max={Math.max(positions.length - 1, 0)}
                                value={Math.min(selectedIndex, Math.max(positions.length - 1, 0))}
                                onChange={(e) => {
                                    setIsPlaying(false);
                                    setSelectedIndex(Number(e.target.value));
                                }}
                                className="w-full"
                            />
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                <span>
                                    {selectedPosition
                                        ? new Date(selectedPosition.recorded_at).toLocaleTimeString()
                                        : '—'}
                                </span>
                                <span>
                                    {selectedPosition?.speed != null
                                        ? `Velocidad: ${selectedPosition.speed} km/h`
                                        : 'Velocidad: —'}
                                </span>
                                <span>
                                    {selectedPosition
                                        ? `${selectedPosition.latitude.toFixed(5)}, ${selectedPosition.longitude.toFixed(5)}`
                                        : '—'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 max-h-40 overflow-y-auto border-t border-sidebar-border/50 pt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Puntos</p>
                            <div className="space-y-1">
                                {positions.map((p, idx) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            setIsPlaying(false);
                                            setSelectedIndex(idx);
                                        }}
                                        className={[
                                            'w-full text-left rounded-md px-2 py-1 text-xs border',
                                            idx === selectedIndex
                                                ? 'bg-muted/50 border-sidebar-border/70'
                                                : 'bg-transparent border-transparent hover:bg-muted/30',
                                        ].join(' ')}
                                    >
                                        <span className="font-mono">
                                            {new Date(p.recorded_at).toLocaleTimeString()}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {p.speed != null ? ` · ${p.speed} km/h` : ''}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(positions.length > 0 || routesByTag.length > 0) && (
                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={() => setShowRoute((v) => !v)}
                            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
                        >
                            <span>Mostrar ruta</span>
                            <span
                                className={[
                                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                                    showRoute ? 'bg-primary' : 'bg-muted',
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                        showRoute ? 'translate-x-4' : 'translate-x-1',
                                    ].join(' ')}
                                />
                            </span>
                        </button>
                    </div>
                )}
                <div className="h-[500px] w-full">
                    <Suspense
                        fallback={
                            <div className="flex h-full w-full items-center justify-center rounded-xl border border-sidebar-border/70 bg-muted/30 dark:border-sidebar-border">
                                <span className="text-muted-foreground">
                                    Cargando mapa…
                                </span>
                            </div>
                        }
                    >
                        <MapHistory
                            positions={positions}
                            vehicleName={historyVehicleName}
                            selectedIndex={positions.length > 0 ? selectedIndex : undefined}
                            onSelectIndex={(idx) => {
                                setIsPlaying(false);
                                setSelectedIndex(idx);
                            }}
                            routes={routesByTag.length > 0 ? routesByTag : undefined}
                            showRoute={showRoute}
                        />
                    </Suspense>
                </div>
                {positions.length === 0 && selectedDeviceId && !loadingHistory && (
                    <p className="text-sm text-muted-foreground">
                        No hay posiciones registradas para este vehículo en la fecha seleccionada.
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
