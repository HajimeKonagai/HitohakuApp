import axios from 'axios'
import { Plant } from '../types/Plant'
import { SearchParam, SearchParamAll, PlantUpdate, Log } from '../types/Admin'
import { Pagination } from '../types/Pagination';


const index = async (search: SearchParam) =>
{
	const { data } = await axios.get<Pagination<Plant>>(`/api/admin/index`, {
		params: search
	});
	return data;
}

const  all = async (search: SearchParamAll) =>
{
	const { data } = await axios.get(`/api/admin/all`, {
		params: search
	});

	return data;
}

const  count = async (search: SearchParamAll) =>
{
	const { data } = await axios.get(`/api/admin/count`, {
		params: search
	});

	return data;
}

const loadSetting = async(key: string) =>
{
	const { data } = await axios.get(
		`/api/admin/setting/${key}`
	);

	return data ? data: [];
}


const saveSetting = async({key, value}) =>
{
	const { data } = await axios.post(
		`/api/admin/setting/${key}`,
		{
			value: value
		}
	);

	return data;
}


const importApi = async (params) =>
{
	const { data } = await axios.post(
		`/api/admin/import`,
		params
	);

	return data;
}


const upload = async (params) =>
{
	const { data } = await axios.post(
		`/api/admin/upload`,
		params,
		{
			headers:
			{
				'content-type': 'multipart/form-data',
			}
		}
	);

	return data;
}


const store = async ({ params }: { params: FormData}) =>
{
	const { data } = await axios.post<PlantUpdate>(
		`/api/admin/store`,
		params,
		{
			headers:
			{
				'content-type': 'multipart/form-data',
			}
		}
	);
	return data;
}



const update = async ({ number, params }: { number: string, params: FormData}) =>
{
	const { data } = await axios.post<PlantUpdate>(
		`/api/admin/update/${number}`,
		params,
		{
			headers:
			{
				'content-type': 'multipart/form-data',
				'X-HTTP-Method-Override': 'PUT',
			}
		}
	);
	return data;
}


const destroy = async ({ number }: { number: string }) =>
{
	const { data } = await axios.delete(
		`/api/admin/destroy/${number}`
	);

	return data;
}



const log = async (search: SearchParam) =>
{
	const { data } = await axios.get<Pagination<Log>>(`/api/admin/log`, {
		params: search
	});
	return data;
}


const revision = async (number: string) =>
{
	const { data } = await axios.get(`/api/admin/revision/${number}`);
	console.log('data', data);
	return data;
}

const report = async (search: SearchParam) =>
{
	const { data } = await axios.get<Pagination<Log>>(`/api/admin/report`, {
		params: search
	});
	return data;
}




export {
	index,
	all,
	count,
	saveSetting,
	loadSetting,
	importApi,
	upload,
	store,
	update,
	destroy,
	log,
	revision,
	report,
}
