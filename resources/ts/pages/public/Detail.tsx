import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { useDetail } from '../../queries/PlantQuery';
import Loading from '../../components/Loading';
import Layout from './Layout';

const PageDetail: React.VFC = () =>
{
	const lensSize = 900;

	const columns = {
		'number': '資料番号',
		'jp_name': '種名（和名）',
		'jp_family_name': '科名（和名）',
		'en_name': '学名',
		'en_family_name': '科名（欧名）',
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
	};


	const { number } = useParams();
	const { data, isLoading } = useDetail(number);
	const [ showDetail, setShowDetail ] = useState(true);

	const [ zoom, setZoom ] = useState(false);
	const [ zoomXY, setZoomXY ] = useState([0,0]);
	const [ mouseXY, setMouseXY ] = useState([0,0]);

	const title: string = '資料詳細:' + number;

	const mouseMove = (e) =>
	{
		const diff = lensSize/2;

		setZoomXY([
			fullImage.current.width * (e.nativeEvent.offsetX / e.target.clientWidth) * -1 + diff,
			fullImage.current.height * (e.nativeEvent.offsetY / e.target.clientHeight) * -1 + diff,
		]);

		setMouseXY([
			e.nativeEvent.offsetX - diff + e.target.offsetLeft,
			e.nativeEvent.offsetY - diff + e.target.offsetTop,
		]);
	}


	const touchMove = (e) =>
	{

		const diff = lensSize/2;

		const rect = e.target.getBoundingClientRect()
        const offsetX = (e.touches[0].clientX - window.pageXOffset - rect.left) 
        const offsetY = (e.touches[0].clientY - window.pageYOffset - rect.top)


		setZoomXY([
			fullImage.current.width * (offsetX / e.target.clientWidth) * -1 + diff,
			fullImage.current.height * (offsetY / e.target.clientHeight) * -1 + diff,
		]);

		setMouseXY([
			offsetX - diff + e.target.offsetLeft,
			offsetY - diff + e.target.offsetTop,
		]);

	}

	const fullImageBox = React.createRef<HTMLDivElement>();
	const fullImage = React.createRef<HTMLImageElement>();

	return (<Layout title={title}>
		{isLoading && (
			<Loading />
		) || (<div className="detail">

			{data && 'number' in data && (<>
			<button
				onClick={ () => setZoom(!zoom)}
				className={'link-button ' + (zoom ? '': 'disable')}>
				拡大表示{zoom? 'OFF': 'ON'}
			</button>
			<div className="image">
				<img
					src={`/photo/large/${data['number']}`}
					onMouseMove={mouseMove}
					onTouchMove={touchMove}
					onTouchStart={touchMove}
				/>
				<div
					className="lens_img_box"
					ref={fullImageBox}
						style={{
							left: mouseXY[0],
							top: mouseXY[1],
							width: lensSize,
							height: lensSize,
							opacity: zoom ? 1: 0,
						}}
				>
					<img
						src={`/photo/full/${data['number']}`}
						ref={fullImage}

						style={{
							left: zoomXY[0],
							top: zoomXY[1]
						}}
					/>
				</div>
			</div>
			{!zoom && (
			<table>
				{showDetail && (
				<tbody>
				{Object.keys(columns).map((key) => (
					data[key] && (
						<tr>
							<th>{columns[key]}</th>
							<td>{data[key]}</td>
						</tr>
					) || (<></>)
				))}
				</tbody>
				)}
				<tfoot>
					<tr>
						<td colSpan={2}>
							<button className="link-button" onClick={() => setShowDetail(!showDetail)}>
								{showDetail ? 'テキスト情報を隠す' : 'テキスト情報を表示'}
							</button>
						</td>
					</tr>
				</tfoot>
			</table>
			)}
			</>) || (
				<div>データがありません</div>
			)}
		</div>)}
	</Layout>);
}

export default PageDetail;

