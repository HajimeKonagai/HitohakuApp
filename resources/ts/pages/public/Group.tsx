import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { useGroup } from '../../queries/PlantQuery'
import { useWindowDimensions } from '../../classes/useWindowDimensions'
import Loading from '../../components/Loading';
import Pagination     from './components/Pagination';
import { LinkButton } from './components/LinkButton';
import Layout from './Layout';


const PageGroup: React.VFC = ( {} ) =>
{
	const { field, initial } = useParams();
	const [ page, setPage ] = useState<number>(1);
	const { width, height } = useWindowDimensions();
	const perPage = width < height ? 15: 8;
	const { data, isLoading } = useGroup(field, initial, page, perPage);

	let title = '';
	switch (field)
	{
	case 'jp_name': title = '種名(和名)「' + initial + '」から始まる'; break;
	case 'jp_family_name': title = '科名:「' + initial + '」'; break;
	case 'en_name': title = '学名(欧名)「' + initial + '」から始まる'; break;
	case 'en_family_name': title ='科名:「' + initial + '」'; break;
	}

	if (data?.total) title += ' (' + data.total + '件)';

	

	return (<Layout title={title}>
		{isLoading && (
			<Loading />
		) || (
			data && (<>
			<Pagination
				data={data}
				page={page}
				setPage={setPage}
			/>
			<table className="group alternate">
			<thead>
				<tr>
					<th></th>
					<th>種名(和名)</th>
					<th>学名</th>
					<th>科名(和名)</th>
					<th>科名(欧名)</th>
					<th className="count">画像点数</th>
				</tr>
			</thead>
			<tbody>
			{Object.keys(data.data).map((key) => (
				<tr key={`${data.data[key]['en_name']}-${data.data[key]['jp_name']}`}>
					<td className="link">
						<LinkButton
							to={`/list/${data.data[key]['jp_name'] ? data.data[key]['jp_name']: '他'}/${data.data[key]['jp_family_name'] ? data.data[key]['jp_family_name']: '他'}/${data.data[key]['en_name'] ? data.data[key]['en_name']: '他'}/${data.data[key]['en_family_name'] ? data.data[key]['en_family_name']: '他'}`}
						>
							見る
						</LinkButton>
					</td>
					<td><div className="td-inner">{data.data[key]['jp_name']}</div></td>
					<td><div className="td-inner">{data.data[key]['en_name']}</div></td>
					<td><div className="td-inner">{data.data[key]['jp_family_name']}</div></td>
					<td><div className="td-inner">{data.data[key]['en_family_name']}</div></td>
					<td className="count">{data.data[key]['count']}</td>
				</tr>
			))}
			</tbody>
			</table>
			</>) || (
				<div>データがありません。</div>
			)
		)}
	</Layout>);
}

export default PageGroup;

