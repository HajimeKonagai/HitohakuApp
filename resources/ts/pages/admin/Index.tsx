import React, { useEffect, useState } from 'react'
import { Link, Outlet, useParams } from 'react-router-dom';
import { useIndex, useDestroy } from '../../queries/AdminQuery';
import { SearchParam } from '../../types/Admin';
import Loading from '../../components/Loading';
import Pagination     from '../../components/Pagination';

import Layout from './Layout';



const AdminIndex: React.VFC = () =>
{
	const columns = {
		'number': '資料番号',
		'jp_name': '種名（和名）',
		'jp_family_name': '科名（和名）',
		'en_name': '学名',
		'en_family_name': '科名（欧名）',
		'is_private': '非公開',
		/*
		'title': '件名',
		'name': '資料名',
		'collect_country': '採集地名：国名(和）',
		'collect_pref': '採集地名：県名',
		'collect_city': '採集地名：市郡町村区名',
		'collect_addr': '採集地名：以下（和）',
		'collect_date': '採集年月日',
		'collect_person': '採集者',
		'collect_number': '採集者標本番号',
		'rdb_country': '国RDB',
		'rdb_pref': '都道府県RDB',
		*/
	};


	const [ number, setNumber ] = useState('');
	const [ jpName, setJpName ] = useState('');
	const [ jpFamilyName, setJpFamilyName ] = useState('');
	const [ enName, setEnName ] = useState('');
	const [ enFamilyName, setEnFamilyName ] = useState('');

	const [order, setOrder] = useState<[string, string]|boolean>(false); // [column, isDesc]

	const [ page, setPage ] = useState(1);
	const perPage = 25;

	const [ searchValues, setSearchValues ] = useState<SearchParam>({
		page: page,
		perPage: perPage,
	});
	const { data, isLoading, isFetching } = useIndex(searchValues);
	const destroy = useDestroy(searchValues);


	const handleSubmit = () =>
	{
		if (page != 1)
		{
			setPage(1);
		}
		else
		{
			search();
		}
	}

	const search = () =>
	{
		let values:SearchParam = {
			page: page,
			perPage: perPage,
		};

		if (number != '') values.number = number;
		if (jpName != '') values.jp_name = jpName;
		if (jpFamilyName != '') values.jp_family_name = jpFamilyName;
		if (enName != '') values.en_name = enName;
		if (enFamilyName != '') values.en_family_name = enFamilyName;

		if (order)
		{
			values.order_by = order[0];
			values.order = order[1];
		}

		setSearchValues(values);
	}


	useEffect(() => {
		search();
	}, [page, order]);


	useEffect(() => {
		const timer = setTimeout(() => {
			if (page != 1)
			{
				setPage(1);
			}
			else
			{
				search();
			}
		}, 500)

		return () => clearTimeout(timer)
	}, [number, jpName, jpFamilyName, enName, enFamilyName]);


	const plantDelete = (number: string) =>
	{
		if (window.confirm('「'+ number + "」を削除してもよろしいでしょうか？\nこの操作は取り消せません。\n画像ファイルがある場合はがファイルも削除されます。"))
		{
			destroy.mutate({
				number: number,
			});
		}
	}


	const title: string = '管理トップ';

	return (<Layout title={title}>
		<form
			onSubmit={(e) => {
				e.preventDefault();
				search();
			}}
			className="search"
		>
			<label>
				<span>{columns['number']}</span>
				<input
					type="text"
					onChange={(e) => setNumber(e.target.value)}
				/>
			</label>
			<label>
				<span>{columns['jp_name']}</span>
				<input
					type="text"
					onChange={(e) => setJpName(e.target.value)}
				/>
			</label>
			<label>
				<span>{columns['jp_family_name']}</span>
				<input
					type="text"
					onChange={(e) => setJpFamilyName(e.target.value)}
				/>
			</label>
			<label>
				<span>{columns['en_name']}</span>
				<input
					type="text"
					onChange={(e) => setEnName(e.target.value)}
				/>
			</label>
			<label>
				<span>{columns['en_family_name']}</span>
				<input
					type="text"
					onChange={(e) => setEnFamilyName(e.target.value)}
				/>
			</label>

			{ /* <input className="link-button" type="submit" value="検索" /> */ }
		</form>

		{isLoading && (
			<Loading />
		) || (<>
			<Pagination
				data={data}
				page={page}
				setPage={setPage}
			/>
			<table className="alternate">
				<thead>
					<tr>
					{Object.keys(columns).map((key) => (
						<th>
							<span
								className="order"
								onClick={() => {
									if (order && order[0] == key)
									{
										switch (order[1])
										{
										case 'asc':
											setOrder([key, 'desc']);
											break;
										case 'desc':
											setOrder(false);
											break;
										default:
											setOrder([key, 'asc']);
											break
										}
									}
									else
									{
										setOrder([key, 'asc']);
									}
								}}
							>
								{columns[key]}
								{order && order[0] == key ? (order[1] == 'asc' ? '↓': '↑'):''}
							</span>
						</th>
					))}
						<th>画像</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{data.data.map((item) => (
					<tr
						key={item.number}
					>
						{Object.keys(columns).map((key) => (
							<td>
								{key == 'is_private' ?
									(item[key] ? '非公開': '') :
									(item[key] ? item[key]: '')
								}
							</td>
						))}
						<td>

							<img
								src={`/photo/small/${item['number']}/?${new Date().getTime()}`}
								style={{maxHeight: '100px', display: 'block'}}
							/>

						</td>
						<td>
							<Link to={`/admin/edit/${item.number}`} className="link-button small">編集</Link>
							<button onClick={() => plantDelete(item.number)} className="link-button small delete">削除</button>
						</td>
					</tr>
					))}
				</tbody>
			</table>
			<Pagination
				data={data}
				page={page}
				setPage={setPage}
			/>
		</>)}
	</Layout>);
}

export default AdminIndex;

