/**
 * Solar Utils
 */

import { Vector3 } from "three";
import { getCategory } from "../data/Categories";
import { PLANET_SCALE, PlanetId } from "./Planet";
import { calculateOrbit, EPOCH, getMeanAnomaly, OrbitElements, OrbitType, SolarCategory } from "./SolarSystem";
import { MJD2JD, SolarTimeManager } from "./SolarTime";
import { Random } from "@fils/math";

const tmp1 = new Vector3();
const tmp2 = new Vector3();

export const PlanetDataMap:Record<PlanetId,OrbitElements> = {
    earth: null,
    mercury: null,
    venus: null,
    mars: null,
    jupiter: null,
    saturn: null,
    uranus: null,
    neptune: null
}

export type OrbitDataElements = {
    id?:string;
    fulldesignation:string;
    node:number;
    a:number;
    e:number;
    // Name?:string;
    // G?:number;
    incl:number;
    // H?:number;
    q:number;
    M:number;
    // mpch:number;
    epoch:number;
    n:number;
    tperi?:number;
    peri:number;
	object_type: number[];
}

export type OrbitDataElementsV2 = {
    id?:string;
    fulldesignation:string;
    mpcdesignation?:string;
    node:number;
    a:number;
    e:number;
    // Name?:string;
    // G?:number;
    i:number;
    // H?:number;
    q:number;
    mean_anomaly:number;
    // mpch:number;
    epoch_mjd:number;
    mean_motion:number;
    peri_time?:number;
    argperi:number;
	object_type: number[];
    rubin_discovery:boolean;
}

export function getRandomElementsArray(len:number):OrbitDataElements[] {
    const arr = [];

    for(let i=0; i<len; i++) {
        const type = Random.randi(0, 6);
        const el:OrbitDataElements = {
            // id: `rnd${i}`,
            fulldesignation: `rnd${i}`,
            node: Random.randf(0, 360),
            a: Random.randf(1, 10),
            e: Random.randf(0, 1),
            epoch: 54800,
            incl: Random.randf(0, 180),
            object_type: [type],
            // mpch: null,
            peri: Random.randf(0, 360),
            q: Random.randf(1.5, 2.5),
            tperi: Random.randf(51000, 52000),
            n: Random.randf(0.2, 0.3),
            M: Random.randf(0, 360)
        }

        arr.push(el);
    }

    return arr;
}

export function getOrbitType(el:OrbitDataElements|OrbitDataElementsV2): OrbitType {
    if(el.e < 0.98) {
        return OrbitType.Elliptical;
    } else if(el.e < 1.2) {
        if(el.e === 1) {
            return OrbitType.Parabolic;
        } else {
            return OrbitType.NearParabolic;
        }
    } else return OrbitType.Hyperbolic;
}

export function mapOrbitElements(dEl:OrbitDataElements):OrbitElements {
    const el = {
        id: dEl.fulldesignation,
        fulldesignation: dEl.fulldesignation,
        N: dEl.node,
        a: dEl.a,
        e: dEl.e,
        // name: dEl.Name,
        // G: dEl.G,
        i: dEl.incl,
        // H: dEl.H,
        w: dEl.peri,
        M: dEl.M,
        n: dEl.n,
        q: dEl.q,
        Tp: dEl.tperi,
        epoch: dEl.epoch != undefined ? dEl.epoch : EPOCH,
        type: getOrbitType(dEl),
        category: getCategory(dEl) as SolarCategory,
        rubin_discovery: false
    }
    return el;
}


export function mapOrbitElementsV2(dEl:OrbitDataElementsV2):OrbitElements {
    /* if(dEl.rubin_discovery) {
        console.log(dEl);
    } */
    const el = {
        id: dEl.fulldesignation,
        fulldesignation: dEl.fulldesignation,
        N: dEl.node,
        a: dEl.a,
        e: dEl.e,
        // name: dEl.Name,
        // G: dEl.G,
        i: dEl.i,
        // H: dEl.H,
        w: dEl.argperi,
        M: dEl.mean_anomaly < 0 ? dEl.mean_anomaly + 360 : dEl.mean_anomaly,
        n: dEl.mean_motion,
        q: dEl.q,
        Tp: dEl.peri_time,
        epoch: dEl.epoch_mjd != undefined ? dEl.epoch_mjd : EPOCH,
        type: getOrbitType(dEl),
        category: getCategory(dEl) as SolarCategory,
        rubin_discovery: dEl.rubin_discovery
    }
    return el;
}

export function getTypeStr(type:OrbitType): string {
    if(type === OrbitType.Elliptical) return 'Elliptical';
    if(type === OrbitType.Parabolic) return 'Parabolic';
    if(type === OrbitType.NearParabolic) return 'NearParabolic';
    return 'Hyperbolic';
}

export const openFileDialog = (accept, callback) => {
	// Create an input element
	var inputElement = document.createElement('input');

	// Set its type to file
	inputElement.type = 'file';

	// Set accept to the file types you want the user to select.
	// Include both the file extension and the mime type
	inputElement.accept = accept;

	// set onchange event to call callback when user has selected file
	inputElement.addEventListener('change', callback);

	// dispatch a click event to open the file dialog
	inputElement.dispatchEvent(new MouseEvent('click'));
};

export function getClosestDateToSun(data:OrbitElements):Date {

    const d = SolarTimeManager.getMJDonDate(new Date());
    // const mel = mapOrbitElementsV2(data);
    const M = getMeanAnomaly(data, d) % 360;
    const tperi = MJD2JD(d + (360-M) / data.n);

    return SolarTimeManager.JD2Date(tperi);
}

export function getDistanceFromSunNow(data:OrbitElements): number {

    const date = new Date();
    const mjd = SolarTimeManager.getMJDonDate(date);

    // const mel = mapOrbitElements(data);

    calculateOrbit(data, mjd, tmp1);

    return tmp1.length() / PLANET_SCALE;
}

export function getDistanceFromEarthNow(data:OrbitElements): number {

    const date = new Date();
    const mjd = SolarTimeManager.getMJDonDate(date);

    // const mel = mapOrbitElements(data);

    calculateOrbit(data, mjd, tmp1);

    const earthData = PlanetDataMap.earth;

    if(!earthData) return 0;

    calculateOrbit(earthData, mjd, tmp2);

    return tmp2.distanceTo(tmp1) / PLANET_SCALE;
}

type Range = {min:number, max:number};

export interface ObjectFilters {
    categories:Record<SolarCategory, boolean>;
    distanceRange:Range,
    dateRange:Range,
    discoveredBy:0|1|2 // all, rubin, other
}

export const UserFilters:ObjectFilters = {
    categories: {
        "planets-moons": true,
        'asteroids': true,
        'comets': true,
        'centaurs': true,
        'interstellar-objects': true,
        'near-earth-objects': true,
        'trans-neptunian-objects': true,
        'jupiter-trojans': true
    },
    distanceRange: {
        min: -Infinity,
        max: Infinity
    },
    dateRange: {
        min: 1900,
        max: 2100
    },
    discoveredBy: 0
}