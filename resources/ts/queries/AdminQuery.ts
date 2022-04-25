import * as api from '../api/AdminApi'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify';
import { SearchParam, PlantUpdate } from '../types/Admin'
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';



const useIndex = (search: SearchParam) =>
{
	return useQuery(['admin-index', {search: search}], () => api.index(search));
}


const useLoadSetting = (key: string) =>
{
	return useQuery(['setting', {key: key}], () => api.loadSetting(key));
}

const useSaveSetting = (key: string, handleUpdated: (success: boolean) => void) =>
{
	const queryClient = useQueryClient();

	return useMutation(api.saveSetting, {
		onSuccess: (data) =>
		{
			queryClient.invalidateQueries(['setting', {key: key}]);
			toast.success('設定を更新しました。');
			// 更新
			// return data;
			handleUpdated(true);
		},
		onError: (error: AxiosError) =>
		{
			if (error.response?.data.errors)
			{
				Object.values(error.response?.data.errors).map((messages:any) =>
				{
					messages.map((message: string) =>
					{
						toast.error(message);
					});
				});
			}
			else
			{
				toast.error('設定ファイルの保存に失敗しました。');
			}
		},
	})
}


const useImport = ({onSuccess, onError}) =>
{
	const queryClient = useQueryClient();

	return useMutation(api.importApi, {
		onSuccess: onSuccess,
		onError: onError,
	})
}



const useUpload = ({onSuccess, onError}) =>
{
	const queryClient = useQueryClient();

	return useMutation(api.upload, {
		onSuccess: onSuccess,
		onError: onError,
		/*
		(data) => {
			return data;
		},
		onError: (error: AxiosError) => {
		console.log(error.response?.data);
			toast.error('削除にしっぱい');
		},
		*/
	})
}


const useStore = (handleStored: (data: any) => void) =>
{
	const queryClient = useQueryClient();
	const navigate = useNavigate();


	return useMutation(api.store, {
		onSuccess: (data) => {
			// queryClient.invalidateQueries(['detail', {number: number}]); // PlantQuery detail に合わせる
			console.log('useStore stored');
			console.log(data);
			handleStored(data);
		},
		onError: (error: AxiosError) => {

			if (error.response?.data.errors)
			{
				Object.values(error.response?.data.errors).map((messages:any) =>
				{
					messages.map((message: string) =>
					{
						toast.error(message);
					});
				});
			}
			else
			{
				toast.error('新規作成に失敗しました。');
			}
		},
	})
}


const useUpdate = (number: string, handleUpdated: (data: any) => void) =>
{
	const queryClient = useQueryClient();

	return useMutation(api.update, {
		onSuccess: (data) => {
			// queryClient.invalidateQueries(['detail', {number: number}]); // PlantQuery detail に合わせる
			queryClient.resetQueries(['detail', {number: number}]); // PlantQuery detail に合わせる
			handleUpdated(data);
		},
		onError: (error: AxiosError) => {

			if (error.response?.data.errors)
			{
				Object.values(error.response?.data.errors).map((messages:any) =>
				{
					messages.map((message: string) =>
					{
						toast.error(message);
					});
				});
			}
			else
			{
				toast.error('更新に失敗しました。');
			}
		},
	})
}

const useDestroy = (search: SearchParam) =>
{
	const queryClient = useQueryClient();

	return useMutation(api.destroy, {
		onSuccess: (data) => {
			queryClient.resetQueries(['admin-index', {search: search}]);
			toast.success('データを削除しました。');
		},
		onError: (error: AxiosError) => {

			if (error.response?.data.errors)
			{
				Object.values(error.response?.data.errors).map((messages:any) =>
				{
					messages.map((message: string) =>
					{
						toast.error(message);
					});
				});
			}
			else
			{
				toast.error('削除に失敗しました。');
			}
		},
	})
}


const useLog = (search: SearchParam) =>
{
	return useQuery(['log', {search: search}], () => api.log(search));
}

const useReport = (search: SearchParam) =>
{
	return useQuery(['report', {search: search}], () => api.report(search));
}


const useRevision = (number: string) =>
{
	return useQuery(['revision', {number: number}], () => api.revision(number));
}


const is_json = (data) =>
{
	try {
		JSON.parse(data);
	} catch (error) {
		return false;
	}
	return true;
}



export {
	useLoadSetting,
	useSaveSetting,
	useIndex,
	useImport,
	useUpload,
	useStore,
	useUpdate,
	useDestroy,
	useLog,
	useReport,
	useRevision,
	is_json,
}
