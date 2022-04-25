type Pagination<T> = {
	data: T[];
	current_page: number;
	last_page: number;
	prev_page_url: string|null;
	next_page_url: string|null;
}

export {
	Pagination
}

