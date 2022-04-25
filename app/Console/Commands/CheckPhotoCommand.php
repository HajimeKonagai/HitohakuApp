<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use \InterventionImage;
use App\Facades\ImageConverter;
use App\Models\Plant;


/*
 * 1. DB内のデータに対して、写真が存在しているか => 他のコマンドへ？
 * 2. full の写真に対して config で設定したリサイズのイメージが存在しているか => 引数を取って存在していなかった場合に生成するか
 * 3. 写真に対して、DB にっデータが存在しているか
 */

class CheckPhotoCommand extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'check:photo';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = '資料に写真が登録されているか(full large medium が揃っているか)をチェックする。live の true でリサイズ写真がなかった際に実際にリサイズを実行する。リサイズの格サイズは 〜〜〜に依存する。実運用に入った後は cron で流すため、log に結果を吐き出して管理画面に表示する。';

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		parent::__construct();
	}


	public function handle()
	{
		$plants = Plant::select(['number', 'file_name'])
			->get();

		$full_size = ImageConverter::get_full_dir_name();
		$large_size = config('hitohaku.large_size');
		$small_size = config('hitohaku.small_size');

		foreach( $plants as $plant)
		{
			$filename = $plant->file_name;
			if ( ! file_exists(ImageConverter::personalDir($filename, $full_size).'/'.$filename) )
			{
				$log_text = $plant->number."の画像ファイルが存在しません。";
				// echo $log_text."\n";
				\App\Models\Report::create([
					'job' => 'check:photo',
					'number' => $plant->number,
					'content' => $log_text,
				]);
			}
			else
			{
				if ( ! file_exists(ImageConverter::personalDir($filename, $large_size).'/'.$filename) )
				{
					$log_text = "\t".$plant->number."のlargeファイルが存在しません。";
					// echo $log_text."\n";
					\App\Models\Report::create([
						'job' => 'check:photo',
						'number' => $plant->number,
						'content' => $log_text,
					]);
				}
				if ( ! file_exists(ImageConverter::personalDir($filename, $small_size).'/'.$filename) )
				{

					$log_text = "\t".$plant->number."のsmallファイルが存在しません。";
					// echo $log_text."\n";
					\App\Models\Report::create([
						'job' => 'check:photo',
						'number' => $plant->number,
						'content' => $log_text,
					]);
				}
			}

		}

		return Command::SUCCESS;
	}

}
