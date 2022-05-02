import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { CSVLink, CSVDownload } from "react-csv";
import ExcelJS from "exceljs";
import Encoding from 'encoding-japanese'


import { SearchParam, SearchParamAll } from '../../types/Admin';
import Loading from '../../components/Loading';

// import { Link, useParams } from 'react-router-dom';
// import { useGroup } from '../../queries/PlantQuery'

import { useImport, useLoadSetting, useSaveSetting, is_json } from '../../queries/AdminQuery'

import * as api from '../../api/AdminApi';
import { useIndex, useCount, useAll } from '../../queries/AdminQuery';

import { SearchField, SearchFieldDefault }  from './components/SearchField'
import { ImportFields, ImportFieldDefault }  from './components/ImportFields'

import DataTableRaw from './components/DataTableRaw'
import DataTableImport from './components/DataTableImport'
import CsvReader from './components/CsvReader'
import Setting from './components/Setting'
import Layout from './Layout';


import { Link, Outlet, useParams } from 'react-router-dom';
import Pagination     from '../../components/Pagination';
import { isNullishCoalesce } from 'typescript';


const AdminExport: React.VFC = () =>
{

	const columns = {
		'number': '資料番号',
		'jp_name': '種名（和名）',
		'jp_family_name': '科名（和名）',
		'en_name': '学名',
		'en_family_name': '科名（欧名）',
		'is_private': '非公開',
		/*
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
		*/
	};


	const encodeReverse = (value) =>
	{
		return Encoding.convert(value, {to: encoding, from: 'UNICODE'})
	}

	const valReplace = (value, replace) =>
	{
		let newValue = value.toString();
		replace.map((rep) => {
			newValue = newValue.replaceAll(rep.from, rep.to);
		});

		return newValue;
	}


	const valReplaceReverse = (value, replace) =>
	{
		if (value === null || value === undefined) return '';

		let newValue = value.toString();
		replace.map((rep) => {
			newValue = newValue.replaceAll(rep.to, rep.from);
		});

		return newValue;
	}


	const settingKey = 'csv';
	const setting_query = useLoadSetting(settingKey);
	const settings = !setting_query.isLoading && is_json(setting_query.data.value) ? JSON.parse(setting_query.data.value):[];

	const [ settingName, setSettingName ] = useState('');

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



	

	const exportCsv = async (isHeader, format) =>
	{
		const count = await api.count(searchValuesAll);

		if (count > 10000)
		{
			if (!confirm('データの件数が' + count + '件あり、出力に時間がかかります。出力してもよろしいですか？'))
			{
				return;
			}
		}

		const data = await api.all(searchValuesAll);

		const workbook = new ExcelJS.Workbook();
		workbook.addWorksheet("sheet1");
		const worksheet = workbook.getWorksheet("sheet1");

		const headers = [];

		importFields.map((item, key) => {
			if (headers.length < item.from)
			{
				for (let i = headers.length; i < item.from; i++)
				{
					if (isHeader)
					{
						headers.push({
							header: "",
							key: i,
						});
					}
					else
					{
						headers.push({
							key: i,
						});	
					}
				}
			}
			if (isHeader)
			{
				headers.splice(item.from, 0, {
					header: dbFields.find(element => item.to == element.name) ? dbFields.find(element => item.to == element.name).label: item.to,
					key: item.to,
				});
			}
			else
			{
				headers.splice(item.from, 0, {
					key: item.to,
				});
			}
		});

		worksheet.columns = headers;

		data.map((item) => {
			const addRow = {};
			importFields.map((importField) => {
				const value = importField.to in item ? valReplaceReverse(item[importField.to], 'replace' in importField ? importField.replace: []): '';
				addRow[importField.to] = value;
			});
			console.log('addRow', addRow);
			worksheet.addRow(addRow);
		});


		const uint8Array =
		format === "xlsx"
		  ? await workbook.xlsx.writeBuffer()
		  : encoding === "UTF8"
		  ? await workbook.csv.writeBuffer()
		  : new Uint8Array(
			  Encoding.convert(await workbook.csv.writeBuffer(), {
				from: "UTF8",
				to: "SJIS"
			  })
			);
		const blob = new Blob([uint8Array], {
			type: "application/octet-binary"
		});
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = settingName + "." + format;
		a.click();
		a.remove();

	}

	const [ page, setPage ] = useState(1);
	const perPage = 25;

	const [ searchValues, setSearchValues ] = useState<SearchParam>({
		page: page,
		perPage: perPage,
	});
	const [ searchValuesAll, setSearchValuesAll ] = useState<SearchParamAll>({});

	const previewData = useIndex(searchValues);
	const countData = useCount(searchValuesAll);

	const [ number, setNumber ] = useState('');
	const [ jpName, setJpName ] = useState('');
	const [ jpFamilyName, setJpFamilyName ] = useState('');
	const [ enName, setEnName ] = useState('');
	const [ enFamilyName, setEnFamilyName ] = useState('');

	useEffect(() => {
		search();
	}, [page]);


	const search = () =>
	{
		let values:SearchParam = {
			page: page,
			perPage: perPage,
		};
		let valuesAll:SearchParamAll = {};

		if (number != '') values.number = number;
		if (jpName != '') values.jp_name = jpName;
		if (jpFamilyName != '') values.jp_family_name = jpFamilyName;
		if (enName != '') values.en_name = enName;
		if (enFamilyName != '') values.en_family_name = enFamilyName;

		if (number != '') valuesAll.number = number;
		if (jpName != '') valuesAll.jp_name = jpName;
		if (jpFamilyName != '') valuesAll.jp_family_name = jpFamilyName;
		if (enName != '') valuesAll.en_name = enName;
		if (enFamilyName != '') valuesAll.en_family_name = enFamilyName;

		setSearchValues(values);
		setSearchValuesAll(valuesAll);
	}

	useEffect(() => {
		const timer = setTimeout(() => {

			if (page != 1)
			{
				setPage(1);
			}
			else
			{
				search();
			}

		}, 500)

		return () => clearTimeout(timer)
	}, [number, jpName, jpFamilyName, enName, enFamilyName]);

	const title = 'CSVエクスポート';


	const applySetting = (i) =>
	{
		if (!settings[i]) return;

		const setting = settings[i];
		setSettingName(setting.name);
		setEncoding(setting.encoding);
		setSearchField(setting.searchField);
		setImportFields(setting.importFields);
		/*
		setImportSetting(setting.importSetting);
		setIgnoreHeader(setting.ignoreHeader);
		setIgnoreFooter(setting.ignoreFooter);
		*/

	}

	const importColumns = [];
	importFields.map((item, key) => {
		if (importColumns.length < item.from)
		{
			for (let i = importColumns.length; i < item.from; i++)
			{
				importColumns.push('');
			}
		}
		importColumns.splice(item.from, 0, item.to);
	});



	console.log('importColumns', importFields);

	return (<Layout title={title}>
		<div className='export import'>

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
									<td><button onClick={() => applySetting(i)}>load</button></td>
								</tr>
							))}
							</tbody>
						</table>)}
					</td>
				</tr>
			</tbody>
		</table>

		<h2>データの抽出{countData.isLoading && `(読み込み中...)` || `(${countData.data}件)` }</h2>
		<table className="widefat fixed striped">
			<tbody>
				<tr>
					<th>絞り込み</th>
					<td>
					<form
						onSubmit={(e) => {
							e.preventDefault();

							if (page != 1)
							{
								setPage(1);
							}
							else
							{
								search();
							}

						}}
						className="search"
					>
						<label>
							<span>{columns['number']}</span>
							<input
								type="text"
								onChange={(e) => setNumber(e.target.value)}
							/>
						</label>
						<label>
							<span>{columns['jp_name']}</span>
							<input
								type="text"
								onChange={(e) => setJpName(e.target.value)}
							/>
						</label>
						<label>
							<span>{columns['jp_family_name']}</span>
							<input
								type="text"
								onChange={(e) => setJpFamilyName(e.target.value)}
							/>
						</label>
						<label>
							<span>{columns['en_name']}</span>
							<input
								type="text"
								onChange={(e) => setEnName(e.target.value)}
							/>
						</label>
						<label>
							<span>{columns['en_family_name']}</span>
							<input
								type="text"
								onChange={(e) => setEnFamilyName(e.target.value)}
							/>
						</label>

						{ /* <input className="link-button" type="submit" value="検索" /> */ }
					</form>


					</td>
				</tr>
			</tbody>
		</table>


		<h2>出力{countData.isLoading && `(読み込み中...)` || `(${countData.data}件)` }</h2>
		{settingName && (
		<table>
			<thead>
					<tr>
						<th>セッティング</th>
						<td>{settingName}</td>
					</tr>
					<tr>
						<th>Encoding</th>
						<td>{encoding}</td>
					</tr>
			</thead>
			<tbody>
				<tr>
					<th>出力</th>
					<td>
						<button onClick={() => exportCsv(true, 'csv')}>csv ヘッダーあり</button>
						<button onClick={() => exportCsv(false, 'csv')}>csvヘッダーなし</button>
						<button onClick={() => exportCsv(true, 'xlsx')}>xlsx ヘッダーあり</button>
						<button onClick={() => exportCsv(false, 'xlsx')}>xlsx ヘッダーなし</button>
					</td>
				</tr>
			</tbody>
		</table>
		) || (<p>
			設定を  LOAD してください。
		</p>)}



		<h2>プレビュー{countData.isLoading && `(読み込み中...)` || `(${countData.data}件)` }<small>(※実際の出力はページごとではなく全て出力されます)</small></h2>
		{previewData.isLoading && (
			<Loading />
		) || (<>
			{importColumns.length > 0 && (<>
			<Pagination
				data={previewData.data}
				page={page}
				setPage={setPage}
			/>
			<table className="alternate data-table-import">
				<thead>
					<tr>
					{importColumns &&
						importColumns.map((column) =>
						{
							return <th>
								{dbFields.find(element => column == element.name)  ?
								dbFields.find(element => column == element.name).label: column}
							</th>
						})
					}
					</tr>

				</thead>
				<tbody>
					{previewData.data.data.map((item) => (
					<tr
						key={item.number}
					>


					{importColumns &&
						importColumns.map((column) =>
						{
							console.log(column, item[column]);
							return <td>
								{column in item ? valReplaceReverse(item[column],  importFields.find(importField => importField.to == column) && 'replace' in importFields.find(importField => importField.to == column) ? importFields.find(importField => importField.to == column).replace: []): ''}
							</td>
						})
					}
					</tr>
					))}
				</tbody>
			</table>
			<Pagination
				data={previewData.data}
				page={page}
				setPage={setPage}
			/>
			</>) || (<p>
				設定を  LOAD してください。
			</p>)}
		</>)}

		</div>
	</Layout>);
}

export default AdminExport;

