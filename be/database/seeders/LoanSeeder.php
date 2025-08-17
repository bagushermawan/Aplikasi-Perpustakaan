<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Loan;
use Carbon\Carbon;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        $loans = [
            [
                'user_id' => 2,
                'book_id' => 1,
                'borrowed_at' => Carbon::now()->subDays(3),
                'return_date' => Carbon::now()->addDays(7),
                'status' => 'borrowed',
            ],
            [
                'user_id' => 3,
                'book_id' => 2,
                'borrowed_at' => Carbon::now()->subDays(1),
                'return_date' => Carbon::now()->addDays(14),
                'status' => 'borrowed',
            ],
        ];

        foreach ($loans as $loan) {
            Loan::create($loan);
        }
    }
}
