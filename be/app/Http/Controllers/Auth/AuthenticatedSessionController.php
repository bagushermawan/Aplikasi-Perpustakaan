<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): Response
    {

        error_log('========= DEBUG LOGIN =========');
        error_log('SESSION ALL: ' . json_encode(session()->all()));
        error_log('HEADERS: ' . json_encode(request()->headers->all()));
        error_log('X-XSRF-TOKEN HEADER: ' . request()->header('X-XSRF-TOKEN'));
        error_log('INPUT _token: ' . request()->input('_token'));
        error_log('========= END DEBUG =========');
        $request->authenticate();

        $request->session()->regenerate();

        return response()->noContent();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
