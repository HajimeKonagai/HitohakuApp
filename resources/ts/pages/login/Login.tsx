import React, {useState} from 'react'
import { useLogin } from '../../queries/AuthQuery';

const PageLogin: React.VFC = () =>
{
	const login = useLogin();

	


	const[email, setEmail] = useState('');
	const[password, setPassword] = useState('');

	/*
	const[email, setEmail] = useState('');
	const[password, setPassword] = useState('');
	*/


	const handleLogin = (e: React.FormEvent<HTMLFormElement>) =>
	{
		e.preventDefault();
		login.mutate({ email, password });
	}

	return (
		<article className="login">
			<form onSubmit={handleLogin}>
				<dl>
					<dt>
						<label>メールアドレス</label>
					</dt>
					<dd>
					<input
						name="email"
						type="email"
						className="input"
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>
					</dd>

					<dt>

					</dt>
						<label>パスワード</label>
					<dd>
						<input
							name="password"
							type="password"
							className="input"
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>
					</dd>
				</dl>
				<button type="submit" className="btn">ログイン</button>
			</form>
		</article>
	);
}

export default PageLogin;


