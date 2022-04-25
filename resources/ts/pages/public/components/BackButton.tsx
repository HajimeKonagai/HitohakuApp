import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton: React.VFC = () =>
{
	const navigate = useNavigate();
	const location = useLocation();

	const handleClick = () => {
		navigate(-1);
	};

	let prev = '戻る';

	if (location.state?.prev)
	{

		const field = location.state.prev.split("/")[2] ? location.state.prev.split("/")[2]: false;
		const initial = location.state.prev.split("/")[3] ? decodeURI(location.state.prev.split("/")[3]) : '';

		if (location.state.prev.split("/")[1])
		{
			switch (location.state.prev.split("/")[1])
			{
			case 'initial':
				switch (field)
				{
				case 'jp_name': prev = '種名(和名)からさがす'; break;
				case 'jp_family_name': prev = '科名(和名)からさがす'; break;
				case 'en_name': prev = '学名(欧名)からさがす'; break;
				case 'en_family_name': prev ='科名(欧名)からさがす'; break;
				}
				break;
			case 'family':
				switch (field)
				{
				case 'jp_family_name': prev = '科名:「' + initial + '」から始まる'; break;
				case 'en_family_name': prev ='科名:「' + initial + '」から始まる'; break;
				}
				break;
			case 'group':
				switch (field)
				{
				case 'jp_name': prev = '種名(和名)「' + initial + '」から始まる'; break;
				case 'jp_family_name': prev = '科名:「' + initial + '」'; break;
				case 'en_name': prev = '学名(欧名)「' + initial + '」から始まる'; break;
				case 'en_family_name': prev ='科名:「' + initial + '」'; break;
				}
				break;
			case 'list':
				prev = '資料画像一覧';
				break;
			case 'detail':
				prev = '資料詳細';
				break;
			case 'search':
				prev = '自由検索';
				break;
			}
		}
		else if (location.state.prev = '/')
		{
			prev = 'トップ';
		}
	}

	if (location.pathname == '/' ) prev = '戻る';

	return (
		<button
			className="button-back"
			onClick={handleClick}
		>
			{prev}
		</button>
	);
}

export default BackButton;

