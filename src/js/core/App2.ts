import { ThreeDOMLayer } from "@fils/gl-dom";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { Timer } from "@fils/ani";
import flatpickr from "flatpickr";

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

		// Timemachine Toggle

	}

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;
		this.viewer.update(t);
		this.viewer.render();
	}
}