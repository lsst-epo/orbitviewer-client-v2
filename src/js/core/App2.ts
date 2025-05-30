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
	}

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;
		this.viewer.update(t);
		this.viewer.render();
	}
}