<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json([]);
        }

        $users = User::query()
            ->select('id', 'name')
            ->where('name', 'like', "%{$q}%")
            ->orderBy('name')
            ->limit(8)
            ->get();

        return response()->json($users);
    }
}
?>