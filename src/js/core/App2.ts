import { ThreeDOMLayer } from "@fils/gl-dom";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { Timer } from "@fils/ani";
import flatpickr from "flatpickr";
import { Tabs } from "../ui/tabs";

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

		// Flatpickr (Datepicker)

		flatpickr("#myDateInput", {
			disableMobile: true,
			position: "above",
			enableTime: true,
			dateFormat: "F j, Y H:i",
			defaultDate: new Date(),
			locale: {
				weekdays: {
					shorthand: ["S", "M", "T", "W", "T", "F", "S"],
					longhand: [
						"Sunday",
						"Monday",
						"Tuesday",
						"Wednesday",
						"Thursday",
						"Friday",
						"Saturday"
					]
				}
			},
			minDate: "2024-05-30",
    		// maxDate: "2026-12-30",
			onChange: function(_, __, instance) {
				if (instance.timeContainer) {
					const timeInputs = instance.timeContainer.querySelectorAll('input');
					timeInputs.forEach(input => input.blur());
				}
			}
		});

		// Tabs
		const shareTabs = new Tabs('.share_dialog-body');

		// Toggle Share
		const shareTrigger = document.querySelector('.button_share');
		const shareLayer = document.querySelector('.share');
		shareTrigger.addEventListener('click', ()=> {
			const visibility = shareLayer.getAttribute('aria-hidden');
			shareLayer.setAttribute('aria-hidden', visibility === "true" ? "false" : "true");
		});

		// Toggle Share
		const shareClose = document.querySelector('.share .button_close');
		shareClose.addEventListener('click', ()=> {
			const visibility = shareLayer.getAttribute('aria-hidden');
			shareLayer.setAttribute('aria-hidden', visibility === "true" ? "false" : "true");
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

		// Search Close
		const searchLayer = document.querySelector('.search');
		const searchClose = searchLayer.querySelector('.search-head .button_icon');
		searchClose.addEventListener('click', (event: Event) => {
			event.preventDefault();
			const isHidden = searchLayer.getAttribute('aria-hidden');
			if (isHidden === "false") {
				const focusedElement = searchLayer.querySelector(':focus');
				if (focusedElement) {
					(focusedElement as HTMLElement).blur();
				}
				searchLayer.setAttribute('aria-hidden', "true");
			} else {
				searchLayer.setAttribute('aria-hidden', "false");
			}
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

		// Onboarding
		const onboardingButton = document.querySelectorAll('.exploration_card-foot .button');
		const wizardLayer = document.querySelector('.wizard');
		onboardingButton.forEach(el => {
			el.addEventListener('click', (event) => {
				event.preventDefault();

				const isHidden = onboardingLayer.getAttribute('aria-hidden');
				if (isHidden === "false") {
					const focusedElement = onboardingLayer.querySelector(':focus');
					if (focusedElement) {
						(focusedElement as HTMLElement).blur();
					}
					onboardingLayer.setAttribute('aria-hidden', "true");
					wizardLayer.setAttribute('aria-hidden', "false");
				} else {
					onboardingLayer.setAttribute('aria-hidden', "false");
				}
			});
		});

		// Wizard
		const wizardButton = document.querySelectorAll('.wizard_tooltip .button');
		wizardButton.forEach(el => {
			el.addEventListener('click', (event) => {
				event.preventDefault();

				const isHidden = wizardLayer.getAttribute('aria-hidden');
				if (isHidden === "false") {
					const focusedElement = wizardLayer.querySelector(':focus');
					if (focusedElement) {
						(focusedElement as HTMLElement).blur();
					}
					wizardLayer.setAttribute('aria-hidden', "true");
				} else {
					wizardLayer.setAttribute('aria-hidden', "false");
				}
			});
		});

		// Timemachine toggle
		const timemachineComponent = document.querySelector('.timemachine');
		const timemachineToggle = document.querySelector('#timemachine-toggle');
		timemachineToggle.addEventListener('click', (e) => {
			e.preventDefault();
			const isExpanded = timemachineToggle.getAttribute('aria-expanded');
			if (isExpanded === "true") {
				timemachineToggle.setAttribute('aria-expanded', "false");
			} else {
				timemachineToggle.setAttribute('aria-expanded', "true");
			}

			timemachineComponent.classList.toggle('collapsed');
		});

		// Close Filters
		const filtersComponent = document.querySelector('.filters');
		const filtersClose = document.querySelector('.filters-head .button_icon');
		filtersClose.addEventListener('click', (e) => {
			e.preventDefault();
			const isHidden = filtersComponent.getAttribute('aria-hidden');
			if (isHidden === "true") {
				filtersComponent.setAttribute('aria-hidden', "false");
			} else {
				filtersComponent.setAttribute('aria-hidden', "true");
			}
		});
	}

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;
		this.viewer.update(t);
		this.viewer.render();
	}
}