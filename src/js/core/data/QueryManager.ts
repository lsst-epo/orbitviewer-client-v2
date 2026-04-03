import { HASURA_GRAPHQL, HASURA_URL, SECRET_KEY } from "../Globals";
import { UserFilters } from "../solar/SolarUtils";
import { CategoryTypeMap } from "./Categories";

export async function searchCloud(q:string) {
	const url = `${HASURA_GRAPHQL}`

	const types = [0];
	for(const cat in UserFilters.categories) {
		if(UserFilters.categories[cat]) types.push(CategoryTypeMap[cat]);
	}

	let rubin = '';
	if(UserFilters.discoveredBy > 0) {
		rubin = `rubin_discovery: {_eq: ${UserFilters.discoveredBy === 1}}`
	}

	const query = `query {
  mpc_orbits(
    where: {packed_primary_provisional_designation: {_ilike: "%${q}%"},
		object_type_int: {_in: ${JSON.stringify(types)}},
		a_rubin: {_gt: ${Math.max(0, UserFilters.distanceRange.min)}, _lt: ${UserFilters.distanceRange.max}}
		${rubin}}
		limit: 100
  ) {
    a: a_rubin
		mean_anomaly: mean_anomaly_rubin
		mean_motion: mean_anomaly_rubin
		node
		i
		e
		q
		rubin_discovery
		object_type
		epoch_mjd
		peri_time
		argperi
		mpcdesignation: packed_primary_provisional_designation
		fulldesignation: unpacked_primary_provisional_designation
  }
}`;

const response = await fetch(url, {
	headers: {
		'X-Hasura-Admin-Secret': SECRET_KEY,
		"Content-Type": "application/json",
    Accept: "application/json"
	},
	method: 'POST',
	body: JSON.stringify({
			query,
	}),
})

let res = await response.json();

return res;

}

async function fetchSolarElement (id: string ) {
	const url = `${HASURA_URL}/orbit-viewer/fetch/${id}`;		

	const response = await fetch(url, {
		headers: {
			'X-Hasura-Admin-Secret': SECRET_KEY
		}
	})

	let res = await response.json();
	// console.log(res);
	res = res.mpcorb.length ? res.mpcorb[0] : {};
	res.id = id;

	return res;
}

export async function fetchSolarElements(elements:Array<any>){

	let ids = [];
	for(const el of elements){
		const id = el.elementID;
		ids.push(id);
	}	


	const promises = [];
	for(const id of ids){
		promises.push(fetchSolarElement(id))
	}
	
	const items = await Promise.all(promises);

	if(!items) return [];

	return items;
}

// Filters fetch
export async function getA() {

	const url = `${HASURA_URL}/a-v2`;	

	console.log('Loading A...');

	const response = await fetch(url, {
		headers: {
			'X-Hasura-Admin-Secret': SECRET_KEY
		}
	})
	return await response.json();
}

export async function getClassificationRanges() {

	const url = `${HASURA_URL}/classification_ranges`;	

	// console.log('Loading Classification Ranges...');

	const response = await fetch(url, {
		headers: {
			'X-Hasura-Admin-Secret': SECRET_KEY
		}
	})
	return await response.json();
}