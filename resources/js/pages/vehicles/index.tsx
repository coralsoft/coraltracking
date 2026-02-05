import { TagChip } from '@/components/tag-chip';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Car, Pencil, Plus, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehículos', href: '/vehicles' },
];

interface TagItem {
    id: number;
    name: string;
    color: string | null;
}

interface VehicleListItem {
    id: number;
    name: string;
    brand?: string | null;
    type?: string | null;
    line?: string | null;
    plate: string | null;
    color: string | null;
    tags: TagItem[];
    device: {
        id: number;
        identifier: string;
        name: string | null;
        status: string;
    } | null;
}

interface DeviceListItem {
    id: number;
    identifier: string;
    name: string | null;
    phone?: string | null;
    model?: string | null;
    status: string;
}

interface VehiclesIndexProps {
    vehicles: VehicleListItem[];
    devices: DeviceListItem[];
    tags: TagItem[];
    flash?: { success?: string; error?: string };
}

export default function VehiclesIndex() {
    const { vehicles, devices, flash } = usePage<VehiclesIndexProps>().props;
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.success) setSuccess(flash.success as string);
        if (flash?.error) setError(flash.error as string);
    }, [flash?.success, flash?.error]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehículos" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4 overflow-x-auto">
                <div>
                    <h1 className="text-2xl font-semibold">Vehículos y dispositivos</h1>
                    <p className="text-muted-foreground mt-1">
                        Administra tus vehículos y dispositivos GPS por separado. Vincula un dispositivo a un vehículo desde la edición del vehículo.
                    </p>
                </div>

                {success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        {error}
                    </div>
                )}

                {/* Section: Vehicles */}
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Vehículos
                        </h2>
                        <Link href={route('vehicles.create')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo vehículo
                            </Button>
                        </Link>
                    </div>
                    {vehicles.length === 0 ? (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-8 text-center dark:border-sidebar-border">
                            <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 font-medium">No hay vehículos</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Crea tu primer vehículo y luego agrega un dispositivo GPS para vincularlo.
                            </p>
                            <Link href={route('vehicles.create')}>
                                <Button className="mt-4">
                                    <Plus className="h-4 w-4" />
                                    Nuevo vehículo
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 bg-muted/30 dark:bg-muted/20">
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Vehículo</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Marca</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Tipo</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Línea</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Placas</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Color</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Etiquetas</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Dispositivo</th>
                                            <th className="text-right font-medium px-2 py-1.5 whitespace-nowrap">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicles.map((v) => (
                                            <tr
                                                key={v.id}
                                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors"
                                            >
                                                <td className="px-2 py-1.5">
                                                    <span className="font-medium">{v.name}</span>
                                                </td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{v.brand ?? '—'}</td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{v.type ?? '—'}</td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{v.line ?? '—'}</td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{v.plate ?? '—'}</td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{v.color ?? '—'}</td>
                                                <td className="px-2 py-1.5">
                                                    {v.tags?.length > 0 ? (
                                                        <span className="flex flex-wrap gap-1">
                                                            {v.tags.map((t) => (
                                                                <TagChip
                                                                    key={t.id}
                                                                    label={t.name}
                                                                    color={t.color}
                                                                    static
                                                                    className="py-0.5 px-2 text-[10px]"
                                                                />
                                                            ))}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                    <Select
                                                        value={v.device ? String(v.device.id) : 'none'}
                                                        onValueChange={(value) => {
                                                            router.put(
                                                                route('vehicles.device.assign', v.id),
                                                                { device_id: value === 'none' ? null : value },
                                                                { preserveScroll: true },
                                                            );
                                                        }}
                                                    >
                                                        <SelectTrigger className="h-7 min-w-0 w-40 text-xs">
                                                            <SelectValue placeholder="Seleccionar" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">Sin dispositivo</SelectItem>
                                                            {devices.map((d) => (
                                                                <SelectItem key={d.id} value={String(d.id)}>
                                                                    {d.identifier}
                                                                    {d.name ? ` (${d.name})` : ''}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-2 py-1.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={route('vehicles.edit', v.id)}>
                                                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" title="Editar vehículo">
                                                                <Pencil className="h-3 w-3 mr-0.5" />
                                                                Editar
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={route('devices.create') + `?vehicle_id=${v.id}`}
                                                            title="Asignar dispositivo"
                                                        >
                                                            <Button
                                                                variant={v.device ? 'outline' : 'default'}
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                            >
                                                                <Radio className="h-3 w-3 mr-0.5" />
                                                                GPS
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                {/* Section: Devices */}
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Radio className="h-5 w-5" />
                            Dispositivos GPS
                        </h2>
                        <Link href={route('devices.create')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar dispositivo
                            </Button>
                        </Link>
                    </div>
                    {devices.length === 0 && vehicles.length === 0 ? (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 text-center dark:border-sidebar-border">
                            <Radio className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 font-medium">No hay dispositivos</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Crea un vehículo primero y luego usa «Agregar dispositivo» para vincular un GPS.
                            </p>
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 text-center dark:border-sidebar-border">
                            <Radio className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 font-medium">No hay dispositivos aún</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Usa el botón «Agregar dispositivo» para crear dispositivos.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-sidebar-border/70 bg-muted/30 dark:bg-muted/20">
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Identificador</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Nombre</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Teléfono</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Modelo</th>
                                            <th className="text-left font-medium px-2 py-1.5 whitespace-nowrap">Estado</th>
                                            <th className="text-right font-medium px-2 py-1.5 whitespace-nowrap">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {devices.map((d) => (
                                            <tr
                                                key={d.id}
                                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors"
                                            >
                                                <td className="px-2 py-1.5 font-mono">{d.identifier}</td>
                                                <td className="px-2 py-1.5">{d.name ?? '—'}</td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{d.phone ?? '—'}</td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{d.model ?? '—'}</td>
                                                <td className="px-2 py-1.5">
                                                    <span className="capitalize">{d.status}</span>
                                                </td>
                                                <td className="px-2 py-1.5 text-right">
                                                    <span className="text-muted-foreground">—</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
