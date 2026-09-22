<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    public function view(User $user, Patient $patient): bool
    {
        return $patient->user_id === $user->id;
    }

    public function update(User $user, Patient $patient): bool
    {
        return $patient->user_id === $user->id;
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $patient->user_id === $user->id;
    }
}
