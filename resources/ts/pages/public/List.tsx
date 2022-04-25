import React, { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom';
import { useList } from '../../queries/PlantQuery'
import { DetailParam } from '../../types/Plant'
import { useWindowDimensions } from '../../classes/useWindowDimensions'
import Loading from '../../components/Loading';
import Pagination     from './components/Pagination';
import { LinkButton } from './components/LinkButton';
import Layout from './Layout';

const PageList: React.VFC = () =>
{
	const params = useParams();
	const location = useLocation();
	const [ page, setPage ] = useState<number>(1);
	const { width, height } = useWindowDimensions();
	const perPage = width < height ? 16: 16;
	const newParams: DetailParam = {
		page: page,
		perPage: perPage,
		...params,
	}
	const { data, isLoading } = useList(newParams);

	const title = params.jp_name + 'の資料画像一覧';

	return (<Layout title={title}>
		{isLoading && (
			<Loading />
		) || (<>
			<Pagination
				data={data}
				page={page}
				setPage={setPage}
			/>
			<ul className="list">
			{Object.keys(data.data).map((key) => (
				<li key={data.data[key]['number']}>
					<Link
						to={`/detail/${data.data[key]['number']}`}
						state={{
							prev: location.pathname,
						}}
					>
						<img height="280" src={`/photo/small/${data.data[key]['number']}`} />
						<span className="number">{data.data[key].number}</span>
					</Link>
				</li>
			))}
			</ul>
		</>)}
	</Layout>);
}

export default PageList;

