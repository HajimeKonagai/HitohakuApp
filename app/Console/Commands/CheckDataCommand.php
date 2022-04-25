<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use \InterventionImage;
use App\Facades\ImageConverter;
use App\Models\Plant;

class CheckDataCommand extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'check:data';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = '写真に対して、データが存在しているかチェック。実運用に入った後は cron で流すため、log に結果を吐き出して管理画面に表示する。';

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
		// full ディレクトリをスキャン
		$full_dir = ImageConverter::get_full_dir();
		$handle = opendir($full_dir);

		while (false !== ($entry = readdir($handle)))
		{
			// '.'からはじまるファイルを飛ばす (Mac 対応含む)
			if (substr($entry, 0, 1) == '.') continue;

			$p_dir = $full_dir.'/'.$entry;
			// echo $p_dir."\n";
			if (!is_dir($p_dir))
			{
				// echo 'ERROR! dir ではありません「'.$entry."」\n";

				\App\Models\Report::create([
					'job' => 'check:data',
					'content' =>  'ERROR! dir ではありません「'.$entry."」\n",
				]);

				continue;
			}


			$p_handle = opendir($p_dir);
			while (false !== ($file = readdir($p_handle)))
			{

				// Mac 対応、'.'からはじまるファイルも飛ばす
				if (substr($file, 0, 1) == '.') continue;
				// 所定の拡張子以外はとばす。
				$ext = strtolower(pathinfo($p_dir.'/'.$file, PATHINFO_EXTENSION));

				if (! in_array(
					$ext,
					array('jpg', 'jpeg', 'png'))
				)
				{
					// throw exception
					continue;
				}

				$newpath = ImageConverter::personalDir($file, ImageConverter::get_full_dir_name()).'/'.$file;

				// Plant に対象のデータがあるかチェック
				$rawname = ImageConverter::rawname($newpath);
				$plant = Plant::find($rawname);
				if (!$plant)
				{
					$log_text = '資料番号「'.$rawname.'」のデータは、データベースに登録されていません。'."\n";
					// echo $log_text;
					\App\Models\Report::create([
						'job' => 'check:data',
						'content' => $log_text,
					]);
				}
			}
		}
	}

}

