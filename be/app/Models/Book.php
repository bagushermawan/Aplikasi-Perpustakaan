<?php

namespace App\Models;

use App\Models\Loan;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = ['title', 'author', 'stock'];
    
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}
