<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function index(Request $request): Response
    {
        $tags = $request->user()
            ->tags()
            ->orderBy('name')
            ->get()
            ->map(fn (Tag $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'color' => $t->color,
                'vehicles_count' => $t->vehicles()->count(),
            ])
            ->values()
            ->all();

        return Inertia::render('tags/index', [
            'tags' => $tags,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|in:blue,red,green,amber,violet,cyan',
        ]);

        $request->user()->tags()->create([
            'name' => $validated['name'],
            'color' => filled($validated['color'] ?? null) ? $validated['color'] : null,
        ]);

        return redirect()->route('tags.index')->with('success', __('Tag created.'));
    }

    public function update(Request $request, Tag $tag): RedirectResponse
    {
        if ($tag->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|in:blue,red,green,amber,violet,cyan',
        ]);

        $tag->update([
            'name' => $validated['name'],
            'color' => filled($validated['color'] ?? null) ? $validated['color'] : null,
        ]);

        return redirect()->route('tags.index')->with('success', __('Tag updated.'));
    }

    public function destroy(Request $request, Tag $tag): RedirectResponse
    {
        if ($tag->user_id !== $request->user()->id) {
            abort(403);
        }

        $tag->delete();

        return redirect()->route('tags.index')->with('success', __('Tag deleted.'));
    }
}
