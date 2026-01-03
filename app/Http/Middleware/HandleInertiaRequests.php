<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\User;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => function () use ($request) {
                    $u = $request->user();
                    if (!$u) return null;

                    return [
                        'id'           => $u->id ?? null,
                        'name'         => $u->name ?? null,
                        'email'        => $u->email ?? null,
                        'is_admin'     => $u->is_admin ?? false,
                        'is_submitter' => $u->is_submitter ?? false,
                        'is_banned'    => $u->is_banned ?? false,
                        'muted_until'  => $u->muted_until ?? null,
                    ];
                },

                'unreadNotifications' => function () use ($request) {
                    $u = $request->user();
                    if (!$u || empty($u->id)) return [];

                    // Re-load as Eloquent model so notifications relationship exists
                    $user = User::find($u->id);
                    if (!$user) return [];

                    return $user->unreadNotifications()
                        ->latest()
                        ->take(10)
                        ->get()
                        ->map(fn ($n) => [
                            'id'         => $n->id,
                            'created_at' => $n->created_at,
                            'data'       => $n->data,
                        ]);
                },
            ],
        ]);
    }
}
