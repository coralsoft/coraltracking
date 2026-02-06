import MapMonitoring from '@/components/map-monitoring';
import { TagChip } from '@/components/tag-chip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DashboardVehicle } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Suspense } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Monitoreo', href: '/monitoring' },
];

interface TagOption {
    id: number;
    name: string;
    color: string | null;
}

interface MonitoringProps {
    vehicles: DashboardVehicle[];
    standaloneDevices: DashboardVehicle[];
    tags: TagOption[];
    filterTagIds: number[];
}

export default function Monitoring() {
    const { vehicles, standaloneDevices = [], tags = [], filterTagIds = [] } = usePage<MonitoringProps>().props;
    const mapItems = [
        ...vehicles.filter((v) => v.device != null),
        ...standaloneDevices.filter((d) => d.device != null),
    ];

    const toggleTagFilter = (tagId: number) => {
        const next = filterTagIds.includes(tagId)
            ? filterTagIds.filter((id) => id !== tagId)
            : [...filterTagIds, tagId];
        router.get(route('monitoring'), next.length > 0 ? { tag_ids: next } : {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitoreo" />
            <div className="flex flex-1 flex-col min-h-0 p-0">
                <div className="flex-1 min-h-0 w-full relative">
                    <Suspense
                        fallback={
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                                <span className="text-muted-foreground">
                                    Cargando mapa…
                                </span>
                            </div>
                        }
                    >
                        <MapMonitoring vehicles={vehicles} standaloneDevices={standaloneDevices} />
                    </Suspense>
                    {tags.length > 0 && (
                        <div className="absolute top-4 left-4 z-[1000] rounded-xl border border-sidebar-border/70 bg-card/95 backdrop-blur shadow-lg p-3 max-h-64 overflow-y-auto">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Filtrar por etiquetas</p>
                            <p className="text-[11px] text-muted-foreground mb-2">Haz clic para mostrar solo vehículos con esa etiqueta.</p>
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
                        </div>
                    )}
                    {mapItems.length > 0 && (
                        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs z-[1000] rounded-lg border border-sidebar-border/70 bg-card/95 backdrop-blur shadow-lg p-3 max-h-48 overflow-y-auto">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Vehículos y dispositivos en tiempo real</p>
                            <ul className="space-y-1.5">
                                {vehicles.filter((v) => v.device).map((v) => (
                                    <li key={`v-${v.id}`} className="text-sm">
                                        <p className="font-medium">{v.name}</p>
                                        {v.plate && <p className="text-muted-foreground text-xs">{v.plate}</p>}
                                        <p className="capitalize text-muted-foreground text-xs">
                                            {v.device!.status}
                                            {v.device!.last_recorded_at &&
                                                ` · ${new Date(v.device!.last_recorded_at).toLocaleString()}`}
                                        </p>
                                    </li>
                                ))}
                                {standaloneDevices.filter((d) => d.device).map((d) => (
                                    <li key={`d-${d.device!.id}`} className="text-sm">
                                        <p className="font-medium">Dispositivo: {d.name}</p>
                                        <p className="text-muted-foreground text-xs">{d.device!.identifier}</p>
                                        <p className="capitalize text-muted-foreground text-xs">
                                            {d.device!.status}
                                            {d.device!.last_recorded_at &&
                                                ` · ${new Date(d.device!.last_recorded_at).toLocaleString()}`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {mapItems.length === 0 && (
                        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-[1000] rounded-lg border border-sidebar-border/70 bg-card/95 backdrop-blur shadow-lg p-3">
                            <p className="text-sm text-muted-foreground">
                                No hay vehículos ni dispositivos con ubicación. Agrega vehículos o dispositivos para verlos en el mapa.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
