<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

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
                    $u = $request->user();   // GenericUser when using 'database' provider
                    if (!$u) return null;

                    // Map the fields explicitly (avoid ->only() which is Eloquent-specific)
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
            ],
        ]);
    }
}
