import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DashboardVehicle } from '@/types';
import type { VehicleStats } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Gauge, History, LayoutGrid, MapPin, Route } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface DashboardProps {
    vehicles: DashboardVehicle[];
    vehicleStatsLast7Days: VehicleStats[];
    vehicleStatsLast30Days: VehicleStats[];
}

type StatsPeriod = '7' | '30';

export default function Dashboard() {
    const { vehicles, vehicleStatsLast7Days, vehicleStatsLast30Days } = usePage<DashboardProps>().props;
    const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('30');

    const stats = statsPeriod === '7' ? vehicleStatsLast7Days : vehicleStatsLast30Days;
    const periodLabel = statsPeriod === '7' ? 'Últimos 7 días' : 'Últimos 30 días';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Resumen y acceso a monitoreo en tiempo real e historial de rutas.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Link href="/monitoring" className="block">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border hover:bg-muted/30 transition-colors">
                            <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
                            <h2 className="text-lg font-semibold">Monitoreo</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Vehículos en tiempo real en el mapa.
                            </p>
                            <Button variant="outline" size="sm" className="mt-4">
                                Abrir monitoreo
                            </Button>
                        </div>
                    </Link>
                    <Link href="/history" className="block">
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border hover:bg-muted/30 transition-colors">
                            <History className="h-10 w-10 text-muted-foreground mb-3" />
                            <h2 className="text-lg font-semibold">Historial</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Rutas por día y hora en el mapa.
                            </p>
                            <Button variant="outline" size="sm" className="mt-4">
                                Abrir historial
                            </Button>
                        </div>
                    </Link>
                </div>

                <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="font-medium flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Estadísticas por vehículo
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                variant={statsPeriod === '7' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatsPeriod('7')}
                            >
                                Últimos 7 días
                            </Button>
                            <Button
                                variant={statsPeriod === '30' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatsPeriod('30')}
                            >
                                Últimos 30 días
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{periodLabel}</p>
                    {stats.length === 0 ? (
                        <p className="text-sm text-muted-foreground mt-4">
                            No hay vehículos con dispositivo. Agrega vehículos y dispositivos para ver estadísticas.
                        </p>
                    ) : (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {stats.map((s) => (
                                <div
                                    key={s.vehicle_id}
                                    className="rounded-lg border border-sidebar-border/50 bg-muted/20 p-4"
                                >
                                    <p className="font-semibold">{s.vehicle_name}</p>
                                    {s.plate && (
                                        <p className="text-muted-foreground text-sm">{s.plate}</p>
                                    )}
                                    <dl className="mt-3 space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Route className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="text-muted-foreground">Distancia:</span>
                                            <span className="font-medium">{s.total_km.toFixed(1)} km</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Gauge className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="text-muted-foreground">Vel. promedio:</span>
                                            <span className="font-medium">
                                                {s.avg_speed_kmh != null ? `${s.avg_speed_kmh.toFixed(1)} km/h` : '—'}
                                            </span>
                                        </div>
                                        {s.max_speed_kmh != null && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-[calc(theme(spacing.4)+0.5rem)] shrink-0" />
                                                <span className="text-muted-foreground">Vel. máxima:</span>
                                                <span className="font-medium">{s.max_speed_kmh.toFixed(1)} km/h</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{s.positions_count} puntos registrados</span>
                                        </div>
                                    </dl>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <h3 className="font-medium flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Resumen de vehículos
                    </h3>
                    {vehicles.length === 0 ? (
                        <p className="text-sm text-muted-foreground mt-2">
                            No hay vehículos. Agrega vehículos y dispositivos para usar monitoreo e historial.
                        </p>
                    ) : (
                        <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {vehicles.map((v) => (
                                <li
                                    key={v.id}
                                    className="rounded-lg border border-sidebar-border/50 bg-muted/20 p-3 text-sm"
                                >
                                    <p className="font-medium">{v.name}</p>
                                    {v.plate && (
                                        <p className="text-muted-foreground">{v.plate}</p>
                                    )}
                                    {v.device ? (
                                        <p className="capitalize text-muted-foreground text-xs mt-1">
                                            {v.device.status}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground text-xs mt-1">Sin dispositivo</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
