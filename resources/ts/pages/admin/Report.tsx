import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useReport } from '../../queries/AdminQuery'
import Loading from '../../components/Loading';
import { Log } from '../../types/Admin';
import Layout from './Layout';
import Pagination     from '../../components/Pagination';

// import { Link, useParams } from 'react-router-dom';
// import { useGroup } from '../../queries/PlantQuery'



const AdminCreate: React.VFC = () =>
{
	const columns = {
		'job': '操作',
		'content': '本文',
		'number': '資料番号',
	};

	const [ filter, setFilter ] = useState('');

	const [ order, setOrder ] = useState<[string, string]|boolean>(false); // [column, isDesc]
	const [ page, setPage ] = useState(1);
	const perPage = 25;
	const [ searchValues, setSearchValues ] = useState<SearchParam>({
		page: page,
		perPage: perPage,
	});
	const { data, isLoading } = useReport(searchValues);

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

		if (filter != '') values.filter = filter;

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
	}, [filter]);


	const date_format = (d) =>
	{
		const date = new Date(d);

		return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' '
			+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	}

	console.log(data);


	const title = 'データチェックレポート';

	return (<Layout title={title}>

		<form
			onSubmit={(e) => {
				e.preventDefault();
				search();
			}}
			className="search"
		>
			<label>
				<span>Filter</span>
				<input
					type="text"
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
				/>
			</label>
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
						<th>日時</th>
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
								{item[key]}
							</td>
						))}
						<td>
							{date_format(item.created_at)}
						</td>
						<td>
							{item.number && (<Link to={`/admin/edit/${item.number}`} className="link-button small">編集</Link>)}
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

export default AdminCreate;

