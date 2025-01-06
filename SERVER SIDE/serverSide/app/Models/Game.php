<?php

namespace App\Models;

use App\Models\Score;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $table = 'games';

    protected $fillable = ['slug', 'title', 'description', 'created_by'];


    public function users(){
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scores(){
        return $this->hasMany(Score::class, 'user_id', 'id');
    }

    public function latestVersion(){
        return $this->hasOne(Version::class)->latest();
    }
    public function version(){
        return $this->hasMany(Version::class);
    }

}
