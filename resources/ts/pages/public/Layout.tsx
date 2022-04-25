import React from 'react'

type Props = {
	children?: React.ReactNode;
	title: string;
}

const PageLayout: React.VFC<Props> = ({ children, title }) =>
{
	return (<article className="public">
		<div className="page-header">
			<h2>{title}</h2>
			<p></p>
		</div>
		<div className="page-body">
			{ children }
		</div>
	</article>);
}
export default PageLayout;


