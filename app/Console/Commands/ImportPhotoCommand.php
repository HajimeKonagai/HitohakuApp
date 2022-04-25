<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use \InterventionImage;
use App\Facades\ImageConverter;


class ImportPhotoCommand extends Command
{
	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'import:photo {from_dir} {count=100}';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'Initialize photo';

	/**
	 * Create a new command instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Execute the console command.
	 *
	 * @return int
	 */
	public function handle()
	{
		// TODO path to storage
		$from_dir = $this->argument("from_dir");
		$count = $this->argument("count");

		$executed = 0;
		$handle = opendir($from_dir);
		while (false !== ($entry = readdir($handle)))
		{
			$path = $from_dir.'/'.$entry;
			echo $path."\n";

			// Mac 対応、'.'からはじまるファイルも飛ばす
			if (substr($entry, 0, 1) == '.') continue;

			// 所定の拡張子以外はとばす。
			$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

			if (! in_array(
				$ext,
				array('jpg', 'jpeg', 'png'))
			)
			{
				// throw exception
				continue;
			}


			$filename = basename($path);
			$full_dir = ImageConverter::personalDir($filename, ImageConverter::get_full_dir_name());
			$to_path = $full_dir.'/'.$filename;

			dump($to_path);
			continue;

			$errors = ImageConverter::convertImage($path, true);

			if (!file_exists($to_path))
			{
				// ファイルの移動
				rename($path, $to_path);

				// 画像も回転させる
				$converted = InterventionImage::make($to_path);
				$converted->orientate(); // 勝手に回転させない
				$w = $converted->width();
				$h = $converted->height();
				if ($h < $w) // 横長の時は回転させる
				{
					$converted->rotate(-90);
				}
				$converted->save($to_path);
			}
			else
			{
				array_unshift($errors, 'full サイズの画像がすでに存在しています。');
			}

			if ($errors)
			{
				foreach ($errors as $error)
				{
					echo "\t".$error."\n";
				}
			}

			$executed++;

			if ($executed >= $count) break;
		}
		closedir($handle);

		dump($from_dir);
		dump($count);

		return Command::SUCCESS;
	}
}
