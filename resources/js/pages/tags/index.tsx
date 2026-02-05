import { TagChip, TAG_COLOR_OPTIONS } from '@/components/tag-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Tag as TagIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Etiquetas', href: '/tags' },
];

interface TagItem {
    id: number;
    name: string;
    color: string | null;
    vehicles_count: number;
}

interface TagsIndexProps {
    tags: TagItem[];
    flash?: { success?: string; error?: string };
}

export default function TagsIndex() {
    const { tags, flash } = usePage<TagsIndexProps>().props;
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState<string>('blue');

    const createForm = useForm({
        name: '',
        color: 'blue',
    });

    useEffect(() => {
        if (flash?.success) setSuccess(flash.success);
        if (flash?.error) setError(flash.error);
    }, [flash?.success, flash?.error]);

    const submitCreate: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(route('tags.store'), {
            preserveScroll: true,
            onSuccess: () => createForm.reset(),
        });
    };

    const startEdit = (tag: TagItem) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditColor(tag.color && TAG_COLOR_OPTIONS.some((c) => c.key === tag.color) ? tag.color : 'blue');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditColor('blue');
    };

    const submitEdit = (tagId: number) => {
        router.put(route('tags.update', tagId), { name: editName, color: editColor }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setEditName('');
                setEditColor('blue');
            },
        });
    };

    const deleteTag = (tagId: number, tagName: string) => {
        if (confirm(`¿Eliminar la etiqueta "${tagName}"?`)) {
            router.delete(route('tags.destroy', tagId), { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Etiquetas" />
            <div className="flex h-full flex-1 flex-col gap-8 rounded-xl p-4 overflow-x-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Etiquetas</h1>
                        <p className="text-muted-foreground mt-1">
                            Crea etiquetas y asígnalas a vehículos para filtrarlos en monitoreo e historial.
                        </p>
                    </div>
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

                <section className="space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2 w-full sm:w-auto">
                            <TagIcon className="h-5 w-5" />
                            Nueva etiqueta
                        </h2>
                        <form onSubmit={submitCreate} className="flex flex-wrap items-end gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tag-name">Nombre</Label>
                                <Input
                                    id="tag-name"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Ej. Ruta Norte"
                                    className="w-48"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {TAG_COLOR_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => createForm.setData('color', opt.key)}
                                            className={cn(
                                                'w-8 h-8 rounded-full border-2 transition-all shrink-0',
                                                createForm.data.color === opt.key
                                                    ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background ring-muted-foreground/50'
                                                    : 'border-transparent hover:scale-105',
                                            )}
                                            style={{ backgroundColor: opt.hex }}
                                            title={opt.label}
                                            aria-label={opt.label}
                                        />
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" disabled={createForm.processing}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-sidebar-border/70 bg-muted/30 dark:bg-muted/20">
                                        <th className="text-left font-medium px-2 py-1.5">Nombre</th>
                                        <th className="text-left font-medium px-2 py-1.5">Vehículos</th>
                                        <th className="text-right font-medium px-2 py-1.5">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tags.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-2 py-4 text-center text-muted-foreground">
                                                No hay etiquetas. Crea una arriba.
                                            </td>
                                        </tr>
                                    ) : (
                                        tags.map((tag) => (
                                            <tr
                                                key={tag.id}
                                                className="border-b border-sidebar-border/50 last:border-b-0 hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors"
                                            >
                                                <td className="px-2 py-1.5">
                                                    {editingId === tag.id ? (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Input
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                className="h-7 w-40"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-1.5">
                                                                {TAG_COLOR_OPTIONS.map((opt) => (
                                                                    <button
                                                                        key={opt.key}
                                                                        type="button"
                                                                        onClick={() => setEditColor(opt.key)}
                                                                        className={cn(
                                                                            'w-6 h-6 rounded-full border-2 shrink-0 transition-all',
                                                                            editColor === opt.key
                                                                                ? 'border-foreground ring-2 ring-offset-1 ring-offset-background ring-muted-foreground/50'
                                                                                : 'border-transparent hover:scale-110',
                                                                        )}
                                                                        style={{ backgroundColor: opt.hex }}
                                                                        title={opt.label}
                                                                        aria-label={opt.label}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <Button size="sm" className="h-7 px-2" onClick={() => submitEdit(tag.id)}>
                                                                Guardar
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={cancelEdit}>
                                                                Cancelar
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <TagChip
                                                            label={tag.name}
                                                            color={tag.color}
                                                            static
                                                            className="py-0.5 px-2.5"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-2 py-1.5 text-muted-foreground">{tag.vehicles_count}</td>
                                                <td className="px-2 py-1.5 text-right">
                                                    {editingId !== tag.id && (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={() => startEdit(tag)}
                                                            >
                                                                <Pencil className="h-3 w-3 mr-0.5" />
                                                                Editar
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={() => deleteTag(tag.id, tag.name)}
                                                            >
                                                                <Trash2 className="h-3 w-3 mr-0.5" />
                                                                Eliminar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
