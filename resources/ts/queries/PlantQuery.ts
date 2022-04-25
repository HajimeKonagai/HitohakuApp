import { useQuery, useMutation, useQueryClient } from 'react-query'
import * as api from '../api/PlantApi'
// import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { Plant, Group, DetailParam, SearchParam } from '../types/Plant'
import { Pagination } from '../types/Pagination'


const useInitial = (field: string) =>
{
	return useQuery(['initial', field], () => api.getInitial(field));
}

const useFamily = (field: string, initial: string, page: number, perPage: number) =>
{
	return useQuery(['family', {field: field, initial: initial, page: page, perPage: perPage}], () => api.getFamily(field, initial, page, perPage));
}

const useGroup = (field: string, initial: string, page: number, perPage: number) =>
{
	return useQuery(['group', {field: field, initial: initial, page: page, perPage: perPage}], () => api.getGroup(field, initial, page, perPage));
}

const useList = (params: DetailParam) =>
{
	return useQuery(['list', {params: params}], () => api.getList(params));
}

const useDetail = (number: string) =>
{
	return useQuery(['detail', {number: number}], () => api.getDetail(number));
}

const useSearch = (search: SearchParam) =>
{
	return useQuery(['search', {search: search}], () => api.getSearch(search));
}

const useRand = (limit: number) =>
{
	return useQuery('rand', () => api.getRand(limit), {
		refetchInterval: 20000,
		refetchOnWindowFocus: false,
	});
}



export {
	useInitial,
	useFamily,
	useGroup,
	useList,
	useDetail,
	useSearch,
	useRand,
}
