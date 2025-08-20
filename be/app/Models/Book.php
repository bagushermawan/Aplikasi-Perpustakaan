<?php

namespace App\Models;

use App\Models\Loan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Book extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'cover', 'author', 'stock', 'harga'];

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function availableStock()
    {
        $borrowedQty = $this->loans()
            ->where('status', 'borrowed')
            ->sum('quantity');

        return $this->stock - $borrowedQty;
    }
}
