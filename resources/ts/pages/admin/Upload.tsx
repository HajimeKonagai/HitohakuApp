import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
// import { Link, useParams } from 'react-router-dom';
// import { useGroup } from '../../queries/PlantQuery'

// import MediaImporterClient from '../../lib/media-importer-client/MediaImporterClient';
import Loading from '../../components/Loading';

import { useUpload, useLoadSetting, useSaveSetting, is_json } from '../../queries/AdminQuery'
import ImageReader from './components/ImageReader';
import DataTableMedia from './components/DataTableMedia';
import Layout from './Layout';


const AdminUpload: React.VFC = () =>
{
	const settingKey = 'media';
	const setting_query = useLoadSetting(settingKey);
	const settings = !setting_query.isLoading && is_json(setting_query.data.value) ? JSON.parse(setting_query.data.value):[];
	const saveSetting = useSaveSetting(settingKey, (success) => { if (success) setSettingName('')});

	const [ files, setFiles ] = useState([]);

	const imageRead = (files) =>
	{
		setFiles((prev) => {
			const newFiles = prev.slice();
			files.map((file) => {
				newFiles.push(file);
			});

			return newFiles;
		});
	}

	// setting
	// const [ settings, setSettings ] = useState([]);
	const [ settingName, setSettingName ] = useState('')
	const [ rotateHorizontal, setRotateHorizontal ] = useState(false);
	const [ overwrite, setOverwrite ] = useState(false);
	const [ reportNotExistDb, setReportNotExistDb ] = useState(false);

	const addSetting = () =>
	{
		if (!settingName)
		{
			toast.error('名前を入力してください');
			return;
		}
		for (let key in settings)
		{
			if (settings[key].name == settingName)
			{
				toast.error('名前が重複しています');
				return;
			}
		}

		const newSetting = settings.slice();
		newSetting.push({
			name: settingName,
			rotateHorizontal: rotateHorizontal,
			overwrite: overwrite,
			reportNotExistDb: reportNotExistDb,
		});

		saveSetting.mutate({
			key: settingKey,
			value: JSON.stringify(newSetting),
		});
	}

	const removeSetting = (i) =>
	{
		const newSetting = settings.slice();
		newSetting.splice(i, 1);

		saveSetting.mutate({
			key: settingKey,
			value: JSON.stringify(newSetting),
		});
	}

	const applySetting = (i) =>
	{
		if (!settings[i]) return;

		const setting = settings[i];
		console.log(setting.rotateHorizontal);
		setRotateHorizontal(setting.rotateHorizontal);
		setOverwrite(setting.overwrite);
		setReportNotExistDb(setting.reportNotExistDb);
	}


	// import
	const [ live, setLive ] = useState(false);
	const [ importRunning, setImportRunning ] = useState(false);
	const [ renames, setRenames ] = useState([]);
	const [ importData, setImportData ] = useState({});
	const [ importResult, setImportResult ] = useState({});
	const [ confirmed, setConfirmed ] = useState(false);

	useEffect(() => {
		if (live) setImportRunning(true);
	}, [live]);

	useEffect(() => {
		if (importRunning) runImport();
	}, [importRunning]);

	useEffect(() => {
		if (importRunning) runImport();
	}, [importResult]);


	const uploadQuery = useUpload({
		onSuccess: (data) =>
		{
			const key = live ? 'live': 'test';

			const newImportData = {...importData};
			const newResult = {...importResult};

			if (live)
			{
				delete newImportData[data.index];
			}
			else
			{
				newImportData[data.index].dry = true;
			}

			if (!newResult[data.index]) newResult[data.index] = [];
			newResult[data.index].push({
				key: key,
				results: data.results,
			});

			setImportData(newImportData);
			setImportResult(newResult);
		},
		onError: (error: AxiosError) =>
		{
			console.log('DataTableMedia onError', error);
		}
	});

	const runImport = () => 
	{

		if (live && overwrite && !confirmed)
		{
			if (!confirm('すでにファイルが存在する場合は上書きします。まずテストを行い消えてもいいファイルかどうか確認してから行ってください。'))
			{
				console.log('キャンセル');
				setImportRunning(false);
				setLive(false);
				return;
			}
			else
			{
				setConfirmed(true);
			}
		}


		if (!importRunning) return;

		const postData = Object.keys(importData)
			.filter(key => {
				if (!live)
				{
					return !importData[key].dry;
				}
				else
				{
					return true;
				}
			})
			.slice(0, 1); // 1つずつ


		if (postData.length <= 0)
		{
			setImportRunning(false);
			setLive(false);
			setConfirmed(false);
			return;
		}

		// let params = {};
		const params = new FormData();
		postData.map((key) =>
		{
			const item = files[key];
			params.append('index', key);
			params.append('name', renames[key] ? renames[key] + '.' + item.name.split('.').pop(): item.name);
			params.append('file', item.file);
		});

		if (live) params.append('live', '1');
		if (rotateHorizontal) params.append('rotateHorizontal', '1');
		if (live && overwrite) params.append('overwrite', '1');
		if (reportNotExistDb) params.append('reportNotExistDb', '1');



		uploadQuery.mutate(params);

		return;
	}


	const clearAll = () =>
	{
		setFiles([]);
		setRenames([]);
		setImportData([]);
		setImportResult([]);
	}

	const title = '写真アップロード';

	return (<Layout title={title}>
		<>


		<h2>設定</h2>
		<table className="widefat fixed striped">
			<tbody>
				<tr>
					<th>保存した設定</th>
					<td>
						{settings.isLoading && (
							<Loading />
						) || (<table className="seved-settings">
							<tbody>
							{settings.map((setting, i) => (
								<tr>
									<th>{setting.name}</th>
									<td><button onClick={() => applySetting(i)}>LOAD</button></td>
									<td><button onClick={() => removeSetting(i)}>DELETE</button></td>
								</tr>
							))}
							</tbody>
						</table>)}
					</td>
				</tr>


				<tr>
					<th>実行時設定</th>
					<td>
						<label>
							<input
								type="checkbox"
								checked={rotateHorizontal}
								onChange={() => setRotateHorizontal(!rotateHorizontal) }
							/>
							画像が横向きの場合に縦向きに変更
						</label><br />
						<label>
							<input type="checkbox" checked={reportNotExistDb} onClick={() => setReportNotExistDb(!reportNotExistDb) } />
							ファイル名のデータがデータベースになければレポートする
						</label><br />
						<label>
							<input type="checkbox" checked={overwrite} onClick={() => {setOverwrite(!overwrite)} } />
							ファイルがすでにあった場合に、上書きを許可
						</label>
					</td>
				</tr>

				<tr>
					<th>設定に名前をつけて保存</th>
					<td>
						<input
							value={settingName}
							onChange={(e) => setSettingName(e.target.value)}
							placeholder=""
						/>
						<button onClick={addSetting} >現在の設定を保存</button>
					</td>
				</tr>

			</tbody>
		</table>

		<div>
			<h2>画像ファイル</h2>

			<table className="widefat fixed striped">
			<tbody>
				<tr>
					<th>ファイル読み込み</th>
					<td>
					{files.length < 1 && (<ImageReader
						imageRead={imageRead}
					/>) || (!live &&
						<button onClick={clearAll}>ファイルをクリア</button>
					)}
					</td>
				</tr>
			</tbody>
			</table>
		</div>


			<div>
				<h2>インポート</h2>
				{!importRunning &&
					<>
					<button onClick={() => setImportRunning(true)}>テストする</button>
					<button onClick={() => setLive(true)}>インポート</button>
					</>
				}
				{importRunning &&
					<>
					<button onClick={() => {
						setImportRunning(false);
						setLive(false);
					}}>キャンセル</button>
					残り{Object.keys(importData).length}
					</>
				}
			</div>



			<DataTableMedia
				data={files}
				renames={renames}
				setRenames={setRenames}
				importData={importData}
				setImportData={setImportData}
				importResult={importResult}
				setImportResult={setImportResult}
			/>
		</>

	</Layout>);
}

export default AdminUpload;

