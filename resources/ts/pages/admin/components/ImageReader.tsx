import React from 'react';
import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';

/**
 * 後々、API も足す
 */
const ImageReader = ({ multiple = true, imageRead }) =>
{
	const FileRead = async (e) =>
	{
		e.preventDefault();

		const files = [];
        e.stopPropagation();
		[].forEach.call(e.target.files, (f) =>
		{
			files.push({
				name: f.name,
				src: '',
				file: f,
			});
		});


		for (let i = 0; i < files.length; i++) // map ではだめというか面倒
		{
			files[i].src = await imageSrc(files[i].file);
		}

		imageRead(files);
	}

	const imageSrc = (file) =>
	{
		return new Promise((resolve, reject) =>
		{
			const reader = new FileReader();
			console.log(reader);
			reader.onload = (e) =>
			{
				resolve(e.target.result);
			}
			reader.readAsDataURL(file); // TODO fxxk ie
		});
	}

/*
	// アップロードのハンドラ
	const fileOnChange = (callback) =>
	{
		const files = this.fileInput?.current?.files;
		if (files)
		{
			[].forEach.call(files, callback);
		}
	}
*/


	return(
		<div>
			<label>ファイル
				<input
					type="file"
					multiple={true}
					onChange={FileRead}
				/>
			</label>
		</div>
	);

}

export default ImageReader;
