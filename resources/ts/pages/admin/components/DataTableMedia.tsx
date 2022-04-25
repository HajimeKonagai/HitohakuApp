import React, { useState, useEffect } from 'react';

// import ImportResult from './ImportResult';

const DataTableMedia = ({
	data,
	renames,
	setRenames,
	importData,
	setImportData,
	importResult,
	setImportResult,
}) =>
{

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
			newData[i] = { result: '' };
		});
		setImportData(newData);
	}

	const uncheckAll = () =>
	{
		setImportData({});
	}



	const changeName = (e,i) =>
	{
		const newRenames = renames.slice();
		console.log(e.target.value);
		if (e.target.value)
		{
			newRenames[i] = e.target.value;
		}
		else if (newRenames[i])
		{
			delete newRenames[i];
		}
		setRenames(newRenames);
	}


	return (<>
		<table className="widefat data-table-media">
			<thead>
				<tr>
					<th>
						インポート対象<br />
						<button onClick={ checkAll }>チェック</button>
						<button onClick={ uncheckAll }>外す</button>
					</th>

					<th>結果<button onClick={() => setImportResult({})}>クリア</button></th>
					<th className="spacer"></th>
					
					<th>画像プレビュー</th>
					<th>ファイル名</th>
				</tr>
			</thead>
			<tbody>
			{
				data.map((item, i) =>
				(<tr>
						<th>
							<input type="checkbox" checked={importData[i]} onChange={ () => check(i)} />
							{importData[i] && importData[i].dry && (<span>テスト済</span>)}
						</th>

						<td className="result">
						{console.log('importResult', i, importResult[i])}
							{importResult[i] && (
								<>
								{importResult[i].map((result) => (
									<div className={result.key}>
									<h3>{result.key == 'live' ? '実行結果': 'テスト結果'}</h3>
									<ul>
									{result.results.error.map((item) => (
										<li className="error">{item}</li>
									))}
									{result.results.message.map((item) => (
										<li className="message">{item}</li>
									))}
									</ul>
									</div>
								))}
								</>
							) || (
								<>no result</>
							)}
						</td>


						<td className="spacer"></td>

						<td>
							<img
								src={item.src}
								style={{maxHeight: '100px'}}
							/>
						</td>
						<td>
							{item.name}
							<input type="text" value={ renames[i] ? renames[i]: '' } onChange={(e) => changeName(e,i) } />
							{ renames[i] ? '.' + item.name.split('.').pop(): '' }
						</td>

					</tr>
				))
			}
			</tbody>
		</table>
	</>);
}


export default DataTableMedia;
