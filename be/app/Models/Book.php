<?php

namespace App\Models;

use App\Models\Loan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Book extends Model
{
    use HasFactory;

    protected $appends = ['final_price', 'harga_formatted', 'final_price_formatted'];

    protected $fillable = ['title', 'cover', 'author', 'stock', 'harga', 'discount'];

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function borrowedLoans()
    {
        return $this->hasMany(Loan::class)->where('status', 'borrowed');
    }

    public function availableStock()
    {
        $borrowedQty = $this->loans()
            ->where('status', 'borrowed')
            ->sum('quantity');

        return $this->stock - $borrowedQty;
    }

    // ✅ Harga formatted
    public function getHargaFormattedAttribute()
    {
        $value = $this->attributes['harga'];

        if (fmod($value, 1) == 0) {
            return number_format($value, 0, ',', '.');
        }

        return number_format($value, 2, ',', '.');
    }

    // ✅ Final Price numeric
    public function getFinalPriceAttribute()
    {
        $harga = $this->attributes['harga'];

        if ($this->discount && $this->discount > 0) {
            return round($harga * (1 - $this->discount / 100), 2);
        }

        return $harga;
    }

    // ✅ Final Price formatted
    public function getFinalPriceFormattedAttribute()
    {
        $value = $this->final_price;

        if (fmod($value, 1) == 0) {
            return number_format($value, 0, ',', '.');
        }

        return number_format($value, 2, ',', '.');
    }
}
