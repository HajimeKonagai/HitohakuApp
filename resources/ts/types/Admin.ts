type SearchParam = {
	number?: string;
	jp_name?: string;
	jp_family_name?: string;
	en_name?: string;
	en_family_name?: string;
	page: number;
	perPage: number;

	order_by?: string;
	order?: string;
};

type PlantUpdate = {
	id?             : number;
	number?         : string
	file_name?      : string;
	title?          : string;
	name?           : string;
	en_family_name? : string;
	en_name?        : string;
	jp_family_name? : string;
	jp_name?        : string;

	collect_country?: string;
	collect_pref?   : string;
	collect_city?   : string;
	collect_addr?   : string;
	collect_date?   : string|null;
	collect_number? : string;
	collect_person? : string;
	is_private?     : boolean;
	rdb_country?    : string;
	rdb_pref?       : string;
	created_at?     : string;
	updated_at?     : string;
	file?           : File;
}

type Log = {
	id         : number;
	job        : string;
	content    : string;
	number     : string;
	revision   : string;
	created_at : string;
	updated_at : string;
}

type SearchParamAll = {
	number?: string;
	jp_name?: string;
	jp_family_name?: string;
	en_name?: string;
	en_family_name?: string;
};


export {
	SearchParam,
	SearchParamAll,
	PlantUpdate,
	Log,
};
