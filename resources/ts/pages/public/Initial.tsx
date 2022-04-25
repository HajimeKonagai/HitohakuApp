import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { useInitial } from '../../queries/PlantQuery'
import Loading           from '../../components/Loading';
import { LinkButton }    from './components/LinkButton';
import { DisableButton } from './components/DisableButton';
import Layout from './Layout';

const PageInitial: React.VFC = () =>
{
	const { field } = useParams();
	const { data, isLoading } = useInitial(field);

	const link_to: string = field.indexOf('family') > 0 ? 'family': 'group';

	const emptyLink = (<li>
		<DisableButton>　</DisableButton>
		<span className="count"></span>
	</li>);


	let title:string = '';
	switch (field)
	{
	case 'jp_name': title = '種名(和名)からさがす'; break;
	case 'jp_family_name': title = '科名(和名)からさがす'; break;
	case 'en_name': title = '学名(欧名)からさがす'; break;
	case 'en_family_name': title ='科名(欧名)からさがす'; break;
	}


	return (<Layout title={title}>
		{isLoading && (
			<Loading />
		) || (
		<ul className={`initial ${field}`}>
			{data && (
				Object.keys(data).map((key) => (<>
					<li key={key}>
						{data[key] > 0 && (
							<LinkButton to={`/${link_to}/${field}/${key}`}>
								{key}
							</LinkButton>
						) || (
							<DisableButton>
								{key}
							</DisableButton>
						)}
						<span className="count">({data[key]})</span>
					</li>
					{'ヤユワヲ'.indexOf(key) > -1 && emptyLink}
				</>))
			) || (<div>データがありません</div>)
			}
		</ul>



		)}

	</Layout>);
}

export default PageInitial;

