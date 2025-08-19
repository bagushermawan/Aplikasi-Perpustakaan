<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Loan;
use Carbon\Carbon;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        Loan::factory()->count(25)->create();
    }
}
