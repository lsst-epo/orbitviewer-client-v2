/**
 * Categories related data
 */

import { OrbitDataElements } from "../solar/SolarUtils";

export type SolarCategory = 'trans-neptunian-objects'|'near-earth-objects'|'interstellar-objects'|'comets'|'centaurs'|'asteroids'|'planets-moons';

/**
 * Sorted by priority (lowest index in the array holds higher priority)
 */
export const categoriesSort:Array<SolarCategory> = [
	'asteroids',
	'comets',
	'centaurs',
	'interstellar-objects',
	'near-earth-objects',
	'trans-neptunian-objects'
]

export const getCategory = (item: OrbitDataElements):SolarCategory => {
	const avail_categories:Array<SolarCategory> = [];
	const type = item.object_type;

	if (!type) return;

	if(type.indexOf(3) > -1) avail_categories.push('trans-neptunian-objects');
	if(type.indexOf(2) > -1) avail_categories.push('near-earth-objects');
	if(type.indexOf(6) > -1) avail_categories.push('interstellar-objects');
	if(type.indexOf(5) > -1) avail_categories.push('comets');
	if(type.indexOf(4) > -1) avail_categories.push('centaurs');
	if(type.indexOf(1) > -1) avail_categories.push('asteroids');

	let k = 100;
	for (const id of avail_categories) {
		const p = categoriesSort.indexOf(id);
		if(p < k) k = p;
	}

	if(!avail_categories.length) return categoriesSort[0];

	return categoriesSort[k];
}

/* const getCategoryColor = (slug:string) : Color => {
	const category = categories.find(x => x.slug === slug);
	return new Color(category.mainColor);
}

export const CategoryColorMap:Record<SolarCategory,Color> = {
	'asteroids': getCategoryColor('asteroids'),
	'centaurs': getCategoryColor('centaurs'),
	'comets':  getCategoryColor('comets'),
	'interstellar-objects': getCategoryColor('interstellar-objects'),
	'near-earth-objects':  getCategoryColor('near-earth-objects'),
	'planets-moons':  getCategoryColor('planets-moons'),
	'trans-neptunian-objects':  getCategoryColor('trans-neptunian-objects')
} */

/* export const CategoriesMinMaxA = {
	'total': {
		min: 0,
		max: 0
	},
	'planets-moons': {
		min: 0,
		max: 0
	},
	'asteroids': {
		min: 0,
		max: 0
	},
	'centaurs': {
		min: 0,
		max: 0
	},
	'comets': {
		min: 0,
		max: 0
	},
	'interstellar-objects': {
		min: 0,
		max: 0
	},
	'near-earth-objects': {
		min: 0,
		max: 0
	},
	'trans-neptunian-objects': {
		min: 0,
		max: 0
	}
} */

// Filters fetch
/* export async function getA() {

	const url = `${HASURA_URL}/a`;

	const response = await fetch(url, {
		headers: {
			'X-Hasura-Admin-Secret': '_qfq_tMbyR4brJ@KHCzuJRU7'
		}
	})
	return await response.json();
}

export async function getMinMaxAByCategory () {

	console.log('Loading "A"...');

	const data = await getA();

	const find = (type, range) => {
		const d = data.classification_ranges.find(x => {
			if(x.observed_object_type === type && x.observed_range_type === range) return x;
		})
		return d.observed_value;
	}

	CategoriesMinMaxA['asteroids'].min = find('asteroid', 'min');
	CategoriesMinMaxA['asteroids'].max = find('asteroid', 'max');

	CategoriesMinMaxA['centaurs'].min = find('centaur', 'min');
	CategoriesMinMaxA['centaurs'].max = find('centaur', 'max');

	CategoriesMinMaxA['comets'].min = find('comet', 'min');
	CategoriesMinMaxA['comets'].max = find('comet', 'max');

	CategoriesMinMaxA['near-earth-objects'].min = find('neo', 'min');
	CategoriesMinMaxA['near-earth-objects'].max = find('neo', 'max');

	CategoriesMinMaxA['trans-neptunian-objects'].min = find('tno', 'min');
	CategoriesMinMaxA['trans-neptunian-objects'].max = find('tno', 'max');

	let min = 10000;
	let max = 0;
	for(const key in CategoriesMinMaxA){
		const item = CategoriesMinMaxA[key];
		min = min < item.min ? min : item.min;
		max = max > item.max ? max : item.max;
	}

	CategoriesMinMaxA['total'].min = min;
	CategoriesMinMaxA['total'].max = max;

	distance.min = min;
	distance.max = max;

	distance.search.min = min;
	distance.search.max = max;

}

export const getMinMaxPlanetsA = (d:Array<OrbitDataElements>) => {

	let min = 10000;
	let max = 0;
	for(const el of d){
		min = el.a < min ? el.a : min;
		max = el.a > max ? el.a : max;
	}

	CategoriesMinMaxA['planets-moons'].min = min;
	CategoriesMinMaxA['planets-moons'].max = max;

} */
