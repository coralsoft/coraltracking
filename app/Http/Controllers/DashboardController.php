<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Position;
use App\Models\Tag;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const EARTH_RADIUS_KM = 6371;

    private function haversineDistanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);
        $dLat = $lat2 - $lat1;
        $dLon = $lon2 - $lon1;
        $a = sin($dLat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_KM * $c;
    }

    /**
     * @return array<int, array{vehicle_id: int, vehicle_name: string, plate: string|null, total_km: float, avg_speed_kmh: float|null, max_speed_kmh: float|null, positions_count: int}>
     */
    private function getVehicleStatsForPeriod(Request $request, Carbon $from): array
    {
        $user = $request->user();
        $vehicles = $user->vehicles()->with('device')->get();
        $stats = [];

        foreach ($vehicles as $vehicle) {
            $device = $vehicle->device;
            if (! $device) {
                $stats[] = [
                    'vehicle_id' => $vehicle->id,
                    'vehicle_name' => $vehicle->name,
                    'plate' => $vehicle->plate,
                    'total_km' => 0.0,
                    'avg_speed_kmh' => null,
                    'max_speed_kmh' => null,
                    'positions_count' => 0,
                ];
                continue;
            }

            $positions = Position::where('device_id', $device->id)
                ->where('recorded_at', '>=', $from)
                ->orderBy('recorded_at')
                ->get(['latitude', 'longitude', 'speed']);

            $totalKm = 0.0;
            $speeds = [];
            $maxSpeed = null;

            for ($i = 1; $i < $positions->count(); $i++) {
                $prev = $positions->get($i - 1);
                $curr = $positions->get($i);
                $totalKm += $this->haversineDistanceKm(
                    (float) $prev->latitude,
                    (float) $prev->longitude,
                    (float) $curr->latitude,
                    (float) $curr->longitude,
                );
            }

            foreach ($positions as $p) {
                if ($p->speed !== null) {
                    $s = (float) $p->speed;
                    $speeds[] = $s;
                    $maxSpeed = $maxSpeed === null ? $s : max($maxSpeed, $s);
                }
            }

            $avgSpeed = count($speeds) > 0 ? array_sum($speeds) / count($speeds) : null;

            $stats[] = [
                'vehicle_id' => $vehicle->id,
                'vehicle_name' => $vehicle->name,
                'plate' => $vehicle->plate,
                'total_km' => round($totalKm, 2),
                'avg_speed_kmh' => $avgSpeed !== null ? round($avgSpeed, 2) : null,
                'max_speed_kmh' => $maxSpeed !== null ? round($maxSpeed, 2) : null,
                'positions_count' => $positions->count(),
            ];
        }

        return $stats;
    }

    private function getVehiclesForUser(Request $request, ?array $tagIds = null): array
    {
        $query = $request->user()
            ->vehicles()
            ->with('device');

        if (! empty($tagIds)) {
            $query->whereHas('tags', fn ($q) => $q->whereIn('tags.id', $tagIds));
        }

        return $query->get()
            ->map(function (Vehicle $v) {
                $device = $v->device;
                return [
                    'id' => $v->id,
                    'name' => $v->name,
                    'plate' => $v->plate,
                    'color' => $v->color,
                    'device' => $device ? [
                        'id' => $device->id,
                        'identifier' => $device->identifier,
                        'name' => $device->name,
                        'last_latitude' => $device->last_latitude ? (float) $device->last_latitude : null,
                        'last_longitude' => $device->last_longitude ? (float) $device->last_longitude : null,
                        'last_recorded_at' => $device->last_recorded_at?->toIso8601String(),
                        'status' => $device->status,
                        'last_speed' => $device->last_speed ? (float) $device->last_speed : null,
                        'last_heading' => $device->last_heading,
                    ] : null,
                ];
            })
            ->values()
            ->all();
    }

    private function getTagsForUser(Request $request): array
    {
        return $request->user()
            ->tags()
            ->orderBy('name')
            ->get(['id', 'name', 'color'])
            ->map(fn (Tag $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'color' => $t->color,
            ])
            ->values()
            ->all();
    }

    /**
     * Devices owned by the user that are not linked to any vehicle (for monitoring/history by device).
     */
    private function getStandaloneDevicesForUser(Request $request): array
    {
        return Device::where('user_id', $request->user()->id)
            ->whereDoesntHave('vehicle')
            ->orderBy('identifier')
            ->get()
            ->map(function (Device $d) {
                return [
                    'id' => $d->id,
                    'name' => $d->name ?? $d->identifier,
                    'plate' => null,
                    'color' => null,
                    'is_standalone_device' => true,
                    'device' => [
                        'id' => $d->id,
                        'identifier' => $d->identifier,
                        'name' => $d->name,
                        'last_latitude' => $d->last_latitude ? (float) $d->last_latitude : null,
                        'last_longitude' => $d->last_longitude ? (float) $d->last_longitude : null,
                        'last_recorded_at' => $d->last_recorded_at?->toIso8601String(),
                        'status' => $d->status,
                        'last_speed' => $d->last_speed ? (float) $d->last_speed : null,
                        'last_heading' => $d->last_heading,
                    ],
                ];
            })
            ->values()
            ->all();
    }

    public function index(Request $request): Response
    {
        $vehicles = $this->getVehiclesForUser($request);
        $statsLast7Days = $this->getVehicleStatsForPeriod($request, Carbon::now()->subDays(7));
        $statsLast30Days = $this->getVehicleStatsForPeriod($request, Carbon::now()->subDays(30));

        return Inertia::render('dashboard', [
            'vehicles' => $vehicles,
            'vehicleStatsLast7Days' => $statsLast7Days,
            'vehicleStatsLast30Days' => $statsLast30Days,
        ]);
    }

    public function monitoring(Request $request): Response
    {
        $tagIds = $request->input('tag_ids', []);
        if (is_string($tagIds)) {
            $tagIds = array_filter(explode(',', $tagIds));
        }
        $tagIds = array_map('intval', array_values((array) $tagIds));

        $vehicles = $this->getVehiclesForUser($request, $tagIds ?: null);
        $standaloneDevices = $this->getStandaloneDevicesForUser($request);
        $tags = $this->getTagsForUser($request);

        return Inertia::render('monitoring', [
            'vehicles' => $vehicles,
            'standaloneDevices' => $standaloneDevices,
            'tags' => $tags,
            'filterTagIds' => $tagIds,
        ]);
    }

    /**
     * JSON endpoint for monitoring map polling (updates positions every 5s).
     */
    public function monitoringPositions(Request $request)
    {
        $tagIds = $request->input('tag_ids', []);
        if (is_string($tagIds)) {
            $tagIds = array_filter(explode(',', $tagIds));
        }
        $tagIds = array_map('intval', array_values((array) $tagIds));

        $vehicles = $this->getVehiclesForUser($request, $tagIds ?: null);
        $standaloneDevices = $this->getStandaloneDevicesForUser($request);

        return response()->json([
            'vehicles' => $vehicles,
            'standaloneDevices' => $standaloneDevices,
        ]);
    }

    public function history(Request $request): Response
    {
        $tagIds = $request->input('tag_ids', []);
        if (is_string($tagIds)) {
            $tagIds = array_filter(explode(',', $tagIds));
        }
        $tagIds = array_map('intval', array_values((array) $tagIds));

        $vehicles = $this->getVehiclesForUser($request, $tagIds ?: null);
        $standaloneDevices = $this->getStandaloneDevicesForUser($request);
        $tags = $this->getTagsForUser($request);

        return Inertia::render('history', [
            'vehicles' => $vehicles,
            'standaloneDevices' => $standaloneDevices,
            'tags' => $tags,
            'filterTagIds' => $tagIds,
        ]);
    }

    /**
     * Get positions for a device on a given date (for history map).
     */
    public function positions(Request $request)
    {
        $request->validate([
            'device_id' => 'required|exists:devices,id',
            'date' => 'required|date',
        ]);

        $user = $request->user();
        $device = Device::where('id', $request->device_id)
            ->where(function ($q) use ($user) {
                $q->whereHas('vehicle', fn ($v) => $v->where('user_id', $user->id))
                    ->orWhere('user_id', $user->id);
            })
            ->firstOrFail();

        $date = $request->date;
        $start = $date . ' 00:00:00';
        $end = $date . ' 23:59:59';

        $positions = Position::where('device_id', $device->id)
            ->whereBetween('recorded_at', [$start, $end])
            ->orderBy('recorded_at')
            ->get()
            ->map(fn (Position $p) => [
                'id' => $p->id,
                'latitude' => (float) $p->latitude,
                'longitude' => (float) $p->longitude,
                'recorded_at' => $p->recorded_at->toIso8601String(),
                'speed' => $p->speed ? (float) $p->speed : null,
                'heading' => $p->heading,
            ]);

        return response()->json([
            'vehicle' => $device->vehicle ? [
                'id' => $device->vehicle->id,
                'name' => $device->vehicle->name,
                'plate' => $device->vehicle->plate,
            ] : null,
            'device' => [
                'id' => $device->id,
                'identifier' => $device->identifier,
                'name' => $device->name,
            ],
            'positions' => $positions,
        ]);
    }

    /**
     * Get positions for all devices of vehicles that have any of the given tags (for multi-vehicle history map).
     */
    public function positionsByTags(Request $request)
    {
        $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'integer|exists:tags,id',
            'date' => 'required|date',
        ]);

        $user = $request->user();
        $tagIds = $request->input('tag_ids');
        $allowedTagIds = $user->tags()->whereIn('id', $tagIds)->pluck('id')->all();
        if (empty($allowedTagIds)) {
            return response()->json(['routes' => []]);
        }

        $vehicles = $user->vehicles()
            ->with('device')
            ->whereHas('tags', fn ($q) => $q->whereIn('tags.id', $allowedTagIds))
            ->get()
            ->filter(fn (Vehicle $v) => $v->device !== null);

        $date = $request->input('date');
        $start = $date . ' 00:00:00';
        $end = $date . ' 23:59:59';

        $routes = [];
        $colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0891b2'];

        foreach ($vehicles as $index => $vehicle) {
            $device = $vehicle->device;
            if (! $device) {
                continue;
            }

            $positions = Position::where('device_id', $device->id)
                ->whereBetween('recorded_at', [$start, $end])
                ->orderBy('recorded_at')
                ->get()
                ->map(fn (Position $p) => [
                    'id' => $p->id,
                    'latitude' => (float) $p->latitude,
                    'longitude' => (float) $p->longitude,
                    'recorded_at' => $p->recorded_at->toIso8601String(),
                    'speed' => $p->speed ? (float) $p->speed : null,
                    'heading' => $p->heading,
                ])
                ->values()
                ->all();

            $routes[] = [
                'vehicle_id' => $vehicle->id,
                'vehicle_name' => $vehicle->name,
                'plate' => $vehicle->plate,
                'device_id' => $device->id,
                'color' => $colors[$index % count($colors)],
                'positions' => $positions,
            ];
        }

        return response()->json(['routes' => $routes]);
    }
}
