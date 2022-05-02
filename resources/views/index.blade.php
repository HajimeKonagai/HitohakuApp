<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>Laravel</title>
		<link href="{{ mix('css/app.css') }}?ver=20220502" rel="stylesheet">
	</head>
	<body>
		<div id="app">No rendered.</div>
		<script src="{{ mix('js/index.js') }}?ver=20220502"></script>


		<form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
			@csrf
		</form>

	</body>
</html>

