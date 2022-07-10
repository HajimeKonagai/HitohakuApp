import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDetail } from '../../queries/PlantQuery';
import { useStore, useUpdate, useRevision } from '../../queries/AdminQuery'
import Loading from '../../components/Loading';
import { PlantUpdate } from '../../types/Admin';
import ImageReader from './components/ImageReader';
import Layout from './Layout';

// import { Link, useParams } from 'react-router-dom';
// import { useGroup } from '../../queries/PlantQuery'



const AdminEdit: React.VFC = () =>
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

	const handleUpdated = (result) =>
	{
		if (result.number != data.number)
		{
			navigate(`/admin/edit/${result.number}`);
		}

		toast.success('更新しました。');
		setFile(null);
		setEditData({});
	}


	const { number } = useParams();
	const { data, isLoading } = useDetail(number);
	const [ editData, setEditData ] = useState<PlantUpdate>({});
	const [ file, setFile ] = useState(null);
	const update = useUpdate(number, handleUpdated);
	const revisions_data = useRevision(number);
	const revisions = revisions_data.data;
	const revisionIsLoading = revisions_data.isLoading;

	const title: string = '編集:' + number;


	const handleInputChange = (e) =>
	{
		const tmpData = {...editData};

		tmpData[e.target.name] = e.target.value;

		if (data[e.target.name] == e.target.value)
		{
			delete tmpData[e.target.name];
		}

		console.log('e.target.value', e.target.value);
		console.log('e.target.value', e.target.value);
		console.log('e.target.value', tmpData);
		setEditData(tmpData);
	}

	const applyRevision = (revision) =>
	{
		console.log(revision.revision);
		const values = JSON.parse(revision.revision);
		const tmpData = {...editData};

		for (let key in values)
		{
			if (data[key] != values[key])
			{
				tmpData[key] = values[key];
			}
		}
		
		setEditData(tmpData);
	}


	const handleUpdate = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) =>
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
		}


		update.mutate({
			number: number,
			params: params,
		});
	}


	const imageRead = (files) =>
	{
		console.log(files);
		files[0] && setFile(files[0]);
	}

	if (!isLoading) console.log('p data', data);
	if (!revisionIsLoading) console.log('revisions', revisions);


	// ファイル名用
	const dataNumber = editData?.number ? editData.number : data?.number;

	return (<Layout title={title}>
		{isLoading && (
			<Loading />
		) || (
		data && (
			<div className="form">
				<form onSubmit={handleUpdate}>
				<dl>
					{Object.keys(columns).map((key) => (<>
						<dt>{columns[key]}</dt>
						<dd>
							{key == 'is_private' ?
								(<select
									name={key}
									value={key in editData ? editData[key]: data[key] ? 1: 0}
									defaultValue={data[key] ? 1: 0}
									onChange={handleInputChange}
								>
									<option value="0"> - </option>
									<option value="1">非公開</option>
								</select>) :
								(<input
									type="text"
									name={key}
									value={editData[key]}
									defaultValue={data[key]}
									onChange={handleInputChange}
								/>)
							}
							{editData[key] && (<span className="edit">edit</span>)}
						</dd>
					</>))}
					<dt>現在の画像</dt>
					<dd>
						<img
							src={`/photo/full/${data['number']}/?${new Date().getTime()}`}
							style={{maxHeight: '100px', display: 'block'}}
						/>
						{file && (
							<span style={{color:'red'}}>現在のファイルを上書きします。(この操作は取り消せません)</span>
						) || (
							editData.number && (
								<><em>【ファイル名変更】</em>{data.file_name} → {editData.number + '.' + data.file_name.split('.').pop()}</>
							) || (
								<>{data.file_name}</>
							)
						)}
					</dd>
					<dt>画像の入れ替え</dt>
					<dd>
						{!file &&
							<ImageReader
								multiple={false}
								imageRead={imageRead}
							/>
						}
						{file && <button onClick={() => setFile(null) }>キャンセル</button>}
						<img
							src={file ? file.src : ''}
							style={{maxHeight: '100px', display: 'block'}}
						/>
						<span>
							{
							
								(file && dataNumber && file.name.lastIndexOf(".") != -1) && (
								file.name.substring(0, file.name.lastIndexOf(".")) == dataNumber && (
									<>{file.name}</>
								) || (
									<><em>【ファイル名変更】</em>{file.name} → {dataNumber + '.' + file.name.split('.').pop()}</>
								)
							)
							}
						</span><br />

					</dd>
				</dl>
				<button className="btn link-button small" onClick={handleUpdate}>更新</button>
				</form>

			</div>)
		) || (
			<div>この資料番号のデータはありません</div>
		)}

		{/*
		{revisionIsLoading && (
			<Loading />
		) || (<ul className="revision">
			{revisions && revisions.map((revision) => (
				<li onClick={() => applyRevision(revision)}>{revision.created_at}</li>
			))}
		</ul>)}
		*/}

	</Layout>);

}

export default AdminEdit;

