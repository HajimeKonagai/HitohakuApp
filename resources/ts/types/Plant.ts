type Plant = {
	id: number;
	number         : string
	file_name      : string;
	title          : string;
	name           : string;
	en_family_name : string;
	en_name        : string;
	jp_family_name : string;
	jp_name        : string;

	en_family_name_initial: string;
	en_name_initial: string;
	jp_family_name_initial: string;
	jp_name_initial: string;

	collect_country: string;
	collect_pref   : string;
	collect_city   : string;
	collect_addr   : string;
	collect_date   : string|null;
	collect_number : string;
	collect_person : string;
	is_private     : boolean;
	rdb_country    : string;
	rdb_pref       : string;
	created_at     : string;
	updated_at     : string;
}

type Group = {
	initial: string;
	count: number;
}

type DetailParam = {
	jp_name: string;
	/*
	jp_family_name: string;
	en_name: string;
	en_family_name: string;
	page: number;
	perPage: number;
	*/
	perPage: number;
};


type SearchParam = {
	text: string;
	number?: number;
	jp_name?: number;
	jp_family_name?: number;
	en_name?: number;
	en_family_name?: number;
	page: number;
	perPage: number;
};



export {
	Plant,
	Group,
	DetailParam,
	SearchParam,
};
