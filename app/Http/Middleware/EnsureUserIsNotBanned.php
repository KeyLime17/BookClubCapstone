<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        // Let guests through
        if (!$request->user()) {
            return $next($request);
        }

        // Don't block the banned page itself or logout
        if ($request->routeIs('banned') || $request->routeIs('logout')) {
            return $next($request);
        }

        if ($request->user()->is_banned ?? false) {
            // Log them out and send to banned page
            auth()->logout();

            // invalidate session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('banned');
        }

        return $next($request);
    }
}
