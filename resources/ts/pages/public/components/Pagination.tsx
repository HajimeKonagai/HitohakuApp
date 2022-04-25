import React from 'react'
import { Plant } from '../../../types/Plant'
import { Pagination } from '../../../types/Pagination'

type Props = {
	data: Pagination<Plant>;
	page: number;
	setPage: (page: number) => void;
	add?: number;
}


const Pagination: React.VFC<Props> = ( { data, page, setPage, add } ) =>
{
	if (!add) add = 3; // default

	const pages = [];
	const firstPageNum = Math.max(1, data.current_page - add);
	const lastPageNum = Math.min(data.last_page, data.current_page + add + (add + (firstPageNum - data.current_page)));

	for (let i = firstPageNum; i <= lastPageNum; i++)
	{
		pages.push(i);
	}

	return (
			<nav className="pagination">
				<span className="pages">
					{!pages.includes(1) && (<button className="page first link-button small" onClick={() => setPage(1)}>1</button>)}
					{!pages.includes(1) && !pages.includes(2) && (<span className="first"></span>)}
					{pages.map((p) => (
						p == data.current_page && (
							<span className="current page link-button small disable">{p}</span>
						) || (
							<button className="page link-button small" onClick={() => setPage(p)}>{p}</button>
						)
					))}
					{!pages.includes(data.last_page) && !pages.includes(data.last_page-1) && (<span className="last"></span>)}
					{!pages.includes(data.last_page) && (<button className="page last link-button small" onClick={() => setPage(data.last_page)}>{data.last_page}</button>)}
				</span>

				{data.prev_page_url && (<span className="prev" onClick={() => setPage(page - 1)}>{page-1}</span>)}
				{data.next_page_url && (<span className="next" onClick={() => setPage(page + 1)}>{page+1}</span>)}
			</nav>
	);
}

export default Pagination;

