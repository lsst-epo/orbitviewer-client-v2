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

const SKIP_ONBOARDING = false;

class OrbitViewerPage extends DefaultPage {
	filters: Filters;
	search: Search;
	// timeMachine: TimeMachine;
	wizard: Wizard;
	splash: Splash;
	onboarding: Onboarding;
	// mapControls: MapControls;
	toolbar: Toolbar;
	elements: { splash: Element; onboarding: Element; wizard: Element; filters: Element; search: Element; toolbar: Element; };
	openLayers: Set<string>;
    
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
			// timeMachine: document.querySelector('.timemachine'),
			// mapControls: document.querySelector('.map_controls')
		};

		this.splash = this.elements.splash ? new Splash(this.elements.splash, this) : null;
		this.onboarding = this.elements.onboarding ? new Onboarding(this.elements.onboarding, this) : null;		
		this.wizard = this.elements.wizard ? new Wizard(this.elements.wizard) : null;
		this.filters = this.elements.filters ? new Filters(this.elements.filters) : null;
		this.search = this.elements.search ? new Search(this.elements.search) : null;
		this.toolbar = this.elements.toolbar ? new Toolbar(this.elements.toolbar, this) :  null;
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

		// console.log(GLOBALS.firstPage);

		if(GLOBALS.firstPage) {
			if(IS_DEV_MODE && SKIP_ONBOARDING) {
				this.splash?.close();
				GLOBALS.viewer.goToOrbitViewerMode(true);
				this.showUI();
			} else {
				GLOBALS.viewer.goToLandingMode();
			}
		} else {
			this.splash?.close();
			GLOBALS.viewer.goToOrbitViewerMode();
			this.showUI();
		}

		GLOBALS.objectToggle.hide();

		super.create();
	}

	transitionIn(resolve: any): Promise<void> {
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

	showUI() {
		GLOBALS.mapCtrls.open();
		GLOBALS.timeCtrls.open();
		this.toolbar.open();
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