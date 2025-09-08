import Filters from "../layers/Filters";
import MapControls from "../layers/MapControls";
import Onboarding from "../layers/Onboarding";
import Search from "../layers/Search";
import Splash from "../layers/Splash";
import TimeMachine from "../layers/TimeMachine";
import Toolbar from "../layers/Toolbar";
import Wizard from "../layers/Wizard";
import { GLOBALS, IS_DEV_MODE } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";
import { LoadManager } from "../core/data/LoadManager";
import gsap from "gsap";
import Toast from "../layers/Toast";
import { parseURL } from "../core/Utils";
import { isMobile } from "@fils/utils";
import { App } from "../core/App";
import { PerformanceWarning } from "../components/PerformanceModal";

const SKIP_ONBOARDING = false;

class OrbitViewerPage extends DefaultPage {
	filters: Filters;
	search: Search;
	// timeMachine: TimeMachine;
	wizard: Wizard;
	splash: Splash;
	onboarding: Onboarding;
	toast: Toast;
	// mapControls: MapControls;
	toolbar: Toolbar;
	elements: { splash: Element; onboarding: Element; wizard: Element; toast: Element, filters: Element; search: Element; toolbar: Element; };
	openLayers: Set<string>;

	isLanding:boolean = true;

	appRef:App = null;

	performanceWarning:PerformanceWarning;

	perfTest = {
		running: false,
		done: false,
		dt: []
	}
    
  constructor(id: string, template: string, dom: HTMLElement) {
    super(id, template, dom)
  }

	createElements() {
		this.openLayers = new Set();

		this.elements = {
			splash: document.querySelector('.splash'),
			onboarding: document.querySelector('.onboarding'),
			wizard: document.querySelector('.wizard'),
			filters: document.querySelector('.filters'),
			search: document.querySelector('.search'),
			toolbar: document.querySelector('.toolbar'),
			toast: document.querySelector('.toast'),
			// timeMachine: document.querySelector('.timemachine'),
			// mapControls: document.querySelector('.map_controls')
		};

		this.performanceWarning = new PerformanceWarning(this.dom.querySelector('.modal'), (done:boolean) => {
			if(done) {
				this.perfTest.done = true;
				GLOBALS.performanceTestDone = true;
			}
		});
		// this.performanceWarning.show();

		this.splash = this.elements.splash ? new Splash(this.elements.splash, this) : null;
		this.onboarding = this.elements.onboarding ? new Onboarding(this.elements.onboarding, this) : null;		
		this.wizard = this.elements.wizard ? new Wizard(this.elements.wizard) : null;
		this.filters = this.elements.filters ? new Filters(this.elements.filters) : null;
		this.search = this.elements.search ? new Search(this.elements.search) : null;
		this.toolbar = this.elements.toolbar ? new Toolbar(this.elements.toolbar, this) :  null;
		this.toast = this.elements.toast ? new Toast(this.elements.toast) : null
		// this.timeMachine = this.elements.timeMachine ? new TimeMachine(this.elements.timeMachine) :  null;
		// this.mapControls = this.elements.mapControls ? new MapControls(this.elements.mapControls, this) :  null;

		if (this.filters) {
			this.filters.setStateChangeCallback((isVisible) => isVisible ? this.trackLayerOpen('filters') : this.trackLayerClose('filters'));
		}
		if (this.search) {
			this.search.setStateChangeCallback((isVisible) => isVisible ? this.trackLayerOpen('search') : this.trackLayerClose('search'));
        }
	}

	create(): void {
		this.createElements();

		// console.log("is first", GLOBALS.firstPage);

		if(GLOBALS.firstPage) {
			const params = GLOBALS.urlParams();
			// console.log(params)
			if((IS_DEV_MODE && SKIP_ONBOARDING) || (params.length > 0)) {
				this.splash?.close();
				GLOBALS.viewer.goToOrbitViewerMode(true);
				GLOBALS.viewer.adjustQualitySettings(isMobile() ? 'low' : 'medium');
				this.showUI();
				this.isLanding = false;
				parseURL();
			} else {
				GLOBALS.viewer.goToLandingMode();
			}
		} else {
			this.splash?.close();
			GLOBALS.viewer.goToOrbitViewerMode();
			this.showUI();
			this.isLanding = false;
		}

		// console.log('create', this.isLanding);

		GLOBALS.objectToggle.hide();

		super.create();
	}

	transitionIn(resolve: any): Promise<void> {
		document.body.classList.add('in-viewer');
		GLOBALS.viewer.enter();
		const total = LoadManager.data.rubinCount;
		const n = {
			value: Math.max(0, total-2000)
		}

		const p = this.dom.querySelector("p.value");
		p.setAttribute('aria-label', `${total.toLocaleString()} discoveries`);

		return new Promise<void>(gsapResolve => {
			gsapResolve();
			gsap.to(n, {
				value: total,
				ease: 'expo.inOut',
				duration: 3,
				onUpdate: () => {
					const nr = Math.round(n.value);
					p.textContent = nr.toLocaleString();
				},
				onComplete: () => {
					// gsapResolve();
				}
			})
		}).then(resolve);
	}

	transitionOut(resolve: any): Promise<void> {
		document.body.classList.remove('in-viewer');
		// GLOBALS.viewer.leave();
		return super.transitionOut(resolve);
	}

	showUI() {
		this.isLanding = false;
		GLOBALS.mapCtrls.open();
		GLOBALS.timeCtrls.open();
		GLOBALS.navigation.enter();
		this.toolbar.open();
		this.wizard.check();
	}

	trackLayerOpen(layerName: string) {
		this.openLayers.add(layerName);
		this.notifyToolbar();
	}

	trackLayerClose(layerName: string) {
		this.openLayers.delete(layerName);
		this.notifyToolbar();
	}

	isLayerOpen(layerName: string): boolean {
		return this.openLayers.has(layerName);
	}

	notifyToolbar() {
		if (this.toolbar) {
			this.toolbar.updateActiveStates(this.openLayers);
		}
	}

	update() {
		if(this.isLanding) return;

		// TOAST
		if (this.toast && GLOBALS.solarClock) {
			const { isInEdge } = GLOBALS.solarClock;
			const isVisible = this.toast.isVisible();
			if (isVisible && !isInEdge) this.toast.close();
			else if (!isVisible && isInEdge) this.toast.open();
		}
		// END TOAST

		// PERFORMANCE TEST
		if(GLOBALS.performanceTestDone) return;
		if(this.performanceWarning.visible) return;
		const pt = this.perfTest;
		if(!pt.running && !pt.done) {
			pt.running = true;
		}
		if(!pt.running) return;
		const dt = GLOBALS.clock.currentDelta;
		pt.dt.push(dt);
		if(pt.dt.length >= 600) {
			let d = 0;
			for(let i=0; i<pt.dt.length; i++) {
				d += pt.dt[i] / pt.dt.length;
			}
			if( d > 1 / 25) {
				// OUCH!
				this.performanceWarning.show();
			}

			pt.dt.splice(0, pt.dt.length);
		}
	}

	toggleLayer(targetLayer: string) {
		if (this.isLayerOpen(targetLayer)) {
			if (this[targetLayer] && this[targetLayer].close) {
				this[targetLayer].close();
			}
			return;
		}
		
		const layersToClose = Array.from(this.openLayers).filter(layer => layer !== targetLayer);
		layersToClose.forEach(layerName => {
			if (this[layerName] && this[layerName].close) {
				this[layerName].close();
			}
		});
		
		if (this[targetLayer] && this[targetLayer].open) {
			this[targetLayer].open();
		}
	}
}

export default OrbitViewerPage;