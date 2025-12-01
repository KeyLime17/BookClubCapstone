<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Helper to get the Eloquent User model for the current auth user.
     */
    protected function currentUserModel(Request $request): User
    {
        $authUser = $request->user(); // could be GenericUser or User

        // Get numeric ID from whatever guard is using
        $id = method_exists($authUser, 'getAuthIdentifier')
            ? $authUser->getAuthIdentifier()
            : ($authUser->id ?? null);

        return User::findOrFail($id);
    }

    public function update(Request $request)
    {
        $user = $this->currentUserModel($request);

        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->fill($data)->save();

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $user = $this->currentUserModel($request);

        $data = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->password = Hash::make($data['password']);
        $user->save();

        return back()->with('success', 'Password updated.');
    }

    public function destroy(Request $request)
    {
        $user = $this->currentUserModel($request);

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Your account has been deleted.');
    }
}
