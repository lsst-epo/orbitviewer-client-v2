import { Timer } from "@fils/ani";
import { Size } from "@fils/gfx";
import { isMobile } from "@fils/utils";
import { SolarClock } from "./solar/SolarClock";
import { Fog, Object3D, Scene, WebGLRenderer } from "three";
import { EarthClouds } from "../gfx/planets/EarthClouds";
import { Sun } from "../gfx/solar/Sun";
import { FAR, NEAR, OrbitViewer } from "../gfx/OrbitViewer";
import { Nomad } from "@fils/nomad";
import TimeMachine from "../layers/TimeMachine";
import MapControls from "../layers/MapControls";
import { Loader } from "../layers/Loader";
import ToggleGroup from "../components/ToggleGroup";
import Navigation from "../layers/Navigation";
import { DefaultPage } from "../pages/DefaultPage";

/**
 * DEV_MODE is injected by esbuild
 */
//@ts-ignore
export const IS_DEV_MODE = DEV_MODE;
// export const TARGET = TARGET_MODE;

// export const HASURA_URL = `https://hasura-e3g4rcii3q-uc.a.run.app/api/rest`;
export const HASURA_URL = `https://hasura-688095955960.us-central1.run.app/api/rest`;
export const HASURA_GRAPHQL = `https://hasura-688095955960.us-central1.run.app/v1/graphql`;


export const PATHS = {
	uploads: '/uploads',
	assets: '/assets',
};

export const CONTROLS = {
	min: 5,
	max: 60000,
	orbit: null
}

export const CLOCK_SETTINGS = {
	speed: 0,
  maxSpeed: 1000,
	playing: true,
	lastElapsedTime: 0,
	backwards: false,
}

export const GPU_SIM_SIZES = {
	low: {
		width: 128,
		height: 128
	},
	medium: {
		width: 256,
		height: 256
	},
	high: {
		width: 512,
		height: 512
	},
	ultra: {
		width: 1024,
		height: 512
	},
	ultra2: {
		width: 1024,
		height: 1024
	}
}

export function getParticleCount(s:Size) {
	return s.width * s.height;
}

export const VISUAL_SETTINGS = {
	current: 'low',//isMobile() ? 'low' : 'high',
	low: getParticleCount(GPU_SIM_SIZES.low),
	medium: getParticleCount(GPU_SIM_SIZES.medium),
	high: getParticleCount(GPU_SIM_SIZES.high),
	ultra: getParticleCount(GPU_SIM_SIZES.ultra),
	ultra2: getParticleCount(GPU_SIM_SIZES.ultra2),
	// ultra3: getParticleCount(GPU_SIM_SIZES.ultra3)
}

export interface Globals {
	clock:Timer;
	solarClock:SolarClock;
	clouds:EarthClouds;
	sun:Sun;
	fog:Fog;
	viewer:OrbitViewer;
	nomad:Nomad;
	lang:string;
	timeCtrls:TimeMachine;
	mapCtrls:MapControls;
	objectToggle:ToggleGroup;
	firstPage:boolean;
	loader:Loader;
	getViewport:Function;
	isMobile:Function;
	toggleFullscreen: Function;
	navigation:Navigation;
	urlParams:Function;
	currentPage: DefaultPage;
}

export const GLOBALS:Globals = {
	clock: null,
	solarClock: null,
	clouds: null,
	sun: null,
	fog: new Fog(0x000000, NEAR, NEAR),
	viewer: null,
	nomad: null,
	lang: null,
	timeCtrls: null,
	mapCtrls: null,
	objectToggle: null,
	firstPage: true,
	loader: null,
	navigation: null,
	currentPage: null,
	getViewport: () => {
		return getComputedStyle(document.documentElement).getPropertyValue('--viewport');
	},
	isMobile: () => {
		return GLOBALS.getViewport().includes('small');
	},
	toggleFullscreen() {
		const buttons = document.querySelectorAll('.button-fullscreen');
		const buttonLabels = document.querySelectorAll('.button-fullscreen .label');
		const offIcons = document.querySelectorAll('.fullscreen-off');
		const onIcons = document.querySelectorAll('.fullscreen-on');
		buttons.forEach(button => (button as HTMLButtonElement).blur())
		if (!document.fullscreenElement) {
			buttonLabels.forEach(label => label.textContent = 'Exit Fullscreen');
			offIcons.forEach(icon => icon.removeAttribute('aria-hidden'));
			onIcons.forEach(icon => icon.setAttribute('aria-hidden', 'true'));
			document.documentElement.requestFullscreen().catch(err => {
				console.error(`Error al entrar en fullscreen: ${err.message}`);
			});
		} else {
			buttonLabels.forEach(label => label.textContent = 'Fullscreen');
			offIcons.forEach(icon => icon.setAttribute('aria-hidden', 'true'));
			onIcons.forEach(icon => icon.removeAttribute('aria-hidden'));
			document.exitFullscreen();
		}
	},
	urlParams: ():{key:string, value:string}[] => {
		const parts = location.search.replace('?', '').split("&");
		const map = [];

		for(const p of parts) {
			const p2 = p.split('=');
			if(p.length < 2) continue;
			map.push({
				key: p2[0],
				value: p2[1]
			})
		}

		return map;
	}
}
