<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'       => $this->id,
            'title'    => $this->title,
            'author'   => $this->author,
            'stock'    => $this->stock,
            'borrowed' => $this->loans()->where('status', 'borrowed')->count(),
            'available' => $this->availableStock(),
        ];
    }
}
