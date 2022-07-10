import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDetail } from '../../queries/PlantQuery';
import { useStore } from '../../queries/AdminQuery'
import Loading from '../../components/Loading';
import { PlantUpdate } from '../../types/Admin';
import Layout from './Layout';
import ImageReader from './components/ImageReader';

const AdminCreate: React.VFC = () =>
{
	const columns = {
		'is_private': '非公開',
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

	const [ overwrite, setOverwrite ] = useState(false);

	const navigate = useNavigate();
	const handleStored = (data: any) =>
	{
		if (data)
		{
			setTimeout(() =>
			{
				navigate(`/admin/edit/${data.number}`);
				toast.success('新規作成しました。');
			}, 100);
		}
	}

	const handleUpdated = (success: boolean) =>
	{
		if (success)
		{
			setEditData({});
		}
	}


	const { number } = useParams();
	const data = {};

	const [ editData, setEditData ] = useState<PlantUpdate>({});
	const [ file, setFile ] = useState(null);
	const store = useStore(handleStored);
	const title: string = '新規作成';

	const handleInputChange = (e) =>
	{
		const tmpData = {...editData};

		tmpData[e.target.name] = e.target.value;

		if (data[e.target.name] == e.target.value)
		{
			delete tmpData[e.target.name];
		}

		setEditData(tmpData);
	}


	const handleStore = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) =>
	{
		e.preventDefault();

		if (!Object.keys(editData).length && !file)
		{
			toast('変更がありません');
			return;
		}

		let params = new FormData();
		for (let key in editData)
		{
			params.append(key, editData[key]);
		}

		if (file)
		{
			params.append('file', file.file);
			if (overwrite) params.append('overwrite', '1');
		}

		store.mutate({
			params: params,
		});
	}

	const imageRead = (files) =>
	{
		console.log(files);
		files[0] && setFile(files[0]);
	}


	return (<Layout title={title}>
		<div className="form">
			<form onSubmit={handleStore}>
			<dl>
				{Object.keys(columns).map((key) => (<>
					<dt>{columns[key]}</dt>
					<dd>
						{key == 'is_private' ?
							(<select
								name={key}
								defaultValue={data[key] ? 1: 0}
								onChange={handleInputChange}
							>
								<option value="0"> - </option>
								<option value="1">非公開</option>
							</select>) :
							(<input
								type="text"
								name={key}
								defaultValue={data[key]}
								onChange={handleInputChange}
							/>)
						}
						{editData[key] && (<span className="edit">edit</span>)}
					</dd>
				</>))}
				<dt>
					画像
				</dt>
				<dd>
					<ImageReader
						multiple={false}
						imageRead={imageRead}
					/>
					<img
						src={file ? file.src : ''}
						style={{maxHeight: '100px', display: 'block'}}
					/>
					<span>
						{
						
							(file && editData.number && file.name.lastIndexOf(".") != -1) && (
							file.name.substring(0, file.name.lastIndexOf(".")) == editData.number && (
								 <>{file.name}</>
							) || (
								<><em>【ファイル名変更】</em>{file.name} → {editData.number + '.' + file.name.split('.').pop()}</>
							)
						)
						}
					</span>
					<br />
					{file && (
						<label>
							<input type="checkbox" checked={overwrite} onClick={() => {setOverwrite(!overwrite)} } />
							ファイルがすでにあった場合に、上書きを許可
						</label>
					)}
				</dd>
			</dl>
			<button className="btn link-button small" onClick={handleStore}>新規作成</button>
			</form>

		</div>
	</Layout>);

}

export default AdminCreate;

