<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\User;
use App\Models\Admin;
use App\Models\Score;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use function Laravel\Prompts\select;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Validated;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{

    public function logout(Request $request)
    {
        // Get the authenticated user
        $user = Auth::user();

        if ($user) {
            // Revoke the user's current token
            $user->currentAccessToken()->delete();

            return response()->json([
                'status' => true,
                'message' => 'Logout Successfully'
            ]);
        }


        return response()->json([
            'status' => false,
            'message' => 'Logout Failed'
        ], 403);
    }
    public function register(Request $request)
    {


        $validator = Validator::make($request->all(), [
            'username' => 'required|min:3|unique:users,username|max:60',
            'password' => 'required|min:8|max:10'
        ]);

        if ($validator->fails()) {

            return response()->json([
                'status' => false,
                'message' => 'Error In The Field(s)',
                'error' => $validator->errors(),
            ]);
        }


        $user = new User();
        $user->username = $request->username;
        $user->password = bcrypt($request->password);
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Success',
            'data' => $user
        ]);
    }



    public function login(Request $request)
    {
        $credentials = [
            'username' => $request->username,
            'password' => $request->password,
        ];


        $admin = Admin::where('username', $request->username)->first();

        if ($admin && Hash::check($request->password, $admin->password)) {
            $token = $admin->createToken('myToken')->plainTextToken;
            return response()->json([
                'status' => 'success',
                'data' => $token
            ]);
        }

        $username = $request->username;

        if (!Auth::attempt($credentials)) {
            if (!User::where('username', $username)->exists()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Username Not Exist',
                ]);
            }
            return response()->json([
                'status' => false,
                'message' => 'Login Failed, Password Or Username Wrong',
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('myToken')->plainTextToken;



        return response()->json([
            'status' => 'success',
            'data' => $token
        ]);
    }


    public function getAdmins()
    {
        $getAdmin = Admin::all();

        return response()->json([
            'status' => 'success',
            'data' => $getAdmin
        ]);
    }

    public function getUser()
    {
        $getUser = User::all();

        return response()->json([
            'status' => 'success',
            'data' => $getUser
        ]);
    }

    public function updateUser($id, Request $request)
    {



        $user = User::find($id);


        if ($user) {
            $validator = Validator::make($request->all(), [
                'username' => 'string|min:4|max:60|unique:users,username',
                'password' => 'min:5|max:10',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Error In The Field(s)',
                    'error' => $validator->errors()
                ]);
            }

            $username = $request->username;
            $password = $request->password;

            if ($username === null) {
                $user->update([
                    'password' => $request->password
                ]);
                return response()->json([
                    'status' => true,
                    'message' => 'Success Update Password Only',

                ]);
            }


            $user->update([
                'username' => $request->username,
                'password' => $request->password
            ]);


            return response()->json([
                'status' => true,
                'data' => $username
            ]);
        }


        return response()->json([
            'status' => 'Not Found',
            'message' => 'User Not Found'
        ]);
    }

    public function deleteUser($id)
    {

        $user = User::find($id);
        if ($user) {
            Game::where('created_by', $user->id)->delete();
            $user->delete();
        }

        return response()->json([
            'status' => 'Not Found',
            'message' => 'User Not Found'
        ]);
    }



    public function showDetails($usernameParam){
       $user =  User::where('username', $usernameParam)->first();

       if(!$user){
        return response()->json([
            'status' => 'failed',
            'data' => 'User Not Found'
        ]);
       }

       $authtoredGames = $user->games()->get();
       $scores = $user->scores()->with('game')->get();

       return response()->json([
        'username' => $user->username,
        'registeredTimeStamp' => $user->created_at,
        'authoredGames' => $authtoredGames,
        'highscores' => $scores
       ]);


    }

    public function playerHighscores($slug){

        $game = Game::where('slug', $slug)->firstOrFail();


        $scores = Score::with('user')
        ->where('game_version_id', $game->id)
        ->select('user_id', DB::raw('MAX(score) as score'))
        ->groupBy('user_id')
        ->orderBy('score', 'desc')
        ->get()
        ->map(function($scores){
            return [
                'username' => $scores->user->username,
                'score' => $scores->score,
                'timestamp' => $scores->updated_at
            ];
        });

        return response()->json([
            'scores' => $scores
        ]);
    }
}
