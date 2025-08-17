<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // pastikan role 'user' sudah ada
        Role::firstOrCreate(['name' => 'user']);
        Role::firstOrCreate(['name' => 'admin']);

        $users = [
            ['name' => 'her', 'email' => 'her@her', 'role' => 'admin'],
            ['name' => 'John Doe', 'email' => 'john@example.com', 'role' => 'user'],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'role' => 'user'],
            ['name' => 'user xxx', 'email' => 'userxx@example.com', 'role' => 'user'],
        ];

        foreach ($users as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make('123'),
            ]);

            // assign role sesuai
            $user->assignRole($u['role']);
        }
    }
}
