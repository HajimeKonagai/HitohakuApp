import axios from 'axios';
import { Plant, Group, DetailParam, SearchParam } from '../types/Plant';
import { Pagination } from '../types/Pagination';

const getInitial = async (field: string) =>
{
	// const { data } = await axios.get<Group[]>(`api/group/${field}`);
	const { data } = await axios.get(`/api/initial/${field}`);
	return data;
}

const getFamily = async (field: string, initial: string, page: number, perPage: number) =>
{
	const { data } = await axios.get(`/api/family/${field}/${initial}`, {
		params:
		{	page: page,
			perPage: perPage,
		}
	});
	return data;
}


const getGroup = async (field: string, initial: string, page: number, perPage: number) =>
{
	const { data } = await axios.get(`/api/group/${field}/${initial}`, {
		params:
		{
			page: page,
			perPage: perPage,
		}
	});
	return data;
}

const getList = async (params: DetailParam) =>
{
	const { data } = await axios.get<Pagination<Plant>>(`/api/list`, {
		params: params,
	});
	return data;
}

const getDetail = async (number: string) =>
{
	const { data } = await axios.get<Plant>(`/api/detail/${number}`);
	return data;
}

const getSearch = async (search: SearchParam) =>
{
	const { data } = await axios.get<Pagination<Plant>>(`/api/search`, {
		params: search
	});
	return data;
}

const getRand = async (limit: number) =>
{
	const { data } = await axios.get(`/api/rand/${limit}`);
	return data;
}


export {
	getInitial,
	getFamily,
	getGroup,
	getList,
	getDetail,
	getSearch,
	getRand,
}
