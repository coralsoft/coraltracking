<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        return Inertia::render('devices/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string|max:255|unique:devices,identifier',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'model' => 'nullable|string|max:100',
        ]);

        Device::create([
            'user_id' => $request->user()->id,
            'identifier' => $validated['identifier'],
            'name' => $validated['name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'model' => $validated['model'] ?? null,
        ]);

        return redirect()->route('vehicles.index')->with('success', __('Device created.'));
    }
}
