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
            'borrowed'  => $this->loans()->where('status', 'borrowed')->count(),
            'available' => $this->availableStock(),
            'cover'     => $cover,
        ];
    }
}
