<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Facades\ImageConverter;

class PhotoResize extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:resize {live=false}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'full の写真をスキャンし、適宜回転と縮小画像を生成';

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
		// full ディレクトリをスキャン
		$full_dir = ImageConverter::get_full_dir();
		$handle = opendir($full_dir);

		$executed = 0;

		$continue = true;
		$f_continue = true;
		while (false !== ($entry = readdir($handle)))
		{
			// '.'からはじまるファイルを飛ばす (Mac 対応含む)
			if (substr($entry, 0, 1) == '.') continue;

			$p_dir = $full_dir.'/'.$entry;
			echo $p_dir."\n";
			if (!is_dir($p_dir))
			{
				echo 'ERROR! dir ではありません「'.$entry."」\n";
			}

			if ($entry == 'C2195xxx') $continue = false;
			if ($continue) continue;

			$p_handle = opendir($p_dir);
			while (false !== ($file = readdir($p_handle)))
			{

				if ($file == 'C2195250.jpg') $f_continue = false;
				if ($f_continue) continue;

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

				echo $file."\n";

				$errors = ImageConverter::convertImage($p_dir.'/'.$file, $live = true, $overwrite = true, $full_only_overwrite = true);
				if ($errors)
				{
					foreach ($errors as $error)
					{
						dump($error);
					}
				}
			}
		}


        return Command::SUCCESS;
    }
}
