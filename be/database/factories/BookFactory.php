<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'    => $this->faker->sentence(3),
            'author'   => $this->faker->name,
            'stock'    => $this->faker->numberBetween(1, 10),
            'cover'    => "https://picsum.photos/200/300?random=" . $this->faker->unique()->numberBetween(1, 1000),
            'harga'   => $this->faker->numberBetween($min = 1500, $max = 100000),
        ];
    }
}
