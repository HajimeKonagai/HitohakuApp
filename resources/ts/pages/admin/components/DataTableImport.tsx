import React, { useEffect, useState } from 'react';
import Encoding from 'encoding-japanese'

const DataTableImport = ({
	data,
	encoding,
	postTypeFields,
	searchField,
	importFields,
	importSetting,
	importData,
	setImportData,
	importResult,
	setImportResult,

	ignoreHeader,
	ignoreFooter,
}) =>
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

	const check = (i) =>
	{
		const newData = {...importData};
		if (newData[i])
		{
			delete newData[i];
		}
		else
		{
			newData[i] = {
				result: {},
			};
		}

		setImportData(newData);
	}

	const checkAll = () =>
	{
		const newData = {};
		data.map((item, i) =>
		{

			if (
				i >= ignoreHeader &&
				i < (data.length - ignoreFooter)
			)
			{
				newData[i] = {};
			}

		});
		setImportData(newData);
	}
	const uncheckAll = () =>
	{
		setImportData({});
	}

	return(<>
		<table className="widefat data-table-import">
			<thead>
				<tr>
					<th>
						インポート対象
						<button onClick={ checkAll }>チェック</button>
						<button onClick={ uncheckAll }>外す</button>
					</th>
					<th>結果<button onClick={() => setImportResult({})}>クリア</button></th>
					<th>検索[{searchField.from}]→[
						{postTypeFields.find(element => searchField.to == element.name) ?
						postTypeFields.find(element => searchField.to == element.name).label: searchField.to}
					]</th>

					<th className="spacer"></th>

					{importFields &&
						importFields.map((item, key) =>
						{
							return <th>[{item.from}]→[
								{postTypeFields.find(element => item.to == element.name)  ?
								postTypeFields.find(element => item.to == element.name).label: item.to}
							]にインポート</th>
						})
					}

				</tr>
			</thead>
			<tbody>
			{
				data.map((item, i) =>
				{
					return (<tr>

						<th>
							<input type="checkbox" checked={importData[i]} onChange={ () => check(i)} />
							
							{importData[i] && importData[i].dry && (<span>テスト済</span>)}
						</th>

						<td className="result">
							{importResult[i] && (
								<>
								{importResult[i].map((result) => (
									<div className={result.key}>
									<h3>{result.key == 'live' ? '実行結果': 'テスト結果'}</h3>
									<ul>
									{result.results.error.map((item) => (
										<li className="error">{item}</li>
									))}
									{result.results.warning.map((item) => (
										<li className="warning">{item}</li>
									))}
									{result.results.message.map((item) => (
										<li className="message">{item}</li>
									))}
									</ul>
									</div>
								))}
								</>
							) || (
								<span style={{ color: 'gray'}}>no result</span>
							)}
						</td>

						<td>{
							valReplace(
								encode(item[searchField.from]),
								searchField.replace
							)
						}</td>

						<td className="spacer"></td>

						{importFields &&
							importFields.map((importField, key) =>
							{
								return <td>
									{item[importField.from] &&
										valReplace(
											encode(item[importField.from]),
											importField.replace
										)
									}
								</td>
							})
						}

					</tr>)
				})
			}
			</tbody>
		</table>
	</>);
}

/*
const _ImportResult = ({result}) =>
{
	const style = {};
	if (result.status == 'error') style.color = 'red';

	return (<div>
		<span>[
			{result.live ? '本番': 'テスト'}
		]</span>
		<span style={style}>
			[{result.status}]
			{result.message && result.message}
		</span>
		<ul>
		{result.import_result && Object.keys(result.import_result).map((irk) =>
		{
			const ir = result.import_result[irk];
			return (<li>
				{ir.view && <a href={ir.view}>閲覧</a>}
				{ir.edit && <a href={ir.edit}>編集</a>}
				{ir.change && Object.keys(ir.change).map((ck) => {
					return (<span>
						{ck}:
						"{0 in ir.change[ck] && ir.change[ck][0]}" →
						"{1 in ir.change[ck] && ir.change[ck][1]}"
					</span>);
				})}
			</li>)
		})}
		</ul>
	</div>);
}
*/

export default DataTableImport;
