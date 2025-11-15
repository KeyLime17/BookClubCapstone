<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->input('q', '');

        $users = User::query()
            ->when($q, function ($query, $q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->orderBy('name')
            ->limit(20)
            ->get([
                'id',
                'name',
                'email',
                'is_submitter',
                'is_banned',
                'muted_until',
            ]);

        return response()->json($users);
    }

}
?>