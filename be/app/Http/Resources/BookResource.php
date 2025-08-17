<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'     => $this->id,
            'title'  => $this->title,
            'author' => $this->author,
            'stock'  => $this->stock,
            'created_at' => $this->created_at->format('d-m-Y'),
        ];
    }
}
