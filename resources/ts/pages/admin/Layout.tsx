import React from 'react'

type Props = {
	children?: React.ReactNode;
	title: string;
}

const AdminLayout: React.VFC<Props> = ({ children, title }) =>
{
	return (<article className="admin">
		<div className="page-header">
			<h2>{title}</h2>
			<p></p>
		</div>
		<div className="page-body">
			{ children }
		</div>

	</article>);
}

export default AdminLayout;


