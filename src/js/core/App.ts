import { Timer } from "@fils/ani";
import { ThreeDOMLayer } from "@fils/gl-dom";
import { UI } from "@fils/ui";
import { Clock } from "three";
import { Terminal } from "../debug/Terminal";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { initShaders } from "../gfx/Shaders";
import { fetchSolarElements, getSolarSystemElements } from "./data/QueryManager";
import { CLOCK_SETTINGS, GLOBALS, GPU_SIM_SIZES, VISUAL_SETTINGS } from "./Globals";
import { SolarClock } from "./solar/SolarClock";
import { getSimData, getSimDataV2 } from "./solar/SolarData";
import { getSolarStaticData, SolarItems } from "./Utils";

import Stats from "three/examples/jsm/libs/stats.module.js";
import { getRandomElementsArray } from "./solar/SolarUtils";
import { LoadManager } from "./data/LoadManager";
import { SearchEngine } from "./data/SearchEngine";
import { PlanetId } from "../gfx/solar/Planet";
import { getAbout, getCategories, getCustomizedOrbits, getGlobals, getGuidedExperiences, getGuidedExperiencesTours, getLanding, getOrbitViewer, getSolarItemsInfo } from "./data/CraftManager";
import { EarthClouds } from "../gfx/planets/EarthClouds";

export const solarClock = new SolarClock(new Clock());

export class App {
	gl:ThreeDOMLayer;
	viewer:OrbitViewer;
	clock:Timer;

	protected testRunning:boolean = false;
	protected deltas:number[] = [];
	protected testStarted:number = 0;

	constructor() {
		initShaders();

		this.gl = new ThreeDOMLayer(document.querySelector('.view'), {
			antialias: true,
			alpha: false
		});
		this.gl.renderer.setClearColor(0x000000, 1);
		this.gl.renderer.setPixelRatio(devicePixelRatio || 1);
		// this.gl.renderer.outputColorSpace = 'srgb-linear';
		this.viewer = new OrbitViewer(this.gl);
		
		GLOBALS.clouds = new EarthClouds();

		// this.profiler = new PerformanceProfiler(this.viewer);
		this.start();

		console.log('%cSite by Fil Studio', "color:white;font-family:system-ui;font-size:1rem;font-weight:bold");
	}

	start() {
		const stats = new Stats();
		document.body.appendChild(stats.dom);
		stats.dom.style.top = 'unset';
		stats.dom.style.bottom = '0';

		const animate = () => {
			requestAnimationFrame(animate);
			stats.begin();
			this.update();
			stats.end();
		}

		requestAnimationFrame(animate);

		this.clock = new Timer(true);
		solarClock.start();

		GLOBALS.clock = this.clock;
		GLOBALS.solarClock = solarClock;

		// this.addGUI();
    const t = Date.now();
    LoadManager.loadCore(() => {
    	this.launch();
    })
	}
	
	launch() {
		const data = getSimData(LoadManager.data.sample);
		this.viewer.setData(data);
		this.viewer.createPlanets(LoadManager.data.planets);
		// this.viewer.hidePaths();
		// this.addGUI();
		console.log(LoadManager.data);
		console.log(LoadManager.craftData);

		this.viewer.goToLandingMode();
	}

	/* logItems (nItems:number, time:number) {
		const clss = time < 5 ? 'green' : 'red';
		this.terminal.log(`Fectched ${nItems} items. Elapsed time: <span class="${clss}">${time} seconds</span>.`);
	} */

	clockChanged():boolean {
    return (CLOCK_SETTINGS.speed !== solarClock.hoursPerSec);
  }

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;

		if(this.clockChanged()) solarClock.hoursPerSec = CLOCK_SETTINGS.speed;
		const d = solarClock.update();

		GLOBALS.clouds.render(this.gl.renderer);

		this.viewer.update(t, d);
		this.viewer.render();

		if(this.testRunning) {
			this.deltas.push(this.clock.currentDelta);
			if(performance.now() - this.testStarted >= 5000) {
				let dt = 0;
				// console.log(this.deltas);
				for(const d of this.deltas) {
					dt += d / this.deltas.length;
				}
				// dt *= 1000;
				// this.terminal.log(`Ended test with an average <span class="blue">${dt*1000}ms</span> & <span class="blue">${1/dt}fps</span>.`);
				// this.terminal.log(`<span class="green">Done!</span> ✨`);
				this.testRunning = false;
				this.viewer.controls.enableInteraction = true;
			}
		}
	}
}
