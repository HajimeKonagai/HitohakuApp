import React from 'react'

type Props = {
	data: any;
	page: number;
	setPage: (number) => {};
}

const Pagination: React.VFC = ( { data, page, setPage } : Props ) =>
{
	return (
			<nav className="pagination">
				<span className="page">
					<span className="current">{data.current_page}</span>/<span className="total">{data.last_page}</span>
				</span>
				{data.prev_page_url && (<button className="prev" onClick={() => setPage(page - 1)}>{page-1}</button>)}
				{data.next_page_url && (<button className="next" onClick={() => setPage(page + 1)}>{page+1}</button>)}
			</nav>
	);
}

export default Pagination;

