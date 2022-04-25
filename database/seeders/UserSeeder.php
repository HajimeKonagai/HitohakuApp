<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
	{
		User::truncate();

		$users = [
			[
				'name' => '',
				'email' => '',
			],
		];

		foreach ($users as $user)
		{
			User::create([
				'name' => $user['name'],
				'email' => $user['email'],
				'password' => Hash::make(''),
			]);
		}
    }
}

