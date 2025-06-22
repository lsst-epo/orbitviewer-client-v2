import { Timer } from "@fils/ani";
import { CanvasDOMLayer, ThreeDOMLayer } from "@fils/gl-dom";
import { Clock } from "three";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { initShaders } from "../gfx/Shaders";
import { CLOCK_SETTINGS, GLOBALS, IS_DEV_MODE } from "./Globals";
import { SolarClock } from "./solar/SolarClock";
import { getSimData, getSimDataV2 } from "./solar/SolarData";

import { Nomad, NomadRoute, NomadRouteListener } from "@fils/nomad";
import Stats from "three/examples/jsm/libs/stats.module.js";
import ToggleGroup from "../components/ToggleGroup";
import { Debug2DCanvas } from "../gfx/Debug2DCanvas";
import { EarthClouds } from "../gfx/planets/EarthClouds";
import { Loader } from "../layers/Loader";
import MapControls from "../layers/MapControls";
import Navigation from "../layers/Navigation";
import Share from "../layers/Share";
import TimeMachine from "../layers/TimeMachine";
import { DefaultPage } from "../pages/DefaultPage";
import { ObjectPage } from "../pages/ObjectPage";
import { ObjectsFiltersPage } from "../pages/ObjectsFiltersPage";
import OrbitViewerPage from "../pages/OrbitViewerPage";
import { ScrollingPage } from "../pages/ScrollingPage";
import { calculateEarthTodayDistanceMap, calculatePropRange, CategoryCounters, CategoryFilters, updateTotals } from "./data/Categories";
import { LoadManager } from "./data/LoadManager";
import { UserFilters } from "./solar/SolarUtils";
import { isMobile } from "@fils/utils";

export const solarClock = new SolarClock(new Clock());

export const USE_V2 = true;
export const SHOW_DEBUG = false;

export let debugCan:Debug2DCanvas = null;

export const performanceTest = {
	finished: false,
	averageDT: 0
}

export class App implements NomadRouteListener {
	gl:ThreeDOMLayer;
	viewer:OrbitViewer;
	clock:Timer;

	gl2:CanvasDOMLayer;

	protected testRunning:boolean = false;
	protected deltas:number[] = [];
	protected testStarted:number = 0;

	currentPage: DefaultPage;
	navigation: Navigation;
	share: Share;
	// orbitViewerPage: OrbitViewerPage;

	constructor() {
		GLOBALS.lang = document.documentElement.getAttribute('lang');

		console.log(document.querySelectorAll('.loader'))

		GLOBALS.loader = new Loader(document.querySelector('.loader'));
		// GLOBALS.loader.show();

		initShaders();

		if(SHOW_DEBUG && IS_DEV_MODE) {
			this.gl2 = new CanvasDOMLayer(document.querySelector('.view'), devicePixelRatio);
			this.gl2.canvas.classList.add('debug');
			console.log(this.gl2.canvas);
			debugCan = new Debug2DCanvas(this.gl2);
		}

		this.gl = new ThreeDOMLayer(document.querySelector('.view'), {
			antialias: true,
			alpha: false
		});
		this.gl.renderer.setClearColor(0x000000, 1);
		this.gl.renderer.setPixelRatio(devicePixelRatio || 1);
		// this.gl.renderer.outputColorSpace = 'srgb-linear';
		this.viewer = new OrbitViewer(this.gl);
		
		GLOBALS.clouds = new EarthClouds();

		GLOBALS.timeCtrls = new TimeMachine(document.querySelector('.timemachine'));
		GLOBALS.mapCtrls = new MapControls(document.querySelector('.map_controls'));
		GLOBALS.objectToggle = new ToggleGroup(document.querySelector('#toggle-view'));

		// console.log(document.querySelectorAll('#toggle-view'))

		const navigationDom = document.querySelector('.nav_dropdown');
		this.navigation = navigationDom ? new Navigation(navigationDom) : null;
		GLOBALS.navigation = this.navigation;

		const shareDom = document.querySelector('.share');
		this.share = shareDom ? new Share(shareDom) : null;

		// this.profiler = new PerformanceProfiler(this.viewer);
		this.start();

		console.log('%cSite by Fil Studio', "color:white;font-family:system-ui;font-size:1rem;font-weight:bold");
	}
	
	initNomad() {
		const nomad = new Nomad({
			replace: false,
		}, (id, template, dom) => {
			if (template === 'orbitviewerpage') return new OrbitViewerPage(id, template, dom)
			if (template === 'objects') return new ObjectsFiltersPage(id, template, dom)
			else if ((template === 'object') || (template === 'featured-object')) return new ObjectPage(id, template, dom)
			else if (template === 'about') return new ScrollingPage(id, template, dom)
			else if (template === 'how_to_use') return new ScrollingPage(id, template, dom)
			return new DefaultPage(id, template, dom)
		})

		nomad.addRouteListener(this);
		GLOBALS.nomad = nomad;

		this.currentPage = nomad.route.page as DefaultPage;
		if(this.currentPage.template !== "orbitviewerpage") {
			this.viewer.adjustQualitySettings(isMobile() ? 'low' : 'medium');
		}
	}

	onRouteChangeStart(href: string): void {

	}

	onRouteChanged(route: NomadRoute): void {
		this.currentPage = route.page as DefaultPage;
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
		const data = USE_V2 ? getSimDataV2(LoadManager.data.sample) : getSimData(LoadManager.data.sample);;
		this.viewer.setData(data);
		this.viewer.createPlanets(LoadManager.data.planets);
		this.viewer.createDwarfPlanets(LoadManager.data.dwarf_planets);

		CategoryCounters['planets-moons'] = LoadManager.data.planets.length + LoadManager.data.dwarf_planets.length;

		this.viewer.createSolarItems();
		
		calculatePropRange('a');
		calculatePropRange('e');
		calculatePropRange('i');
		calculateEarthTodayDistanceMap();
		updateTotals();
		// this.viewer.hidePaths();
		// this.addGUI();
		console.log(LoadManager.data);
		console.log(LoadManager.craftData);

		UserFilters.distanceRange.min = CategoryFilters.a.totals.min;
		UserFilters.distanceRange.max = CategoryFilters.a.totals.max;

		console.log(CategoryFilters);

		this.testStarted = performance.now();
		this.testRunning = true;

		// this.viewer.goToLandingMode();
		/* this.viewer.fadeIn();

		gsap.to(CLOCK_SETTINGS, {
			speed: 100,
			duration: 5,
			ease: 'expo.inOut'
		}) */
	}

	clockChanged():boolean {
    return (CLOCK_SETTINGS.speed !== solarClock.hoursPerSec);
  }

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;

		if(this.clockChanged()) solarClock.hoursPerSec = CLOCK_SETTINGS.speed;
		const d = solarClock.update();

		if(this.viewer.earth) GLOBALS.clouds.render(this.gl.renderer);

		this.viewer.update(t, d);
		this.viewer.render();

		debugCan?.render();

		if(this.testRunning) {
			this.deltas.push(this.clock.currentDelta);
			// console.log(this.clock.currentDelta);
			if(performance.now() - this.testStarted >= 5000) {
				let dt = 0;
				// console.log(this.deltas);
				this.deltas.splice(0, 10);
				for(const d of this.deltas) {
					dt += d / this.deltas.length;
				}
				// dt *= 1000;
				// this.terminal.log(`Ended test with an average <span class="blue">${dt*1000}ms</span> & <span class="blue">${1/dt}fps</span>.`);
				// this.terminal.log(`<span class="green">Done!</span> ✨`);
				performanceTest.finished = true;
				performanceTest.averageDT = dt * 1000;
				this.testRunning = false;
				GLOBALS.loader.hide();
				this.initNomad();
			}

			return;
		}

		GLOBALS.timeCtrls.update();
		this.currentPage?.update();
	}
}
