<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>ひとはくデータベース</title>
		<link href="{{ mix('css/app.css') }}?ver=20220425" rel="stylesheet">
	</head>
	<body>
		<div id="app">
			<header>
				<h1>ひとはくデータベース</h1>
			</header>

			<main>
				<article class="login">
					<form method="POST" action="{{ route('login') }}">
						@csrf

						<dl>
							<dt>
								<label for="email">メールアドレス</label>
							</dt>
							<dd>

								<input
									id="email"
									type="email"
									class="form-control @error('email') is-invalid @enderror"
									name="email" value="{{ old('email') }}"
									required autocomplete="email" autofocus>

								@error('email')
									<span class="invalid-feedback" role="alert" style="color:red;">
										<strong>{{ $message }}</strong>
									</span>
								@enderror

							</dd>
		
							<dt>
		
							</dt>
								<label for="password" class="">パスワード</label>
							<dd>
								<input
									id="password"
									type="password"
									class="form-control @error('password') is-invalid @enderror"
									name="password" required autocomplete="current-password">

								@error('password')
									<span class="invalid-feedback" role="alert" style="color:red;">
										<strong>{{ $message }}</strong>
									</span>
								@enderror

							</dd>
							<!--
							<dd>
								<input class="form-check-input" type="checkbox" name="remember" id="remember" {{ old('remember') ? 'checked' : '' }}>

								<label class="form-check-label" for="remember">
									パスワードを記憶
								</label>
							</dd>
							-->
						</dl>


						<button type="submit" class="btn btn-primary">
							ログイン
						</button>
					</form>
				</article>


			</main>

			<footer>
				<a href="/">トップに戻る</a>
				<a href="/search">自由検索</a>
			</footer>
		</div>
	</body>
</html>
