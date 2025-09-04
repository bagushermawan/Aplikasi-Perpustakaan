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
        $her = User::create([
            'name'              => 'her',
            'email'             => 'her@her',
            'email_verified_at' => now(),
            'password'          => Hash::make('123'),
        ]);

        $her->assignRole('admin');

        User::factory()->count(12)->create();
    }
}
