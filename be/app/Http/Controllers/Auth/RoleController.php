<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name'
        ]);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);
        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id
        ]);

        $role->update(['name' => $request->name]);
        return response()->json([
            'message' => 'Role updated successfully',
            'role' => $role,
        ]);
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return response()->json(['message' => 'Role deleted']);
    }
}
