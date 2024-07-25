<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;
    protected $fillable = [
        'tag', 'property', 'center', 'zoom', 'title', 'description', 'likes',
        'price', 'isHistorical', 'audioUrl'
    ];

    protected $casts = [
        'center' => 'array',
        'price' => 'boolean',
        'isHistorical' => 'boolean',
    ];
}


