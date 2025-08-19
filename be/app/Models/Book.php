<?php

namespace App\Models;

use App\Models\Loan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Book extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'author', 'stock'];

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function availableStock()
    {
        $borrowedCount = $this->loans()->where('status', 'borrowed')->count();
        return $this->stock - $borrowedCount;
    }
}
