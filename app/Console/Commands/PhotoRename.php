<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use \InterventionImage;
use App\Facades\ImageConverter;

class PhotoRename extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:rename {from_dir} {count=100}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '写真を適切なフォルダに振り分ける';

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
		$count = $this->argument("count");
		$executed = 0;
		$handle = opendir($from_dir);
		while (false !== ($entry = readdir($handle)))
		{
			$path = $from_dir.'/'.$entry;

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

			echo "\t".$path.' -> '.$to_path."\n";

			if (file_exists($to_path))
			{
				echo 'ERROR: ファイルが存在しています'."\n";
			}
			else
			{
				// ファイルの移動
				rename($path, $to_path);
			}
		}

        return Command::SUCCESS;
    }
}
