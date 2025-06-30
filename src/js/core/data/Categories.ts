/**
 * Categories related data
 */

import { Color } from "three";
import { GLOBALS } from "../Globals";
import { getDistanceFromEarthNow, mapOrbitElementsV2, OrbitDataElements, OrbitDataElementsV2, UserFilters } from "../solar/SolarUtils";
import { LoadManager } from "./LoadManager";
import { SolarCategory } from "../solar/SolarSystem";

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

export const CategoryCounters:Record<SolarCategory, number> = {
	"planets-moons": 0,
	'asteroids': 0,
	'comets': 0,
	'centaurs': 0,
	'interstellar-objects': 0,
	'near-earth-objects': 0,
	'trans-neptunian-objects': 0,
	'jupiter-trojans': 0
}

export const CategoryNamesEN:Record<SolarCategory, string> = {
	"planets-moons": "Planets & Dwarf Planets",
	'asteroids': "Asteroids",
	'comets': "Comets",
	'centaurs': "Centaurs",
	'interstellar-objects': "Interstellar Objects",
	'near-earth-objects': "Near Earth Objects",
	'trans-neptunian-objects': "Trans Neptunian Objects",
	'jupiter-trojans': "Jupiter Trojans"
}

export const CategoryNames = {
	en: CategoryNamesEN
}

export function resetSolarCategoryCounters() {
	for(const type in CategoryCounters) {
		if (type === "planets-moons") continue;
		CategoryCounters[type] = 0;
	}
}

export function getCraftCategory(category:SolarCategory) {
	const categories = LoadManager.craftData.categories;
	if(categories === null) return {
		title: 'Category',
		mainColor: "#b1f2ef",
		threeColor: new Color("#b1f2ef"),
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

export interface FilterRange {
	min:number;
	max:number;
}

export type CategoryPropertyRangeMap = Record<SolarCategory|'totals', FilterRange>;

export interface CategoryRangeMap {
	a:CategoryPropertyRangeMap;
	e:CategoryPropertyRangeMap;
	i:CategoryPropertyRangeMap;
}

function getEmptyPropertyRange():CategoryPropertyRangeMap {
	const p = {
		'totals': {
			min: Infinity,
			max: -Infinity
		},
		'planets-moons': {
			min: Infinity,
			max: -Infinity
		},
		'asteroids': {
			min: Infinity,
			max: -Infinity
		},
		'centaurs': {
			min: Infinity,
			max: -Infinity
		},
		'comets': {
			min: Infinity,
			max: -Infinity
		},
		'interstellar-objects': {
			min: Infinity,
			max: -Infinity
		},
		'near-earth-objects': {
			min: Infinity,
			max: -Infinity
		},
		'trans-neptunian-objects': {
			min: Infinity,
			max: -Infinity
		},
		'jupiter-trojans': {
			min: Infinity,
			max: -Infinity
		}
	}

	return p;
}

export const CategoryFilters:CategoryRangeMap = {
	a: getEmptyPropertyRange(),
	e: getEmptyPropertyRange(),
	i: getEmptyPropertyRange()
}

export function calculateDistanceMap() {
	const map = CategoryFilters.a;
	const data = LoadManager.hasuraData.classification_ranges;
	for(const d of data) {
		const type = d.object_type[0];
		const cat = TypeCategoryMap[type];
		const range = d.observed_range_type;
		map[cat][range] = d.observed_value;
	}

	// compute planets
	let min=100000000000000000000000,max=0;
	for(const sel of GLOBALS.viewer.solarElements) {
		if(sel.isPlanet) {
			min = Math.min(min, sel.data.a);
			max = Math.max(min, sel.data.a);
		}
	}

	map['planets-moons'].min = min;
	map['planets-moons'].max = max;

	// compute totals
	min=100000000000000000000000;max=0;
	for(const key in map) {
		if(key === 'totals') continue;
		min = Math.min(min, map[key].min);
		max = Math.max(max, map[key].max);
	}

	map['totals'].min = min;
	map['totals'].max = max;

	// console.log(map);
}

export function calculatePropRange(prop:string) {
	const map = CategoryFilters[prop];
	if(LoadManager.hasuraData.classification_ranges) {
		const data = LoadManager.hasuraData.classification_ranges;
		for(const d of data) {
			if(d.observed_property !== prop) continue;
			const type = d.object_type[0];
			const cat = TypeCategoryMap[type];
			const range = d.observed_range_type;
			map[cat][range] = d.observed_value;
		}
	} else {
		const data = LoadManager.data.sample;

		// Compute Solar Categories first
		for(const d of data) {
			const mel = mapOrbitElementsV2(d);
			const cid = mel.category;
			map[cid].min = Math.min(map[cid].min, mel[prop]);
			map[cid].max = Math.max(map[cid].max, mel[prop]);
		}
	}

	// Compute planets
	const cid = 'planets-moons';
	for(const sel of GLOBALS.viewer.solarElements) {
		if(sel.category === cid) {
			map[cid].min = Math.min(map[cid].min, sel.data[prop]);
			map[cid].max = Math.max(map[cid].max, sel.data[prop]);
		}
	}

	
}

export function updateTotals() {
	computePropertyTotals('a');
	computePropertyTotals('e');
	computePropertyTotals('i');
}

export function computePropertyTotals(prop:string) {
	const map = CategoryFilters[prop];
	map['totals'].min = Infinity;
	map['totals'].max = -Infinity;

	// compute totals
	for(const key in map) {
		if(key === 'totals') continue;
		// console.log(key, CategoryCounters[key]);
		if(CategoryCounters[key] === 0) continue;
		if(!UserFilters.categories[key]) continue;
		// console.log(key, map[key].min, map[key].max);
		map['totals'].min = Math.min(map[key].min, map['totals'].min);
		map['totals'].max = Math.max(map[key].max, map['totals'].max);
	}
}

export const DistanceFromEarth:CategoryPropertyRangeMap = getEmptyPropertyRange();

export function calculateEarthTodayDistanceMap() {
	// planets and moons
	const map = DistanceFromEarth['planets-moons'];
	for(const sel of GLOBALS.viewer.solarElements) {
		if(sel.isPlanet) {
			const d = getDistanceFromEarthNow(sel.data);
			// console.log(d);
			map.min = Math.min(map.min, d);
			map.max = Math.max(map.max, d);
		}
	}

	// console.log(map);
}