<?php

namespace App\Policies;

use App\Models\CareSession;
use App\Models\User;

class CareSessionPolicy
{
    public function view(User $user, CareSession $careSession): bool
    {
        return $careSession->user_id === $user->id;
    }

    public function update(User $user, CareSession $careSession): bool
    {
        return $careSession->user_id === $user->id;
    }

    public function delete(User $user, CareSession $careSession): bool
    {
        return $careSession->user_id === $user->id;
    }
}
