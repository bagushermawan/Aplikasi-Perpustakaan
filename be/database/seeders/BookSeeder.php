<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Book;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $books = [
            ['title' => 'Laravel for Beginners', 'author' => 'Taylor Otwell', 'stock' => 5],
            ['title' => 'Mastering PHP', 'author' => 'Rasmus Lerdorf', 'stock' => 3],
            ['title' => 'JavaScript: The Good Parts', 'author' => 'Douglas Crockford', 'stock' => 4],
            ['title' => 'Clean Code', 'author' => 'Robert C. Martin', 'stock' => 2],
            ['title' => 'Database Design', 'author' => 'C. J. Date', 'stock' => 6],
        ];

        foreach ($books as $book) {
            Book::create($book);
        }
    }
}
