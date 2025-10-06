import { HASURA_URL, VISUAL_SETTINGS } from "../Globals";

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

export async function searchCloud(query:string) {
	// https://hasura-688095955960.us-central1.run.app/api/rest/mpc_orbits?limit=1&a_min=0&a_max=200&rubin_discovery=true
	const url = `${HASURA_URL}/mpc_orbits?limit=1&a_min=0&a_max=200&rubin_discovery=true`

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