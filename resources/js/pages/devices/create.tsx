import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehículos', href: '/vehicles' },
    { title: 'Agregar dispositivo', href: '/devices/create' },
];

type DeviceForm = {
    identifier: string;
    name: string;
    phone: string;
    model: string;
};

export default function DeviceCreate() {
    const { data, setData, post, processing, errors } = useForm<DeviceForm>({
        identifier: '',
        name: '',
        phone: '',
        model: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('devices.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agregar dispositivo GPS" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                <h1 className="text-2xl font-semibold">Agregar dispositivo GPS</h1>
                <p className="text-muted-foreground text-sm">
                    Registra un nuevo dispositivo. La asignación a un vehículo se realiza desde la tabla de vehículos.
                </p>

                <form onSubmit={submit} className="max-w-md space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="identifier">Identificador (IMEI o ID único) *</Label>
                        <Input
                            id="identifier"
                            value={data.identifier}
                            onChange={(e) => setData('identifier', e.target.value)}
                            placeholder="Ej. 123456789012345"
                            required
                            autoFocus
                        />
                        <InputError message={errors.identifier} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del dispositivo</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej. GPS principal"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Ej. +52 612 000 0000"
                        />
                        <InputError message={errors.phone} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                            id="model"
                            value={data.model}
                            onChange={(e) => setData('model', e.target.value)}
                            placeholder="Ej. TKSTAR TK905"
                        />
                        <InputError message={errors.model} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando…' : 'Agregar dispositivo'}
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
