import * as api from '../api/AuthApi'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify';

const useUser = () =>
{
	return useQuery('user', api.getUser);
}

const useLogin = () =>
{
	const queryClient = useQueryClient();

	return useMutation(api.login, {
		onSuccess: (user) => {
			if (user)
			{
				queryClient.invalidateQueries('user');
				toast.success('ログインしました。');
			}

		},
		onError: () => {
			toast.error('ログインに失敗しました。');
		},
	})
}

const useLogout = () =>
{
	const queryClient = useQueryClient();

	return useMutation(api.logout, {
		onSuccess: (user) => {
			if (user)
			{
				queryClient.invalidateQueries('user');
				toast.success('ログアウトしました。');
			}
		},
		onError: () => {
			toast.error('ログアウト出来ませんでした。');
		},
	})
}



export {
	useUser,
	useLogin,
	useLogout,
}

