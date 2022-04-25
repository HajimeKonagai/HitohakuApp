<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlantsTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('plants', function (Blueprint $table) {
			$table->id();

			// 資料番号
			$table->string('number')->default('')->unique();
			// 画像ファイル名
			$table->string('file_name')->default('');
			// 件名
			$table->string('title')->default('');
			// 資料名
			$table->string('name')->default('');
			// 科名（欧名）
			$table->string('en_family_name')->default('');
			// 科名（和名）
			$table->string('jp_family_name')->default('');
			// 学名
			$table->string('en_name')->default('');
			// 種名（和名）
			$table->string('jp_name')->default('');
			// 採集地名：国名(和）
			$table->string('collect_country')->default('');
			// 採集地名：県名
			$table->string('collect_pref')->default('');
			// 採集地名：市郡町村区名
			$table->string('collect_city')->default('');
			// 採集地名：以下（和）
			$table->string('collect_addr')->default('');
			// 採集年月日
			$table->date('collect_date')->default(null)->nullable();
			// 採集者
			$table->string('collect_person')->default('');
			// 採集者標本番号
			$table->string('collect_number')->default('');
			// 国RDB
			$table->string('rdb_country')->default('');
			// 都道府県RDB
			$table->string('rdb_pref')->default('');
			// 公開/非公開
			$table->boolean('is_private')->default(false);

			/**
			 * 頭文字
			 */
			// 科名（欧名）
			$table->string('en_family_name_initial')->default('');
			// 科名（和名）
			$table->string('jp_family_name_initial')->default('');
			// 学名
			$table->string('en_name_initial')->default('');
			// 種名（和名）
			$table->string('jp_name_initial')->default('');


			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('plants');
	}
}
