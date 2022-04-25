import axios from 'axios'
import { User } from '../types/User'

const getUser = async () =>
{
	const { data } = await axios.get('/api/user').catch(function (error){
		return false; // null じゃダメ invalidateQueries が無効になる
	});
	return data;
}


const login = async ({ email, password }: { email: string, password: string }) =>
{
	const { data } = await axios.post<User>(
		`/api/login`,
		{
			email: email,
			password: password,
		}
	);
	return data;
}

const logout = async () =>
{
	const { data } = await axios.post<User>(`/api/logout`);
	return data;
}

export {
	getUser,
	login,
	logout,
}
