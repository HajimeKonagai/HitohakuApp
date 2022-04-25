<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Plant;
use SplFileObject;
use App\Facades\CsvImporter;

class ImportCsvCommand extends Command
{
	private static $en_strs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private static $ja_strs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';


	private static $format_long = [
		 0 => 'number',
		 1 => 'file_name',
		 2 => 'title',
		 3 => 'name',
		 4 => 'en_family_name',
		 5 => 'jp_family_name',
		 6 => 'en_name',
		 7 => 'jp_name',
		 8 => 'collect_country',
		 9 => 'collect_pref',
		10 => 'collect_city',
		11 => 'collect_addr',
		12 => 'collect_date',
		13 => 'collect_person',
		14 => 'collect_number',
		15 => 'rdb_country',
		16 => 'rdb_pref',
		17 => 'is_private',
	];

	private static $format_short = [
		 0 => 'file_name',
		 1 => 'en_family_name',
		 2 => 'jp_family_name',
		 3 => 'en_name',
		 4 => 'jp_name',
		 5 => 'is_private',
	];


	/**
	 * The name and signature of the console command.
	 *
	 * @var string
	 */
	protected $signature = 'import:csv {from_dir} {csv_format_is_long=0}';

	/**
	 * The console command description.
	 *
	 * @var string
	 */
	protected $description = 'from_dir 内のcsvを全てデータベースにインポートする。';

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
		$from_dir = $this->argument("from_dir");
		$csv_format_is_long = $this->argument("csv_format_is_long");

		dump($from_dir);

		$handle = opendir($from_dir);
		while (false !== ($entry = readdir($handle)))
		{
			$path = $from_dir.'/'.$entry;
			// ディレクトリ、隠しファイルを無視
			if ('.' == substr($entry, 0, 1)) continue;
			$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
			if (! in_array(
				$ext,
				array('csv'))
			)
			{
				// throw exception
				continue;
			}
			echo "\n----------\n".$path,"\n----------\n";

			$file = new SplFileObject($path);

			$file->setFlags(
				SplFileObject::READ_CSV |
				SplFileObject::READ_AHEAD |
				SplFileObject::SKIP_EMPTY |
				SplFileObject::DROP_NEW_LINE
			);
			$line_num = 0;
			foreach($file as $line)
			{
				$line_num++;

				// 0 にはファイル名等が入るはずで頭文字Cなのでそれ以外は不正なデータとしてスキップする
				if ('C' != strtoupper(substr($line[0], 0, 1)))
				{
					echo "番号が不正。スキップ: ".$line_num."\n";
					continue;
				}


				foreach ($line as $index => $cell)
				{
					$line[$index] = mb_convert_encoding($cell, 'UTF-8', 'SJIS');
				}

				// 公開・非公開を bool に変換しておく
				$format = [];
				if (count($line) == 18)
				{
					$format = static::$format_long;
				}
				else if (count($line) == 6)
				{
					$format = static::$format_short;
				}
				else
				{
					// 不正なフォーマット
				}


				$is_private_index = array_search('is_private', $format);
				$is_private = $line[$is_private_index];
				if (! in_array($is_private, ['公開', '非公開']))
				{
					$errors[] = "公開or非公開ではありません、公開でインポートします";
					$line[$is_private_index] = false;
				}
				else
				{
					$line[$is_private_index] = $is_private == '非公開';
				}

				// $errors = CsvImporter::import_line($line, $format, $live=false, $update=false);
				$errors = CsvImporter::import_line($line, $format, $live=true, $update=false);

				if ($errors)
				{
					foreach ($errors as $error)
					{
						echo $error.' : '.$line_num."\n";
					}
				}
			}
		}

		return Command::SUCCESS;
	}

}
