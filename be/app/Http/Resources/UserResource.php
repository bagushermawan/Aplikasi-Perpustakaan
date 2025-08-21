<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $avatar = $this->avatar;

        if ($avatar) {
            if (!Str::startsWith($avatar, ['http://', 'https://'])) {
                $avatar = asset(Storage::url($avatar));
            }
        }

        return [
            'id'    => $this->id,
            'avatar_url'  => $avatar,
            'name'  => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at->format('d-m-Y'),
        ];
    }
}

