<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\PlantObservable;
use Illuminate\Validation\Rule;
use App\Rules\Hankaku;

class Plant extends Model
{
    use HasFactory;
	use PlantObservable;

	protected $primaryKey = 'number';
	public $incrementing = false;

	public function scopePublic($query)
	{
		return $query->where('is_private', false);
	}

	protected $fillable = [
		'number',
		'file_name',
		'title',
		'name',
		'en_family_name',
		'jp_family_name',
		'en_name',
		'jp_name',
		'collect_country',
		'collect_pref',
		'collect_city',
		'collect_addr',
		'collect_date',
		'collect_person',
		'collect_number',
		'rdb_country',
		'rdb_pref',
		'is_private',
	];


    protected static function rules($number = false){

		$unique = ['required','max:255', new Hankaku];
		if ($number)
		{
			$unique[] = Rule::unique('plants')->ignore($number, 'number');
		}
		else
		{
			$unique[] = Rule::unique('plants');
		}
        return [
			// 資料番号
			'number' => $unique,
			/*
			// 画像ファイル名
			'file_name' => 'required|max:255',
			// 科名（欧名）
			'en_family_name' => 'required|max:255',
			// 科名（和名）
			'jp_family_name' => 'required|max:255',
			// 学名
			'en_name' => 'required|max:255',
			// 種名（和名）
			'jp_name' => 'required|max:255',
			*/
			// 採集年月日
			'collect_date' => 'date|nullable',
			// 公開/非公開
			'is_private' => 'boolean',

        ];
    }
}
