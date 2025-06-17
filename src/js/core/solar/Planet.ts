/**
 * Planet.ts
 * Data for the planets in the solar system
 * Note: OrbitElements will be imported
 * from data files or database
 */

import { CameraLock } from "../../gfx/solar/SolarElement";
import { OrbitElements } from "./SolarSystem";

export const PLANET_SCALE = 1000;

export type PlanetId = 'mercury'|'venus'|'earth'|'mars'|'jupiter'|'saturn'|'uranus'|'neptune';

export const PlanetRadiusMap:Record<PlanetId,number> = {
    'mercury': 2440,
    'venus': 6052,
    'earth': 6371,
    'mars': 3390,
    'jupiter': 69911,
    'saturn': 58232,
    'uranus': 25360,
    'neptune': 24620
}

export const PlanetCameraLock:Record<PlanetId,CameraLock> = {
	mercury: {
		min: 5,
		max: 10
	},
	venus: {
		min: 10,
		max: 25
	},
	earth: {
		min: 15,
		max: 25
	},
	mars: {
		min: 8,
		max: 12
	},
	jupiter: {
		min: 140,
		max: 230
	},
	saturn: {
		min: 120,
		max: 300
	},
	uranus: {
		min: 80,
		max: 200
	},
	neptune: {
		min: 60,
		max: 150
	},
}

export type PlanetRotationData = {
    axialTilt:number;
    period:number;
    meridian:number;
}

export const PlanetRotationMap:Record<PlanetId, PlanetRotationData> = {
    mercury: {
        axialTilt: 0.034,
        period: 58.6462,
        meridian: 329.5988
    },
    venus: {
        axialTilt: 177.36,
        period: 243.018,
        meridian: 160.20
    },
    earth: {
        axialTilt: 23.4392811,
        period: 0.99722222,
        meridian: 0
    },
    mars: {
        axialTilt: 25.19,
        period: 1.02595676,
        meridian: 176.049863
    },
    jupiter: {
        axialTilt: 3.13,
        period: 0.41354,
        meridian: 284.95
    },
    saturn: {
        axialTilt: 26.73,
        period: 0.44401,
        meridian: 38.90
    },
    uranus: {
        axialTilt: 97.77,
        period: 0.71833,
        meridian: 203.81
    },
    neptune: {
        axialTilt: 28.32,
        period: 0.66526,
        meridian: 249.978
    }
}

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
