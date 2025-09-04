<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Book;
use App\Models\User;
use App\Models\Loan;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $books = Book::all();

        $maxLoans = 1000;
        $loanCount = 0;

        // Simpan stok sementara
        $stockLeft = $books->pluck('stock', 'id')->toArray();

        // Pilih 20% random buku yg boleh habis
        $allowEmpty = $books->random(max(1, floor($books->count() * 0.2)))
            ->pluck('id')
            ->toArray();

        echo "📚 Books allowed to be empty: " . implode(', ', $allowEmpty) . "\n";

        // Loop dengan batas
        for ($i = 0; $i < $maxLoans; $i++) {
            // Cari kandidat buku yg masih bisa dipinjam
            $availableBooks = $books->filter(function ($book) use ($stockLeft, $allowEmpty) {
                $remaining = $stockLeft[$book->id];
                return $remaining > 0 &&
                    (in_array($book->id, $allowEmpty) || $remaining >= 20);
            });

            // Kalau sudah tidak ada buku yg valid → stop
            if ($availableBooks->isEmpty()) {
                echo "⛔ Seeder stopped early: semua stok habis / tidak valid.\n";
                break;
            }

            // Random pilih dari kandidat valid
            $book = $availableBooks->random();
            $remaining = $stockLeft[$book->id];

            // 70% borrowed, 30% returned
            $status = fake()->boolean(70) ? 'borrowed' : 'returned';

            if ($status === 'borrowed') {
                $maxQty = in_array($book->id, $allowEmpty)
                    ? $remaining
                    : max(1, $remaining - 20);

                $qty = rand(1, min($remaining, $maxQty));
                $stockLeft[$book->id] -= $qty; // kurangi stok
            } else {
                $qty = rand(1, 5);
            }

            Loan::factory()->create([
                'user_id'  => $users->random()->id,
                'book_id'  => $book->id,
                'quantity' => $qty,
                'status'   => $status,
            ]);

            $loanCount++;

            if ($loanCount % 100 === 0) {
                echo "✅ Progress: {$loanCount} loans created...\n";
            }
        }

        echo "🎉 Total loans created: {$loanCount}\n\n";
    }
}
