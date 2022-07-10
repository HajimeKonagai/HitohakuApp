import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import Encoding from 'encoding-japanese'

import Loading from '../../components/Loading';

// import { Link, useParams } from 'react-router-dom';
// import { useGroup } from '../../queries/PlantQuery'

import { useImport, useLoadSetting, useSaveSetting, is_json } from '../../queries/AdminQuery'

import { SearchField, SearchFieldDefault }  from './components/SearchField'
import { ImportFields, ImportFieldDefault }  from './components/ImportFields'

import DataTableRaw from './components/DataTableRaw'
import DataTableImport from './components/DataTableImport'
import CsvReader from './components/CsvReader'
import Setting from './components/Setting'
import Layout from './Layout';


const AdminImport: React.VFC = () =>
{
	const encode = (value) =>
	{
		return Encoding.convert(value, {to: 'UNICODE', from: encoding})
	}

	const valReplace = (value, replace) =>
	{
		let newValue = value.toString();
		replace.map((rep) => {
			newValue = newValue.replaceAll(rep.from, rep.to);
		});

		return newValue;
	}

	const settingKey = 'csv';
	const setting_query = useLoadSetting(settingKey);
	const settings = !setting_query.isLoading && is_json(setting_query.data.value) ? JSON.parse(setting_query.data.value):[];
	const saveSetting = useSaveSetting(settingKey, (success) => { if (success) /* setSettingName('') */ return; });

	const [ showSetting, setShowSetting ] = useState(false);

	const [ settingName, setSettingName ] = useState('');


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
			'name'          : settingName,
			'encoding'      : encoding,
			'searchField'   : searchField,
			'importFields'  : importFields,
			'importSetting' : importSetting,
			'ignoreHeader'  : ignoreHeader,
			'ignoreFooter'  : ignoreFooter, 
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
		setSettingName(setting.name);
		setEncoding(setting.encoding);
		setSearchField(setting.searchField);
		setImportFields(setting.importFields);
		setImportSetting(setting.importSetting);
		setIgnoreHeader(setting.ignoreHeader);
		setIgnoreFooter(setting.ignoreFooter);

	}


	const [ importSetting, setImportSetting ] = useState({
		// 空の値で上書きするか
		'emptyValue': false,
		// 2つ以上の件区結果があったとき、全てにインポートするか
		'multiple': false,
		// 検索結果 0 件だったとき、新規作成するか
		'create': false,
		// 更新を許可
		'update': false,
		'reportNotExistMedia': false,
	});
	const changeImportSetting = (key) =>
	{
		const newSetting = { ...importSetting };
		newSetting[key] = !importSetting[key];
		setImportSetting(newSetting);
	}

	const [ encoding, setEncoding ] = useState('SJIS');


	// const postTypeFields = Setting.createPostTypeFields(config, models);
	const dbFields = Setting.createDbFields();



	// SearchFields
	const [ searchField, setSearchField ] = useState({...SearchFieldDefault});
	// ImpportFields
	const [ importFields, setImportFields ] = useState([]);

	/*
	 // SettingPostTypes
	const [ postTypes, setPostTypes ] = useState([]);
	const postTypeFields = Setting.createPostTypeFields(props.config, postTypes);
	*/



	const [ showRawData, setShowRawData ] = useState(false);

	const [ fromFields, setFromFields ] = useState([]);
	const [ rawData, setRawData ] = useState([]);

	const csvRead = (csvArr) =>
	{
		console.log('csvArr', csvArr[0], Object.keys(csvArr[0]));
		// TODO 書く設定の from フィールドを変える

		setFromFields(Object.keys(csvArr[0]));
		setRawData(csvArr);

		setImportData({});
		setImportResult({});
	}

	// import
	const [ live, setLive ] = useState(false);
	const [ importRunning, setImportRunning ] = useState(false);
	const [ importData, setImportData ] = useState({});
	const [ importResult, setImportResult ] = useState({});

	const [ ignoreHeader, setIgnoreHeader ] = useState(0);
	const [ ignoreFooter, setIgnoreFooter ] = useState(0);

	useEffect(() => {
		if (live) setImportRunning(true);
	}, [live]);

	useEffect(() => {
		if (importRunning) runImport();
	}, [importRunning]);

	useEffect(() => {
		if (importRunning) runImport();
	}, [importResult]);



	const importQuery = useImport({
		onSuccess: (results) =>
		{
			const key = live ? 'live': 'test';
			const newImportData = {...importData};
			const newResult = {...importResult};

			console.log('DataTableMedia onSuccess', results);
			for (let index in results)
			{

				if (live)
				{
					delete newImportData[index];
				}
				else
				{
					newImportData[index].dry = true;
				}
				if (!newResult[index]) newResult[index] = [];
				newResult[index].push({
					key: key,
					results: results[index],
				});
			}

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
			.slice(0, 5); // 5つ


		if (postData.length <= 0)
		{
			setImportRunning(false);
			setLive(false);
			return;
		}

		// let params = {};
		const params = new FormData();

		if (live) params.append('live', '1');
		if (importSetting.emptyValue) params.append('emptyValue', '1');
		if (importSetting.multiple) params.append('multiple', '1');
		if (importSetting.create) params.append('create', '1');
		if (importSetting.update) params.append('update', '1');
		if (importSetting.reportNotExistMedia) params.append('reportNotExistMedia', '1');

		
		params.append('search[to]', searchField.to);
		params.append('search[compare]', searchField.compare);



		postData.map((key) =>
		{
			let post = {};
			const item = rawData[key];
			if (importFields)
			{
				const searchValue = valReplace(
					encode(item[searchField.from]),
					searchField.replace
				);

				params.append('posts[' + key + '][search]', searchValue);

				importFields.map((importField) =>
				{
					// if (item[importField.from])
					const value = valReplace(
						encode(item[importField.from]),
						importField.replace
					);

					console.log(importField.to);


					params.append('posts[' + key + '][fields][' + importField.to + ']', value);



					// category delimiter と 検索フィールド

					// post_type 検索が名前だったらスラッグに書き換え

				});
			}
		});

		console.log(params);

		importQuery.mutate(params);

		return;
	}

	const restoreDefault = () =>
	{
		const defaults = JSON.parse(Setting.defaultSettingJson);

		const newSetting = settings.slice();
		defaults.map((defaultItem) => {

			console.log(defaultItem);

			let defaultItemName = defaultItem.name;

			for (let key in settings)
			{
				if (settings[key].name == defaultItem.name)
				{
					defaultItem.name = defaultItem.name + '_';

					if (settings[key].name == defaultItem.name)
					{
						toast.error('「' + defaultItemName + '」もしくは「' + defaultItem.name + '」と名前が重複しています');
						return;
					}
				}
			}
	
	
			newSetting.push(defaultItem);
		});

		saveSetting.mutate({
			key: settingKey,
			value: JSON.stringify(newSetting),
		});

	}



	const title = 'CSVインポート';

	return (<Layout title={title}>
		<div className='import'>

		<h2>設定</h2>
		<p>
			<label><input type="checkbox" checked={showSetting} onChange={(e) => setShowSetting(!showSetting) }/>設定項目の表示</label>
		</p>
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
							<tfoot>
								<tr>
									<th colSpan={3}>
										<button onClick={restoreDefault}>デフォルトの設定を復帰</button>
									</th>
								</tr>
							</tfoot>
						</table>)}
					</td>
				</tr>


				{showSetting && <>
				<tr>
					<th>Encoding</th>
					<td>
						<select onChange={(e) => setEncoding(e.target.value)} value={encoding}>
							<option value="SJIS">SJIS</option>
							<option value="EUCJP">EUCJP</option>
							<option value="UTF8">UTF8</option>
						</select>
						<small>※文字化けする際に変更してみてください。</small>
					</td>
				</tr>

				<tr>
					<th>ヘッダー行・フッター行</th>
					<td>
						<label>
							最初から
							<input type="number" onChange={(e) => setIgnoreHeader(e.target.value)} value={ignoreHeader} />
							行を無視
						</label>

						<label>
							最後の
							<input type="number" onChange={(e) => setIgnoreFooter(e.target.value)} value={ignoreFooter} />
							行を無視
						</label>

					</td>
				</tr>

				<tr>
					<th>実行時設定</th>
					<td>
						<label>
							<input type="checkbox" checked={importSetting.create} onChange={ () => changeImportSetting('create') } />
							検索結果が0件の場合に、新規作成を許可
						</label><br />
						<label>
							<input type="checkbox" checked={importSetting.update} onChange={ () => changeImportSetting('update') } />
							データの更新を許可
						</label><br />
						<label>
							<input type="checkbox" checked={importSetting.emptyValue} onChange={ () => changeImportSetting('emptyValue') } />
							空の値の場合、すでに値が入っていても上書きする
						</label><br />
						<label>
							<input type="checkbox" checked={importSetting.multiple} onChange={ () => changeImportSetting('multiple') } />
							検索結果が2つ以上一致した際に、全てに値を入れる
						</label><br />
						<label>
							<input type="checkbox" checked={importSetting.reportNotExistMedia} onChange={ () => changeImportSetting('reportNotExistMedia') } />
							画像のファイルがない場合にレポートする。
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

				</>}
			</tbody>
		</table>

		{showSetting && <>
		<SearchField
			field={searchField}
			setField={setSearchField}
			postTypeFields={dbFields}
			fromFields={fromFields}
		/>


		<ImportFields
			fields={importFields}
			setFields={setImportFields}
			postTypeFields={dbFields}
			fromFields={fromFields}
		/>
		</>}


		<div>
			<h2>CSVファイル</h2>

			<table className="widefat fixed striped">
			<tbody>
				<tr>
					<th>ファイル読み込み</th>
					<td>
						{importRunning && rawData.length > 0 && (
							<span>インポート中にファイルの変更はできません</span>
						) || (
						<CsvReader
							callback={csvRead}
						/>
						)}
					</td>
				</tr>
			</tbody>
			</table>
		</div>


		<div style={{ marginTop: '3rem' }}>
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

		<div>
			<label>
				CSV元データ表示:
				<input type="checkbox" onChange={ (e) => setShowRawData(!showRawData) } checked={showRawData} />
			</label>
		</div>




		{!showRawData && <>
		<h3>インポートデータ
			
		</h3>
		<DataTableImport
			data={rawData}
			encoding={encoding}
			postTypeFields={dbFields}
			searchField={searchField}
			importFields={importFields}
			importSetting={importSetting}
			importData={importData}
			setImportData={setImportData}
			importResult={importResult}
			setImportResult={setImportResult}

			ignoreHeader={ ignoreHeader && parseInt(ignoreHeader) ? parseInt(ignoreHeader): 0}
			ignoreFooter={ ignoreHeader && parseInt(ignoreFooter) ? parseInt(ignoreFooter): 0}

		/>
		</>}


		{showRawData && <>
		<h3>元データ</h3>
		<DataTableRaw
			data={rawData}
			encoding={encoding}
		/>
		</>}

		</div>
	</Layout>);
}

export default AdminImport;

