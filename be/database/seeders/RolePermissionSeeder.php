<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'edit users']);
        Permission::create(['name' => 'delete users']);

        $admin = Role::create(['name' => 'admin']);
        $user = Role::create(['name' => 'user']);

        $admin->givePermissionTo(Permission::all());

        $admin = \App\Models\User::first();
        $admin->assignRole('admin');
    }
}
