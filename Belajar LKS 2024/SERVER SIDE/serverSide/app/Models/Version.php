<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Version extends Model
{
    protected $table = 'game_versions';

    public function game(){
        return $this->belongsTo(Game::class);
    }

    public function score(){
        return $this->hasMany(Score::class);
    }

}
