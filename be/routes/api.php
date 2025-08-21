<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Auth\RoleController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Auth\PermissionController;
use App\Http\Controllers\Api\UserManagementController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->get('/auth/user', function (Request $request) {
    $user = $request->user();

    return response()->json([
        'id'         => $user->id,
        'name'       => $user->name,
        'email'      => $user->email,
        'role'       => $user->getRoleNames()->first(),
        'avatar'     => $user->avatar, // simpan path relativenya
        'avatar_url' => $user->avatar
            ? asset(Storage::url($user->avatar))
            : null,
    ]);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/profile', [UserController::class, 'show']);
    Route::put('/user/profile', [UserController::class, 'update']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('permissions', PermissionController::class);
});

Route::prefix('perpus')->middleware(['auth:sanctum', 'role:admin|user'])->group(function () {
    Route::get('/users/all', [UserManagementController::class, 'all']);
    Route::get('/books/all', [BookController::class, 'all']);
    Route::apiResource('users', UserManagementController::class);
    Route::apiResource('books', BookController::class);
    Route::apiResource('loans', LoanController::class);
});
