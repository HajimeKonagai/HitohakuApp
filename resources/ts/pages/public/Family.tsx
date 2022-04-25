import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { useFamily } from '../../queries/PlantQuery';
import { useWindowDimensions } from '../../classes/useWindowDimensions';
import Loading from '../../components/Loading';
import Pagination from './components/Pagination';
import { LinkButton } from './components/LinkButton';
import Layout from './Layout';

const PageFamily: React.VFC = () =>
{
	const { field, initial } = useParams();
	const [ page, setPage ] = useState<number>(1);
	const { width, height } = useWindowDimensions();
	const perPage = width < height ? 16: 16;
	const { data, isLoading } = useFamily(field, initial, page, perPage);

	let title = '';
	switch (field)
	{
	case 'jp_family_name': title = '科名:「' + initial + '」から始まる'; break;
	case 'en_family_name': title ='科名:「' + initial + '」から始まる'; break;
	}

	return (<Layout title={title}>
		{isLoading && (
			<Loading />
		) || (<>
			<Pagination
				data={data}
				page={page}
				setPage={setPage}
			/>

			<ul className="family">
			{Object.keys(data.data).map((key) => (
				<li key={data.data[key]['name']}>
					<LinkButton to={`/group/${field}/${data.data[key]['name']}`}>
						{data.data[key]['name']}
					</LinkButton>
					<span className="count">({data.data[key]['count']})</span>
				</li>
			))}
			</ul>
		</>)}
	</Layout>);
}

export default PageFamily;


