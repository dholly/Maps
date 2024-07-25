<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;
    protected $fillable = [
        'name', 'description', 'coordinates', 'color', 'distance', 'duration',
        'district', 'price', 'pointsOfInterest', 'imageUrl', 'likes', 'createdAt', 'steps'
    ];

    protected $casts = [
        'coordinates' => 'array',
        'pointsOfInterest' => 'array',
        'price' => 'boolean',
        'steps' => 'array',
        'createdAt' => 'date',
    ];
}
