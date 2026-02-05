<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $vehicles = $user->vehicles()
            ->with(['device', 'tags'])
            ->orderBy('name')
            ->get()
            ->map(fn (Vehicle $v) => [
                'id' => $v->id,
                'name' => $v->name,
                'brand' => $v->brand,
                'type' => $v->type,
                'line' => $v->line,
                'plate' => $v->plate,
                'color' => $v->color,
                'tags' => $v->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color])->values()->all(),
                'device' => $v->device ? [
                    'id' => $v->device->id,
                    'identifier' => $v->device->identifier,
                    'name' => $v->device->name,
                    'status' => $v->device->status,
                ] : null,
            ])
            ->values()
            ->all();

        $tags = $user->tags()->orderBy('name')->get(['id', 'name', 'color'])->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'color' => $t->color,
        ])->values()->all();

        $devices = Device::where('user_id', $user->id)
            ->orderBy('identifier')
            ->get()
            ->map(fn (Device $d) => [
                'id' => $d->id,
                'identifier' => $d->identifier,
                'name' => $d->name,
                'phone' => $d->phone,
                'model' => $d->model,
                'status' => $d->status,
            ])
            ->values()
            ->all();

        return Inertia::render('vehicles/index', [
            'vehicles' => $vehicles,
            'devices' => $devices,
            'tags' => $tags,
        ]);
    }

    public function create(Request $request): Response
    {
        $tags = $request->user()->tags()->orderBy('name')->get(['id', 'name', 'color'])->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'color' => $t->color,
        ])->values()->all();

        return Inertia::render('vehicles/create', [
            'tags' => $tags,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:100',
            'line' => 'nullable|string|max:100',
            'plate' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer|exists:tags,id',
        ]);

        $vehicle = $request->user()->vehicles()->create([
            'name' => $validated['name'],
            'brand' => filled($validated['brand'] ?? null) ? $validated['brand'] : null,
            'type' => filled($validated['type'] ?? null) ? $validated['type'] : null,
            'line' => filled($validated['line'] ?? null) ? $validated['line'] : null,
            'plate' => filled($validated['plate'] ?? null) ? $validated['plate'] : null,
            'color' => filled($validated['color'] ?? null) ? $validated['color'] : null,
        ]);

        $tagIds = $validated['tag_ids'] ?? [];
        $allowedTagIds = $request->user()->tags()->whereIn('id', $tagIds)->pluck('id')->all();
        $vehicle->tags()->sync($allowedTagIds);

        return redirect()->route('vehicles.index')->with('success', __('Vehicle created.'));
    }

    public function edit(Request $request, Vehicle $vehicle): Response|RedirectResponse
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        $vehicle->load(['device', 'tags']);

        $tags = $request->user()->tags()->orderBy('name')->get(['id', 'name', 'color'])->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'color' => $t->color,
        ])->values()->all();

        return Inertia::render('vehicles/edit', [
            'vehicle' => [
                'id' => $vehicle->id,
                'name' => $vehicle->name,
                'brand' => $vehicle->brand,
                'type' => $vehicle->type,
                'line' => $vehicle->line,
                'plate' => $vehicle->plate,
                'color' => $vehicle->color,
                'tag_ids' => $vehicle->tags->pluck('id')->values()->all(),
                'device' => $vehicle->device ? [
                    'id' => $vehicle->device->id,
                    'identifier' => $vehicle->device->identifier,
                    'name' => $vehicle->device->name,
                    'status' => $vehicle->device->status,
                ] : null,
            ],
            'tags' => $tags,
        ]);
    }

    public function update(Request $request, Vehicle $vehicle): RedirectResponse
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:100',
            'type' => 'nullable|string|max:100',
            'line' => 'nullable|string|max:100',
            'plate' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'integer|exists:tags,id',
        ]);

        $vehicle->update([
            'name' => $validated['name'],
            'brand' => filled($validated['brand'] ?? null) ? $validated['brand'] : null,
            'type' => filled($validated['type'] ?? null) ? $validated['type'] : null,
            'line' => filled($validated['line'] ?? null) ? $validated['line'] : null,
            'plate' => filled($validated['plate'] ?? null) ? $validated['plate'] : null,
            'color' => filled($validated['color'] ?? null) ? $validated['color'] : null,
        ]);

        $tagIds = $validated['tag_ids'] ?? [];
        $allowedTagIds = $request->user()->tags()->whereIn('id', $tagIds)->pluck('id')->all();
        $vehicle->tags()->sync($allowedTagIds);

        return redirect()->route('vehicles.index')->with('success', __('Vehicle updated.'));
    }

    public function assignDevice(Request $request, Vehicle $vehicle): RedirectResponse
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'device_id' => 'nullable|exists:devices,id',
        ]);

        $deviceId = $validated['device_id'] ?? null;

        if ($deviceId) {
            // Ensure the device belongs to this user
            $allowed = Device::where('id', $deviceId)
                ->where('user_id', $request->user()->id)
                ->exists();

            if (! $allowed) {
                return redirect()->route('vehicles.index')->with('error', __('Device not available.'));
            }

            // One device should belong to one vehicle: detach from user's other vehicles first
            $request->user()->vehicles()->where('device_id', $deviceId)->update(['device_id' => null]);
        }

        $vehicle->update(['device_id' => $deviceId]);

        return redirect()->route('vehicles.index')->with('success', __('Device assignment updated.'));
    }

    public function destroy(Request $request, Vehicle $vehicle): RedirectResponse
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        $vehicle->delete();

        return redirect()->route('vehicles.index')->with('success', __('Vehicle deleted.'));
    }

    public function storeDevice(Request $request, Vehicle $vehicle): RedirectResponse
    {
        if ($vehicle->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'identifier' => 'required|string|max:255|unique:devices,identifier',
            'name' => 'nullable|string|max:255',
        ]);

        $device = Device::create([
            'identifier' => $validated['identifier'],
            'name' => $validated['name'] ?? null,
        ]);

        $vehicle->update(['device_id' => $device->id]);

        return redirect()->route('vehicles.index')->with('success', __('GPS device added.'));
    }

    public function updateDevice(Request $request, Vehicle $vehicle, Device $device): RedirectResponse
    {
        if ($vehicle->user_id !== $request->user()->id || $vehicle->device_id != $device->id) {
            abort(403);
        }

        $validated = $request->validate([
            'identifier' => 'required|string|max:255|unique:devices,identifier,' . $device->id,
            'name' => 'nullable|string|max:255',
        ]);

        $device->update([
            'identifier' => $validated['identifier'],
            'name' => $validated['name'] ?? null,
        ]);

        return redirect()->route('vehicles.index')->with('success', __('GPS device updated.'));
    }

    public function destroyDevice(Request $request, Vehicle $vehicle, Device $device): RedirectResponse
    {
        if ($vehicle->user_id !== $request->user()->id || $vehicle->device_id != $device->id) {
            abort(403);
        }

        $vehicle->update(['device_id' => null]);

        return redirect()->route('vehicles.index')->with('success', __('GPS device removed.'));
    }
}
