import { Timer } from "@fils/ani";
import { CanvasDOMLayer, ThreeDOMLayer } from "@fils/gl-dom";
import { Clock } from "three";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { initShaders } from "../gfx/Shaders";
import { CLOCK_SETTINGS, GLOBALS, IS_DEV_MODE, VISUAL_SETTINGS } from "./Globals";
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
import { mapOrbitElementsV2, UserFilters } from "./solar/SolarUtils";
import { isMobile } from "@fils/utils";
import { SolarTimeManager } from "./solar/SolarTime";
import { getMeanAnomaly } from "./solar/SolarSystem";
import { downloadJSON } from "./Utils";
import { GuidedExperiencesPage } from "../pages/GuidedExperiencesPage";
import { _404Page } from "../pages/404Page";
import { SimQuality } from "../gfx/solar/GPUSim";

export const solarClock = new SolarClock(new Clock());

export const USE_V2 = true;
export const SHOW_DEBUG = false;

export let debugCan:Debug2DCanvas = null;

export const performanceTest = {
	finished: false,
	averageDT: 20
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
	forceRender:boolean = false;
	// orbitViewerPage: OrbitViewerPage;

	constructor() {
		GLOBALS.lang = document.documentElement.getAttribute('lang');

		GLOBALS.loader = new Loader(document.querySelector('.loader'));
		GLOBALS.loader.show();

		initShaders();

		if(SHOW_DEBUG && IS_DEV_MODE) {
			this.gl2 = new CanvasDOMLayer(document.querySelector('.view'), devicePixelRatio);
			this.gl2.canvas.classList.add('debug');
			// console.log(this.gl2.canvas);
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
		GLOBALS.share = this.share;

		// this.profiler = new PerformanceProfiler(this.viewer);
		this.start();

		console.log('%cSite by Fil Studio', "color:white;font-family:system-ui;font-size:1rem;font-weight:bold");
	}

	setTabContext(template:string) {
		const hide = template !== 'object' && template !== 'featured-object' && template !== 'orbitviewerpage';

		(document.querySelector('.solar-items') as HTMLElement).inert = hide;
		(document.querySelector('.flatpickr-calendar') as HTMLElement).inert = hide;
		(document.querySelector('.scene_controls') as HTMLElement).inert = hide;
	}
	
	initNomad() {
		const nomad = new Nomad({
			replace: false,
		}, (id, template, dom) => {
			if (template === 'orbitviewerpage') return new OrbitViewerPage(id, template, dom)
			if (template === 'objects') return new ObjectsFiltersPage(id, template, dom)
			if (template === 'guided_experiences') return new GuidedExperiencesPage(id, template, dom)
			else if ((template === 'object') || (template === 'featured-object')) return new ObjectPage(id, template, dom)
			else if (template === 'about') return new ScrollingPage(id, template, dom)
			else if (template === 'how_to_use') return new ScrollingPage(id, template, dom)
		else if (template === '404') return new _404Page(id, template, dom)
			return new DefaultPage(id, template, dom)
		})

		nomad.addRouteListener(this);
		GLOBALS.nomad = nomad;

		this.currentPage = nomad.route.page as DefaultPage;
		GLOBALS.currentPage = this.currentPage;
		if(this.currentPage.template !== "orbitviewerpage") {
			this.viewer.adjustQualitySettings(VISUAL_SETTINGS.current as SimQuality);
		}
		const template = this.currentPage.template;
		this.share.screenCapture = (template === 'object') || (template === 'featured-object')

		GLOBALS.forceCenterPlanet = template === '404';

		this.setTabContext(template);
	}

	onRouteChangeStart(href: string): void {

	}

	onRouteChanged(route: NomadRoute): void {
		this.currentPage = route.page as DefaultPage;
		GLOBALS.firstPage = false;
		GLOBALS.currentPage = this.currentPage;
		const template = this.currentPage.template
		this.share.screenCapture = (template === 'orbitviewerpage') || (template === 'object') || (template === 'featured-object')
		GLOBALS.forceCenterPlanet = template === '404';
		this.setTabContext(template);
	}

	start() {
		if(IS_DEV_MODE) {
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
		} else {
			const animate = () => {
				requestAnimationFrame(animate);
				this.update();
			}

			requestAnimationFrame(animate);
		}

		this.clock = new Timer(true);
		solarClock.start();

		GLOBALS.clock = this.clock;
		GLOBALS.solarClock = solarClock;

		// this.addGUI();
		const t = Date.now();
		// --- avoid ocasional double onloaded ----
		let alreadyLoaded = false;
		LoadManager.loadCore(() => {
			console.log('loaded')
			if(alreadyLoaded) return;
			alreadyLoaded = true;
			this.launch();
		})
	}
	
	launch() {
		const data = USE_V2 ? getSimDataV2(LoadManager.data.sample) : getSimData(LoadManager.data.sample);;
		this.viewer.setData(data);
		this.viewer.createPlanets(LoadManager.data.planets);
		this.viewer.createDwarfPlanets(LoadManager.data.dwarf_planets);

		//@ts-ignore
		window.changeLang = (lang) => {
			// console.log(lang);
			localStorage.setItem('rubin-language', lang);
			location.href = `${location.origin}/${lang}/`;
		}

		// console.log(UserFilters.categories);

		CategoryCounters['planets-moons'] = LoadManager.data.planets.length + LoadManager.data.dwarf_planets.length;

		this.viewer.createSolarItems();
		
		calculatePropRange('a');
		calculatePropRange('e');
		calculatePropRange('i');
		calculateEarthTodayDistanceMap();
		updateTotals();
		// this.viewer.hidePaths();
		// this.addGUI();
		// console.log(LoadManager.data);
		// console.log(LoadManager.craftData);
		
		// console.log(LoadManager.hasuraData.classification_ranges);
		// console.log(CategoryFilters.a);
		// console.log(CategoryCounters);

		UserFilters.distanceRange.min = CategoryFilters.a.totals.min;
		UserFilters.distanceRange.max = CategoryFilters.a.totals.max;

		// console.log(CategoryFilters);

		GLOBALS.loader.hide();
		GLOBALS.viewer.enter();
		this.initNomad();
		GLOBALS.navigation.enter();
		if(this.currentPage.template === 'orbitviewerpage') {
			const page = this.currentPage as OrbitViewerPage;
			page.appRef = this;
		} /* else {
			GLOBALS.navigation.enter();
		} */

		// this.viewer.goToLandingMode();
		/* this.viewer.fadeIn();

		gsap.to(CLOCK_SETTINGS, {
			speed: 100,
			duration: 5,
			ease: 'expo.inOut'
		}) */

		window.addEventListener('blur', e => {
			this.forceRender = true;
			this.clock.pause();
		});

		window.addEventListener('focus', e => {
			this.clock.resume();
		});

		window.addEventListener('resize', e => {
			setTimeout(()=> {
				this.forceRender = true;
			}, 200);
		})
	}
	

	startTest() {
		this.testStarted = performance.now();
		this.testRunning = true;
	}

	clockChanged():boolean {
    return (CLOCK_SETTINGS.speed !== solarClock.hoursPerSec);
  }

	update() {
		if(this.clock.paused && !this.forceRender) return;

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
			if(performance.now() - this.testStarted >= 2000) {
				let dt = 0;
				// this.deltas.splice(0, 10);
				// console.log(this.deltas);
				for(const d of this.deltas) {
					dt += d / this.deltas.length;
				}
				// dt *= 1000;
				// this.terminal.log(`Ended test with an average <span class="blue">${dt*1000}ms</span> & <span class="blue">${1/dt}fps</span>.`);
				// this.terminal.log(`<span class="green">Done!</span> ✨`);
				const page = this.currentPage as OrbitViewerPage;
				performanceTest.finished = true;
				performanceTest.averageDT = dt * 1000;
				page.onboarding?.updateRecommendedTier();
				this.testRunning = false;
				GLOBALS.loader.hide();
				// this.initNomad();
				// GLOBALS.viewer.enter();
				GLOBALS.navigation.enter();
			}

			return;
		}

		GLOBALS.timeCtrls.update();
		this.currentPage?.update();

		this.forceRender = false;
	}
}
