<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookResource extends JsonResource
{
    public function toArray($request)
    {
        $cover = $this->cover;

        if ($cover) {
            if (!Str::startsWith($cover, ['http://', 'https://'])) {
                $cover = asset(Storage::url($cover));
            }
        }

        return [
            'id'        => $this->id,
            'title'     => $this->title,
            'author'    => $this->author,
            'stock'     => $this->stock,
            'borrowed'  => $this->loans()->where('status', 'borrowed')->sum('quantity'),
            'available' => $this->availableStock(),
            'cover'     => $cover,
            'harga'     => $this->harga,
            'created_at'     => $this->created_at->format('d/m/y - H:i'),
            'terjual'   => $this->when(
                isset($this->total_borrowed),
                $this->total_borrowed, // hasil withSum('loans as total_borrowed',...)
                fn() => $this->loans()->where('status', 'borrowed')->sum('quantity')
            ),
        ];
    }
}
