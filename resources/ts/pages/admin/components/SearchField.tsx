import React from 'react';
import ReactDOM from 'react-dom';


export const SearchFieldDefault = {
		from: '',
		to: '',
		replace: [],
		compare: '=',

};

export const SearchField = ({
	field,
	setField,
	postTypeFields,
	fromFields
}) =>
{
	const changeSearchField = (key, value) =>
	{
		setField((prev) =>
		{
			const next = {...prev};
			next[key] = value;
			return next;
		});
	}

	const addSearchReplace = () =>
	{
		setField((prev) =>
		{
			const next = {...prev};
			next.replace = [...prev.replace, {
				from: '',
				to: '',
			}];
			return next;
		});
	}
	const removeSearchReplace = (i) =>
	{
		console.log('remove');
		setField((prev) =>
		{
			const next = {...prev};
			next.replace.splice(i, 1);
			console.log(next);
			return next;
		});
	}
	const changeSearchReplace = (value, i, key) =>
	{
		setField((prev) =>
		{
			const next = {...prev};
			next.replace[i][key] = value;
			return next;
		});
	}


	return (
		<>
		<h3>検索対象フィールド</h3>
		<table className="widefat fixed striped">
			<thead>
				<tr>
					<th>ファイルの〜と</th>
					<th>〜を検索</th>
					<th>文字の置き換え</th>
					<th>検索メソッド</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<select
							value={field.from}
							onChange={(e) => changeSearchField('from', e.target.value)}
						>
							<option value=""></option>
							{fromFields && fromFields.map((item) =>
								{
									return <option value={item}>{item}</option>;
								})
							}
						</select>

					</td>
					<td>
						<select
							value={field.to}
							onChange={(e) => changeSearchField('to', e.target.value)}
						>
							<option value=""></option>
							<option value="id">ID</option>
							{postTypeFields.map((item) =>
							{
								return <option value={item.name}>{item.label}</option>
							})}
						</select>
					</td>
					<td>
						<ul>
						{
							field.replace.map((v, i) => 
							{
								return (<li>
									<input type="text" value={v.from} size={6} onChange={ (e) => changeSearchReplace(e.target.value, i, 'from') } />
									→
									<input type="text" value={v.to}   size={6} onChange={ (e) => changeSearchReplace(e.target.value, i, 'to') } />
									<button onClick={() => removeSearchReplace(i)}>remove</button>
								</li>);
							})
						}
						</ul>
						<button onClick={addSearchReplace}>追加</button>
					</td>
					<td>
						<select
							value={field.compare}
							onChange={(e) => changeSearchField('compare', e.target.value)}
						>
							<option value="=">完全一致</option>
							<option value="like">あいまい検索</option>
						</select>
						<p>※あいまい検索では「%」をワイルドカードとして使用できます。</p>
					</td>
				</tr>
			</tbody>
		</table>
		</>
	);
}

export default SearchField;
