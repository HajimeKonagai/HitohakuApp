import React from 'react';
import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react'

import Papa from 'papaparse'

/**
 * 後々、API も足す
 */
const CsvReader = (props) =>
{
	const FileRead = (e) =>
	{
		e.preventDefault();
        e.stopPropagation();
		const files = e.target.files;

		const file = files[0];
		if (!file) return;

		const reader = new FileReader();

		reader.onload = (e) =>
		{
			const result = e.target.result;

			const papa = Papa.parse(result);
			const csvArr = papa.data
			console.log('paraparse', papa.data);
			
			// const csvArr = csvArray(result);

			let colsNum = 0;
			for (let i =0; i < csvArr.length; i++)
			{
				colsNum = Math.max(csvArr[i].length, colsNum);
			}

			console.log(csvArr);

			props.callback(csvArr);
			/*
			this.setState({
				data: csvArr,
				colsNum: colsNum,
			});
			*/
		}

		// reader.readAsArrayBuffer(f);
		reader.readAsBinaryString(file); // TODO fxxk ie
	}

	const csvArray = (data) =>
	{
		// console.log(Encoding.detect(data));
		// data = this.encode(data);
		// console.log(data);
		const dataArray = []; //配列を用意
		const dataString = data.split('\n'); //改行で分割
		for (let i = 0; i < dataString.length; i++)
		{
			dataArray[i] = dataString[i].split(',');
			// dataArray[i][1] = this.encode(dataArray[i][1]);
		}

		return dataArray;
	}


	return(
		<div>
			<label>ファイル
				<input type="file" onChange={FileRead} />
			</label>
		</div>
	);

}

export default CsvReader;
