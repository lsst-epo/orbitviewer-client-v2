import { HASURA_GRAPHQL, HASURA_URL, VISUAL_SETTINGS } from "../Globals";
import { UserFilters } from "../solar/SolarUtils";
import { CategoryTypeMap } from "./Categories";

//@ts-ignore
const SECRET_KEY = HASURA_SECRET_KEY;
// console.log(SECRET_KEY);

// Filters fetch
export async function getSolarSystemElements() {
	const url = `${HASURA_URL}/orbit-elements/${VISUAL_SETTINGS[VISUAL_SETTINGS.current]}`;	

	const response = await fetch(url, {
		headers: {
			'X-Hasura-Admin-Secret': SECRET_KEY
		}
	})
	return await response.json();
}

export async function searchCloud(q:string) {
	// https://hasura-688095955960.us-central1.run.app/api/rest/mpc_orbits?limit=1&a_min=0&a_max=200&rubin_discovery=true
	// const url = `${HASURA_URL}/mpc_orbits?limit=10`
	const url = `${HASURA_GRAPHQL}`
	// console.log(url);

	const types = [0];
	for(const cat in UserFilters.categories) {
		if(UserFilters.categories[cat]) types.push(CategoryTypeMap[cat]);
	}

	// console.log(types);
	let rubin = '';
	if(UserFilters.discoveredBy > 0) {
		rubin = `rubin_discovery: ${UserFilters.discoveredBy === 1}`
	}

	const query = `query {
  mpc_orbits(
    where: {packed_primary_provisional_designation: {_ilike: "%${q}%"}}
    limit: 100
		object_types: ${JSON.stringify(types)}
		${rubin}
		a_min: ${Math.max(0, UserFilters.distanceRange.min)}
		a_max: ${UserFilters.distanceRange.max}
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

console.log(query);

/*
arc_length_sel
arc_length_total
argperi
argperi_unc
created_at
dt
dt_unc
e
e_unc
earth_moid
epoch_mjd
fitting_datetime
g
h
i
i_unc
id
mean_anomaly
mean_anomaly_rubin
mean_anomaly_unc
mean_motion
mean_motion_rubin
mean_motion_unc
mpc_orb_jsonb
nobs_total
nobs_total_sel
node
node_unc
nopp
normalized_rms
not_normalized_rms
object_type
object_type_int
orbit_type_int
packed_primary_provisional_designation
peri_time
peri_time_unc
period
period_unc
q
q_unc
rubin_discovery
srp
srp_unc
u_param
unpacked_primary_provisional_designation
updated_at
viz_priority
yarkovsky
yarkovsky_unc
*/

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
// console.log(res);

return res;

}

/* export async function getSolarSystemElementsByFilter() {
	const url = `${HASURA_URL}/orbit-elements-by-filter/${VISUAL_SETTINGS[VISUAL_SETTINGS.current]}/${distance.search.min}/${distance.search.max}/${discover.search.min}/${discover.search.max}/${filters.asteroids}/${filters.centaurs}/${filters.comets}/${filters.interestellarObjects}/${filters.nearEarthObjects}/${filters.transNeptunianObjects}`;	

	const response = await fetch(url, {
		headers: {
			'X-Hasura-Admin-Secret': SECRET_KEY
		}
	});
	
	return await response.json();
} */

async function fetchSolarElement (id: string ) {
	// console.log('Fetch Solar Element', id);

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