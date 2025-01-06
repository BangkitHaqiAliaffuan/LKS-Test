<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the user is authenticated
        if (Auth::check()) {
            $admin = Admin::where('username', Auth::user()->username)->first();

            if ($admin) {
                return $next($request);
            }

            return response()->json([
                'status' => false,
                'message' => 'Access denied: You are not an admin.'
            ], Response::HTTP_FORBIDDEN);
        }

        return response()->json([
            'status' => false,
            'message' => 'Authentication required.'
        ], Response::HTTP_UNAUTHORIZED);
    }
}
