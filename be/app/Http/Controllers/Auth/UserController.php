<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Ambil data user login
     */
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update profile (name, email, password)
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:3|confirmed',
            'avatar'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // 1. Password
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        unset($data['password']);

        // 2. Avatar
        if ($request->hasFile('avatar')) {
            // hapus lama
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            // upload baru
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;

            // buang field avatar mentah dari $data supaya tidak overwrite lagi
            unset($data['avatar']);
        }

        // 3. Update field name/email saja
        $user->fill($data);
        $user->save();

        // 4. Response
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar, // "avatars/xyz.png"
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            ],
        ]);
    }
}
