/**
 * Categories related data
 */

import { Color } from "three";
import { GLOBALS } from "../Globals";
import { OrbitDataElements, OrbitDataElementsV2 } from "../solar/SolarUtils";
import { LoadManager } from "./LoadManager";

export type SolarCategory = 'trans-neptunian-objects'|'near-earth-objects'|'interstellar-objects'|'comets'|'centaurs'|'asteroids'|'planets-moons'|'jupiter-trojans';

/**
 * Sorted by priority (lowest index in the array holds higher priority)
 */
export const categoriesSort:Array<SolarCategory> = [
	'asteroids',
	'comets',
	'centaurs',
	'interstellar-objects',
	'near-earth-objects',
	'trans-neptunian-objects',
	'jupiter-trojans'
]

export const CategoryTypeMap:Record<SolarCategory, number> = {
	asteroids: 1,
	"near-earth-objects": 2,
	"trans-neptunian-objects": 3,
	centaurs: 4,
	comets: 5,
	"interstellar-objects": 6,
	"planets-moons": 7,
	"jupiter-trojans": 8
}

export const TypeCategoryMap:Record<number,SolarCategory> = {
	1: "asteroids",
	2: "near-earth-objects",
	3: "trans-neptunian-objects",
	4: "centaurs",
	5: "comets",
	6: "interstellar-objects",
	7: "planets-moons",
	8: "jupiter-trojans"
}

export const CSSCategoryMap:Record<number, string> = {
	1: "asteroids",
	2: "near_earth",
	3: "trans_neptunian",
	4: "centaurs",
	5: "comets",
	6: "interstellar",
	7: "planets",
	8: "trojans"
}

export function getCraftCategory(category:SolarCategory) {
	const categories = LoadManager.craftData.categories;
	if(categories === null) return {
		title: 'Category',
		mainColor: "#fff",
		threeColor: new Color("#fff"),
		objectTypeCode: `${CategoryTypeMap[category]}`
	};
	for(const cat of categories) {
		const type = parseInt(cat.objectTypeCode);
		if(type === CategoryTypeMap[category]) return cat;
	}

	return null;
}

export const getCategory = (item: OrbitDataElements|OrbitDataElementsV2):SolarCategory => {
	const avail_categories:Array<SolarCategory> = [];
	const type = item.object_type;

	if (!type) return;

	if(type.indexOf(3) > -1) avail_categories.push('trans-neptunian-objects');
	if(type.indexOf(2) > -1) avail_categories.push('near-earth-objects');
	if(type.indexOf(6) > -1) avail_categories.push('interstellar-objects');
	if(type.indexOf(5) > -1) avail_categories.push('comets');
	if(type.indexOf(4) > -1) avail_categories.push('centaurs');
	if(type.indexOf(1) > -1) avail_categories.push('asteroids');
	if(type.indexOf(8) > -1) avail_categories.push('jupiter-trojans');

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

export const CategoriesMinMaxA = {
	'totals': {
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
	},
	'jupiter-trojans': {
		min: 0,
		max: 0
	}
}

export function calculateDistanceMap() {
	const data = LoadManager.hasuraData.classification_ranges;
	for(const d of data) {
		const type = d.object_type[0];
		const cat = TypeCategoryMap[type];
		const range = d.observed_range_type;
		CategoriesMinMaxA[cat][range] = d.observed_value;
	}

	// compute planets
	let min=100000000000000000000000,max=0;
	for(const sel of GLOBALS.viewer.solarElements) {
		if(sel.isPlanet) {
			min = Math.min(min, sel.data.a);
			max = Math.max(min, sel.data.a);
		}
	}

	CategoriesMinMaxA['planets-moons'].min = min;
	CategoriesMinMaxA['planets-moons'].max = max;

	// compute totals
	min=100000000000000000000000;max=0;
	for(const key in CategoriesMinMaxA) {
		if(key === 'totals') continue;
		min = Math.min(min, CategoriesMinMaxA[key].min);
		max = Math.max(max, CategoriesMinMaxA[key].max);
	}

	CategoriesMinMaxA['totals'].min = min;
	CategoriesMinMaxA['totals'].max = max;

	console.log(CategoriesMinMaxA);
}