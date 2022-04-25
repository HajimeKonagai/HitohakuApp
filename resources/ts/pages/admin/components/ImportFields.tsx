import React from 'react';
import ReactDOM from 'react-dom';


export const ImportFieldDefault = {
		from: '',
		to: name,
		replace: [],
		taxonomy_search: 'name',
};

const ImportField = ({
	item,
	index,
	setFields,
	postTypeFields,
	fromFields,
}) =>
{
	const deleteImportField = (i) =>
	{
		setFields((prev) =>
		{
			const next = prev.slice();
			next.splice(i, 1);
			return next;
		});
	}

	const importFieldChange = (i, key, value) =>
	{
		setFields((prev) =>
		{
			const next = prev.slice();
			const newObj = {};
			newObj[key] = value;
			next[i] = {...prev[i], ...newObj};
			return next;
		});
	}



	const addImportFieldReplace = (i) =>
	{
		setFields((prev) =>
		{
			const next = prev.slice();
			next[i].replace.push({
				from: '',
				to: '',
			});
			return next;
		});
	}
	const removeImportFieldReplace = (i, ri) =>
	{
		setFields((prev) =>
		{
			const next = prev.slice();
			next[i].replace.splice(ri, 1);
			return next;
		});
	}

	const changeImportFieldReplace = (value, i, ri, key) =>
	{
		setFields((prev) =>
		{
			const next = prev.slice();
			next[i].replace[ri][key] = value;
			return next;
		});
	}




	return (
		<tr>
			<td>
				<select
					onChange={(e) => importFieldChange(index, 'from', e.target.value) }
					value={item.from}
				>
				<option value=""></option>
				{fromFields.map((item) =>
					{
						return <option value={item}>{item}</option>;
					})
				}
				</select>
			→</td>
			<td>
				<input
					type="text"
					value={item.to}
					onChange={(e) => importFieldChange(index, 'to', e.target.value) }
				/>
				<span>
				{postTypeFields.find(element => item.to == element.name) &&
					postTypeFields.find(element => item.to == element.name).label
				}
				</span>
			</td>
			<td>
				<ul>
				{
					item.replace.map((r_v, r_i) =>
					{
						return (<li>
							<input type="text" value={r_v.from} size={6}
								onChange={ (e) => changeImportFieldReplace(e.target.value, index, r_i, 'from') } />
							→
							<input type="text" value={r_v.to}   size={6}
								onChange={ (e) => changeImportFieldReplace(e.target.value, index, r_i, 'to') } />


							<button onClick={() => removeImportFieldReplace(index, r_i)}>remove</button>
						</li>);
					})
				}
				</ul>
			<button onClick={() => addImportFieldReplace(index)}>文字の置き換え追加</button>

			</td>
			<td>
				<button onClick={() => deleteImportField(index)}>remove</button>
			</td>
		</tr>
	);
}

export const ImportFields = ({
	fields,
	setFields,
	postTypeFields,
	fromFields,
}) =>
{

	const addImportField = (name) =>
	{
		setFields((prev) =>
		{
			const newObj = {...ImportFieldDefault}; // TODO Lib 化して深いコピー
			newObj.replace = []; // TODO Lib 化して深いコピー
			newObj.to = name;
			const newArr = prev.slice();
			console.log(prev);
			console.log(newArr);
			newArr.push(newObj)
			return newArr;
		});
	}

	return (<>
		<h3>インポートフィールド</h3>

		<table className="import-field widefat fixed striped">
			<thead>
				<tr>
					<th>ファイルの〜から</th>
					<th>〜にインポート</th>
					<th>文字の置き換え</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
			{
				fields.map((item, i) =>
				{
					return <ImportField
						item={item}
						index={i}
						setFields={setFields}
						postTypeFields={postTypeFields}
						fromFields={fromFields}
					/>
				})
			}
			</tbody>
			<tfoot>
				<tr>
					<td colSpan={4}>
					{
						postTypeFields.map((item) =>
						{
							return (
								<button
									onClick={ () => addImportField(item.name) }
									value={item.name}
								>
									{item.label}
									{item.postTypes.length > 1 && '(' + item.postTypes.length + ')'}
								</button>
							);
						})
					}
					</td>
				</tr>
			</tfoot>
		</table>
	</>);

}

export default ImportFields;
