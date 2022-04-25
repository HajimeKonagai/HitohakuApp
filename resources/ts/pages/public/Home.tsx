import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';

import { LinkButton } from './components/LinkButton';
import Layout from './Layout';
import RandomDetail from './components/RandomDetail';

const PageHome: React.VFC = () =>
{
	return (<Layout title="ホーム">
		<ul className="home">
			<li><LinkButton to="/initial/jp_name">種名(和名)からさがす</LinkButton></li>
			<li><LinkButton to="/initial/jp_family_name">科名(和名)からさがす</LinkButton></li>
			<li><LinkButton to="/initial/en_name">学名(欧名)からさがす</LinkButton></li>
			<li><LinkButton to="/initial/en_family_name">科名(欧名)からさがす</LinkButton></li>
			<li><LinkButton to="/search">自由検索</LinkButton></li>
		</ul>
		<RandomDetail />
	</Layout>);
}

export default PageHome;
