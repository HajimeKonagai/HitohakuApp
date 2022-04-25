<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlantRequest extends FormRequest
{
	/**
	 * Determine if the user is authorized to make this request.
	 *
	 * @return bool
	 */
	public function authorize()
	{
		return true;
	}

	/**
	 * Get the validation rules that apply to the request.
	 *
	 * @return array
	 */
	public function rules()
	{
		return [

			// 資料番号
			'number' => 'required|unique:plants',
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
			// 採集年月日
			'collect_date' => 'date',
			// 公開/非公開
			//'is_private' => 'required|max:255',
		];
	}

	public function attributes()
	{
		return [
			'title' => 'タイトル',
			
		];
	}
}
