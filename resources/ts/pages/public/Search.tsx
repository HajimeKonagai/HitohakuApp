import React, { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom';
import { useSearch } from '../../queries/PlantQuery';
import Loading from '../../components/Loading';
import { useWindowDimensions } from '../../classes/useWindowDimensions'
import { SearchParam } from '../../types/Plant';
import Pagination     from './components/Pagination';
import Layout from './Layout';

const PageSearch: React.VFC = () =>
{
	const location = useLocation();

	const [ text, setText ] = useState('');
	const [ number, setNumber ] = useState(false);
	const [ jpName, setJpName ] = useState(false);
	const [ jpFamilyName, setJpFamilyName ] = useState(false);
	const [ enName, setEnName ] = useState(false);
	const [ enFamilyName, setEnFamilyName ] = useState(false);

	const [ page, setPage ] = useState(1);
	const { width, height } = useWindowDimensions();
	const perPage = width < height ? 15: 8;

	const [ searchValues, setSearchValues ] = useState<SearchParam>({
		text: text,
		page: page,
		perPage: perPage,
	});

	const { data, isLoading, isFetching } = useSearch(searchValues);

	const all = (
		! number &&
		! jpName &&
		! jpFamilyName &&
		! enName &&
		! enFamilyName
	);

	const callApi = () =>
	{
		let values:SearchParam = {
			text: text,
			page: page,
			perPage: perPage,
		};

		if (number || all) values.number = 1;
		if (jpName || all) values.jp_name = 1;
		if (jpFamilyName || all) values.jp_family_name = 1;
		if (enName || all) values.en_name = 1;
		if (enFamilyName || all) values.en_family_name = 1;

		setSearchValues(values);
	}

	useEffect(() => {
		callApi()
	}, [page]);


	useEffect(() => {
		const timer = setTimeout(() => {
			if (page != 1)
			{
				setPage(1);
			}
			else
			{
				callApi();
			}
		}, 500)

		return () => clearTimeout(timer)
	}, [text, number, jpName, jpFamilyName, enName, enFamilyName]);

	return (<Layout title="自由検索">
		<div className="search">
			<input
				className="search"
				size={50}
				placeholder="検索ワードを入力してください"
				onChange={(e) => setText(e.target.value)} value={text}
				inputMode="text"
			/>
			<div className="buttons">
				<button className={'link-button small ' + (all || number ? '': 'disable')}onClick={ () => setNumber(!number) }>資料番号{(all || number) && (<>に一致</>)}</button>
				<button className={'link-button small ' + (all || jpName ? '': 'disable')}onClick={ () => setJpName(!jpName) }>和名{(all || jpName) && (<>に一致</>)}</button>
				<button className={'link-button small ' + (all || jpFamilyName ? '': 'disable')}onClick={ () => setJpFamilyName(!jpFamilyName) }>科名{(all || jpFamilyName) && (<>に一致</>)}</button>
				<button className={'link-button small ' + (all || enName ? '': 'disable')}onClick={ () => setEnName(!enName) }>学名{(all || enName) && (<>に一致</>)}</button>
				<button className={'link-button small ' + (all || enFamilyName ? '': 'disable')}onClick={ () => setEnFamilyName(!enFamilyName) }>科名(EN){(all || enFamilyName) && (<>に一致</>)}</button>
			</div>
		</div>
		{isLoading && (
			<Loading />
		) || (<>
			<Pagination
				data={data}
				page={page}
				setPage={setPage}
			/>
			<table className="search alternate">
			<thead>
				<tr>
					<th className="link"></th>
					{(true || all || number) && <th>資料番号</th>}
					<th>種名(和名)</th>
					<th>学名</th>
					<th>科名(和名)</th>
					<th>科名(欧名)</th>
				</tr>
			</thead>
			<tbody>
			{Object.keys(data.data).map((key) => (
				<tr key={`${data.data[key]['number']}`}>
					{(true || all || number) && (
						<Link
							className="link-button small"
							to={`/detail/${data.data[key]['number']}`}
							state={{
								prev: location.pathname,
							}}
						>
							詳細
						</Link>
					) || (
						<td>
							<Link
								to={`/list/?en_name=${data.data[key]['en_name']}&jp_name=${data.data[key]['jp_name']}&en_family_name=${data.data[key]['en_family_name']}&jp_family_name=${data.data[key]['jp_family_name']}`}
							>
								見る
							</Link>
						</td>
					)}
					{(true || all || number) && <th><div className="td-inner">{data.data[key]['number']}</div></th>}
					<td><div className="td-inner">{data.data[key]['jp_name']}</div></td>
					<td><div className="td-inner">{data.data[key]['en_name']}</div></td>
					<td><div className="td-inner">{data.data[key]['jp_family_name']}</div></td>
					<td><div className="td-inner">{data.data[key]['en_family_name']}</div></td>
				</tr>
			))}
			</tbody>
			</table>
		</>)}
	</Layout>);
}

export default PageSearch;

