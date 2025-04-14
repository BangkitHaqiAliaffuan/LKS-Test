<?php

namespace App\Http\Controllers;

use App\Models\Game;

use App\Models\Score;
use App\Models\Version;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GameController extends Controller
{
    public function showGames(Request $request)
    {
        $pageSize = max(1, (int)$request->input('size', 10));
        $page = max(0, (int)$request->input('page', 0));
        $sortBy = strtolower(trim($request->input('sortBy', 'title')));
        $sortDir = strtolower(trim($request->input('sortDir', 'asc')));

        if (!in_array($sortBy, ['title', 'popular', 'uploaddate']) || !in_array($sortDir, ['asc', 'desc'])) {
            return response()->json(['error' => 'Invalid parameters'], 400);
        }

        $gamesQuery = Game::select('slug', 'title', 'description', 'created_by')
            ->addSelect([
                'scores_count' => Score::selectRaw('COUNT(*)')
                    ->whereColumn('games.id', 'scores.user_id')
                    ->whereNotNull('user_id'),
            ])
            ->with(['latestVersion' => function ($query) {
                $query->select('game_id');
            }])
            ->whereHas('latestVersion');

        if ($sortBy === 'popular') {
            // Sort by scores_count if sorting by popularity
            $gamesQuery->orderBy('scores_count', $sortDir);
        } else {
            // Sort by the specified field
            $gamesQuery->orderBy($sortBy, $sortDir);
        }

        $games = $gamesQuery->paginate($pageSize);

        return response()->json([
            'page' => $page,
            'size' => count($games),
            'totalElements' => $games->total(),
            'content' => $games->items(),
            'pageCount' => ceil($games->total() / $pageSize),
            'isLastPage' => ($page + 1) * $pageSize >= $games->total(),
        ]);
    }

    public function createGame(Request $request)
    {


        if (Auth::check()) {
            $user = Auth::user();
            $userId = $user->id;
        }


        $validator = Validator::make($request->all(), [
            'title' => 'required|min:3|max:60|',
            'description' => 'required|min:0|max:200',
        ]);



        if ($validator->fails()) {
            return response()->json([
                'status' => 'fail',
                'error' => $validator->errors()
            ]);
        }



        $gameSlug = Str::slug($request->title, '-');


        if (Game::where('slug', $gameSlug)->exists()) {
            return response()->json([
                'status' => 'invalid',
                'slug' => 'title has been already taken',
            ]);
        }


        $game = new Game();
        $game->title = $request->title;
        $game->description = $request->description;
        $game->slug = $gameSlug;
        $game->created_by = $userId;
        $game->save();


        return response()->json([
            'status' => 'success',
            'slug' => $gameSlug,
        ]);
    }

    public function showGameSlug($slug)
    {
        $game = Game::where('slug', $slug)->first();

        return response()->json([
            'data' => $game
        ]);
    }


    public function uploadGameFile(Request $request, $slug)
    {
        $token = $request->input('token');
        if (!$token) {
            return response('Invalid session token', 403);
        }

        $game = Game::where('slug', $slug)->first();
        if (!$game) {
            return response('Game not found', 404);
        }

        $user = Auth::user();
        $userId = $user->id;

        if ($game->created_by !== $userId) {
            return response('Unauthorized action', 403);
        }

        if (!$request->hasFile('zipFile')) {
            return response('No file uploaded', 400);
        }

        $file = $request->file('zipFile');

        if ($file->getClientOriginalExtension() !== 'zip') {
            return response('Invalid file type. Only zip files are allowed', 400);
        }

        if ($file->getSize() > 1024 * 1024 * 10) {
            return response('File size exceeds the maximum limit of 10MB', 400);
        }

        $lastVersion = Version::latest('created_at')->first();
        if ($lastVersion) {
            $currentVersion = (int) filter_var($lastVersion->version, FILTER_SANITIZE_NUMBER_INT);
            $newVersion = 'v' . ($currentVersion + 1);
        } else {
            $newVersion = 'v1';
        }

        $path = $file->storeAs("games/{$game->id}/{$newVersion}", "{$slug}_{$newVersion}.zip");

        $gameVersion = new Version();
        $gameVersion->game_id = $game->id;
        $gameVersion->version = $newVersion;
        $gameVersion->storage_path = $path;
        $gameVersion->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Game file uploaded successfully',
            'version' => $newVersion,
            'file_path' => Storage::url($path),
        ]);
    }

    public function deleteGame($slug)
    {
        $game = Game::where('slug', $slug)->first();
        $user = Auth::user();
        $userId = $user->id;

        if ($game->created_by !== $userId) {
            return response()->json([
                'status' => 'forbidden',
                'message' => 'You are not the game author'
            ]);
        }
        Score::where('game_version_id', $game->id)->delete();
        Version::where('game_id', $game->id)->delete();
        $game->delete();
        return response()->json([
            'status' => 'sukses',
            'message' => 'work min'
        ]);
    }

    public function postScores(Request $request, $slug)
    {

        $game = Game::where('slug', $slug)->first();

        $latestversion = $game->version()->latest()->first();

        $user = Auth::user();
        $userId = $user->id;

        $validator = Validator::make($request->all(), [
            'score' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'failed',
                'error' => $validator->errors()
            ]);
        }

        $score = new Score();
        $score->score = $request->score;
        $score->game_version_id = $latestversion->id;
        $score->user_id = $userId;
        $score->save();

        return response()->json([
            'status' => 'success'
        ]);
    }
}
