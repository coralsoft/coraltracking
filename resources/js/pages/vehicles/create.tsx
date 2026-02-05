import InputError from '@/components/input-error';
import { TagChip } from '@/components/tag-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehículos', href: '/vehicles' },
    { title: 'Nuevo vehículo', href: '/vehicles/create' },
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

interface VehiclesCreateProps {
    tags: TagOption[];
}

export default function VehicleCreate() {
    const { tags } = usePage<VehiclesCreateProps>().props;
    const { data, setData, post, processing, errors } = useForm<VehicleForm>({
        name: '',
        brand: '',
        type: '',
        line: '',
        plate: '',
        color: '',
        tag_ids: [],
    });

    const toggleTag = (tagId: number) => {
        setData('tag_ids', data.tag_ids.includes(tagId)
            ? data.tag_ids.filter((id) => id !== tagId)
            : [...data.tag_ids, tagId],
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('vehicles.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo vehículo" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                <h1 className="text-2xl font-semibold">Nuevo vehículo</h1>

                <form onSubmit={submit} className="max-w-md space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej. Camión 1"
                            required
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="plate">Placas</Label>
                        <Input
                            id="plate"
                            value={data.plate}
                            onChange={(e) => setData('plate', e.target.value)}
                            placeholder="Ej. ABC-123"
                        />
                        <InputError message={errors.plate} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                            id="brand"
                            value={data.brand}
                            onChange={(e) => setData('brand', e.target.value)}
                            placeholder="Ej. Toyota"
                        />
                        <InputError message={errors.brand} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Input
                            id="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            placeholder="Ej. Bus"
                        />
                        <InputError message={errors.type} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="line">Línea</Label>
                        <Input
                            id="line"
                            value={data.line}
                            onChange={(e) => setData('line', e.target.value)}
                            placeholder="Ej. Hiace"
                        />
                        <InputError message={errors.line} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                            id="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            placeholder="Ej. Blanco"
                        />
                        <InputError message={errors.color} />
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
                                        selected={data.tag_ids.includes(tag.id)}
                                        onClick={() => toggleTag(tag.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando…' : 'Guardar vehículo'}
                        </Button>
                        <Link href={route('vehicles.index')}>
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
