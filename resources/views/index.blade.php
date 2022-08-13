<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>ひとはく植物標本画像データベース</title>
		<link href="{{ mix('css/app.css') }}?ver=20220813" rel="stylesheet">
	</head>
	<body>
		<div id="app">No rendered.</div>
		<script src="{{ mix('js/index.js') }}?ver=20220813"></script>


		<form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
			@csrf
		</form>

	</body>
</html>

