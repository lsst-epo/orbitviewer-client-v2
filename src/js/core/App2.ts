import { ThreeDOMLayer } from "@fils/gl-dom";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { Timer } from "@fils/ani";
import ToggleGroup from "../components/ToggleGroup";
import Filters from "../layers/filters";
import TimeMachine from "../layers/TimeMachine";
import Share from "../layers/Share";
import Search from "../layers/Search";
import Wizard from "../layers/Wizard";

export class App2 {
	gl:ThreeDOMLayer;
	viewer:OrbitViewer;
	clock:Timer;

	constructor() {
		this.gl = new ThreeDOMLayer(document.querySelector('.view'));
		this.gl.renderer.setClearColor(0x000000, 0);
		this.viewer = new OrbitViewer(this.gl);
		
		this.start();

		console.log('%cSite by Fil Studio', "color:white;font-family:system-ui;font-size:1rem;font-weight:bold");
	}

	start() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.update();
		}

		requestAnimationFrame(animate);

		this.clock = new Timer(true);

		
		// Filters
		const filtersContainer = document.querySelector('.filters');
		const filters = new Filters(filtersContainer);

		// Timemachine
		const timeMachineContainer = document.querySelector('.timemachine');
		const timeMachine = new TimeMachine(timeMachineContainer);

		// Share
		const shareContainer = document.querySelector('.share');
		const share = new Share(shareContainer);

		// Search
		const searchContainer = document.querySelector('.search');
		const search = new Search(searchContainer);

		// Wizard
		const wizardContainer = document.querySelector('.wizard');
		const wizard = new Wizard(wizardContainer);
	

		const objectsToggleContainer = document.querySelectorAll('.objects_card .togglegroup');
		objectsToggleContainer.forEach(element => {
			const objectsToggle = new ToggleGroup(element);
		});

		// Toggle Navigation
		const navTrigger = document.querySelector('#nav_trigger');
		const navDropdown = document.querySelector('#nav_dropdown');
		navTrigger.addEventListener('click', ()=> {
			const visibility = navDropdown.getAttribute('aria-hidden');
			navDropdown.setAttribute('aria-hidden', visibility === "true" ? "false" : "true");
		});

		// Toolbar Navigation
		const toolbarItem = document.querySelectorAll('.toolbar-link');
		toolbarItem.forEach(el => {
			el.addEventListener('click', (event) => {
				event.preventDefault();
				const openValue = el.getAttribute('data-open');
				const wasActive = el.classList.contains('active');
				
				toolbarItem.forEach(item => {
					if (item !== el) {
						const itemOpenValue = item.getAttribute('data-open');
						const itemTarget = document.querySelector(`.${itemOpenValue}`);
						if (itemTarget) {
							itemTarget.setAttribute('aria-hidden', 'true');
						}
					}
				});
				
				toolbarItem.forEach(item => item.classList.remove('active'));
				
				if (!wasActive) {
					el.classList.add('active');
				}

				const target = document.querySelector(`.${openValue}`);
				if (target) {
					const isHidden = target.getAttribute('aria-hidden');
					target.setAttribute('aria-hidden', isHidden === "true" ? "false" : "true");
				}
			});
		});

		// Homepage
		const homeLayer = document.querySelector('.home');
		const homeButton = document.querySelector('.home .button');
		const onboardingLayer = document.querySelector('.onboarding');
		if (homeButton) {
			homeButton.addEventListener('click', (event: Event) => {
				event.preventDefault();
				const isHidden = homeLayer.getAttribute('aria-hidden');
				if (isHidden === "false") {
					const focusedElement = homeLayer.querySelector(':focus');
					if (focusedElement) {
						(focusedElement as HTMLElement).blur();
					}
					homeLayer.setAttribute('aria-hidden', "true");
					onboardingLayer.setAttribute('aria-hidden', "false");
				} else {
					homeLayer.setAttribute('aria-hidden', "false");
				}
			});
		}
	}

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;
		this.viewer.update(t);
		this.viewer.render();
	}
}