<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Book;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Loan>
 */
class LoanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $borrowedAt = $this->faker->dateTimeBetween('now', '+2 days');
        $returnDate = (clone $borrowedAt)->modify('+' . rand(1, 7) . ' days');

        $book = Book::inRandomOrder()->first();

        if (!$book) {
            return [];
        }

        return [
            'user_id'     => User::inRandomOrder()->value('id'),
            'book_id'     => $book->id,
            'borrowed_at' => $borrowedAt,
            'return_date' => $returnDate,
            'status'      => $this->faker->randomElement(['borrowed', 'returned']),
            'quantity'    => $this->faker->numberBetween(1, $book->stock),
        ];
    }
}
