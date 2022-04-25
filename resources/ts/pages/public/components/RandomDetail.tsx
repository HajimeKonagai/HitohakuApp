import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { useRand } from '../../../queries/PlantQuery';
import Loading from '../../../components/Loading';
import { useWindowDimensions } from '../../../classes/useWindowDimensions'


const RandomDetail: React.VFC = () =>
{
	const columns = {
		'number': '資料番号',
		'jp_name': '種名（和名）',
		'jp_family_name': '科名（和名）',
		'en_name': '学名',
		'en_family_name': '科名（欧名）',
	};

	const location = useLocation();

	const { width, height } = useWindowDimensions();
	const limit = width < height ? 9: 5;
	const { data, isLoading, isFetching } = useRand(limit);

	if (isFetching) return <Loading />;

	return (<ul className="random-detail">
	{data.map((item) => (
		<li>
			<img
				src={`/photo/small/${item['number']}`}
			/>
			<table>
				<tbody>
				{Object.keys(columns).map((key) => (
					item[key] && (
						<tr>
							<th>{columns[key]}</th>
							<td>{item[key]}</td>
						</tr>
					) || (<></>)
				))}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={2}>
							<Link
								to={`/detail/${item.number}`}
								className="link-button small"
								state={{
									prev: location.pathname,
								}}
							>
								見る
							</Link>
						</td>
					</tr>
				</tfoot>
			</table>
		</li>
	))}
	</ul>);
}

export default RandomDetail;
