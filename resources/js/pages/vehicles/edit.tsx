import InputError from '@/components/input-error';
import { TagChip } from '@/components/tag-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehículos', href: '/vehicles' },
];

type VehicleForm = {
    name: string;
    brand: string;
    type: string;
    line: string;
    plate: string;
    color: string;
    tag_ids: number[];
};

interface TagOption {
    id: number;
    name: string;
    color: string | null;
}

interface VehicleEditData {
    id: number;
    name: string;
    brand: string | null;
    type: string | null;
    line: string | null;
    plate: string | null;
    color: string | null;
    tag_ids: number[];
}

interface VehicleEditProps {
    vehicle: VehicleEditData;
    tags: TagOption[];
    flash?: { success?: string; error?: string };
}

export default function VehicleEdit() {
    const { vehicle, tags, flash } = usePage<VehicleEditProps>().props;
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const vehicleForm = useForm<VehicleForm>({
        name: vehicle.name,
        brand: vehicle.brand ?? '',
        type: vehicle.type ?? '',
        line: vehicle.line ?? '',
        plate: vehicle.plate ?? '',
        color: vehicle.color ?? '',
        tag_ids: vehicle.tag_ids ?? [],
    });

    const toggleTag = (tagId: number) => {
        vehicleForm.setData('tag_ids', vehicleForm.data.tag_ids.includes(tagId)
            ? vehicleForm.data.tag_ids.filter((id) => id !== tagId)
            : [...vehicleForm.data.tag_ids, tagId],
        );
    };

    useEffect(() => {
        if (flash?.success) setSuccess(flash.success);
        if (flash?.error) setError(flash.error);
    }, [flash?.success, flash?.error]);

    const submitVehicle: FormEventHandler = (e) => {
        e.preventDefault();
        vehicleForm.put(route('vehicles.update', vehicle.id), { preserveScroll: true });
    };

    const breadcrumbsWithEdit: BreadcrumbItem[] = [
        ...breadcrumbs,
        { title: `Editar: ${vehicle.name}`, href: route('vehicles.edit', vehicle.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbsWithEdit}>
            <Head title={`Editar: ${vehicle.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                <h1 className="text-2xl font-semibold">Editar vehículo</h1>

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

                <section className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <h2 className="text-lg font-medium mb-4">Datos del vehículo</h2>
                    <form onSubmit={submitVehicle} className="max-w-md space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={vehicleForm.data.name}
                                onChange={(e) => vehicleForm.setData('name', e.target.value)}
                                placeholder="Ej. Camión 1"
                                required
                            />
                            <InputError message={vehicleForm.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="plate">Placas</Label>
                            <Input
                                id="plate"
                                value={vehicleForm.data.plate}
                                onChange={(e) => vehicleForm.setData('plate', e.target.value)}
                                placeholder="Ej. ABC-123"
                            />
                            <InputError message={vehicleForm.errors.plate} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Marca</Label>
                            <Input
                                id="brand"
                                value={vehicleForm.data.brand}
                                onChange={(e) => vehicleForm.setData('brand', e.target.value)}
                                placeholder="Ej. Toyota"
                            />
                            <InputError message={vehicleForm.errors.brand} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Input
                                id="type"
                                value={vehicleForm.data.type}
                                onChange={(e) => vehicleForm.setData('type', e.target.value)}
                                placeholder="Ej. Bus"
                            />
                            <InputError message={vehicleForm.errors.type} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="line">Línea</Label>
                            <Input
                                id="line"
                                value={vehicleForm.data.line}
                                onChange={(e) => vehicleForm.setData('line', e.target.value)}
                                placeholder="Ej. Hiace"
                            />
                            <InputError message={vehicleForm.errors.line} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <Input
                                id="color"
                                value={vehicleForm.data.color}
                                onChange={(e) => vehicleForm.setData('color', e.target.value)}
                                placeholder="Ej. Blanco"
                            />
                            <InputError message={vehicleForm.errors.color} />
                        </div>
                        {tags.length > 0 && (
                            <div className="space-y-2">
                                <Label>Etiquetas</Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Haz clic en una etiqueta para asignarla o quitarla del vehículo.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <TagChip
                                            key={tag.id}
                                            label={tag.name}
                                            color={tag.color}
                                            selected={vehicleForm.data.tag_ids.includes(tag.id)}
                                            onClick={() => toggleTag(tag.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <Button type="submit" disabled={vehicleForm.processing}>
                            {vehicleForm.processing ? 'Guardando…' : 'Guardar cambios'}
                        </Button>
                    </form>
                </section>

                <section className="rounded-xl border border-red-200/50 bg-red-50/50 dark:bg-red-950/30 dark:border-red-800/50 p-6">
                    <h2 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Zona de peligro</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Eliminar este vehículo borrará también la relación con su dispositivo (si existe) y todos los datos asociados al vehículo. Esta acción no se puede deshacer.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (confirm('¿Eliminar este vehículo y todos sus datos? Esta acción no se puede deshacer.')) {
                                router.delete(route('vehicles.destroy', vehicle.id), {
                                    onSuccess: () => router.visit(route('vehicles.index')),
                                });
                            }
                        }}
                    >
                        Eliminar vehículo
                    </Button>
                </section>
            </div>
        </AppLayout>
    );
}
