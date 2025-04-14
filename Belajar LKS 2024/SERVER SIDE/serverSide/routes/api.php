<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;
use App\Models\Game;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/v1/auth/signin', [UserController::class, 'login']);
Route::post('/v1/auth/signup', [UserController::class, 'register']);


Route::middleware(['auth:sanctum', 'admin'])->group(function(){
    Route::get('/v1/admins', [UserController::class, 'getAdmins']);
    Route::get('/v1/users', [UserController::class, 'getUser']);
    Route::put('/v1/users/{id}', [UserController::class, 'updateUser']);
    Route::delete('/v1/users/{id}', [UserController::class, 'deleteUser']);
    Route::get('/v1/games', [GameController::class, 'showGames']);
    Route::post('/v1/games', [GameController::class, 'createGame']);
    Route::get('/v1/games/{slug}', [GameController::class, 'showGameSlug']);
});

Route::middleware('auth:sanctum')->group(function(){
    Route::post('/v1/auth/signout', [UserController::class, 'logout']);
    Route::post('/v1/games/{slug}/upload', [GameController::class, 'uploadGameFile']);
    Route::delete('/v1/games/{slug}', [GameController::class, 'deleteGame']);
    Route::get('/v1/users/{username}', [UserController::class, 'showDetails']);
    Route::get('/v1/games/{slug}/scores', [UserController::class, 'playerHighscores']);
    Route::post('/v1/games/{slug}/scores', [GameController::class, 'postScores']);
});





Route::fallback(function () {
    return response()->json(['message' => 'Not Found Path'], 404);
});
