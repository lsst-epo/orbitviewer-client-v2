import flatpickr from "flatpickr";
import RangeSlider from "../components/RangeSlider";
import Layer from "./Layer";

class TimeMachine extends Layer {
    slider: HTMLElement;
    toggleButton: HTMLElement;
    dom: HTMLElement;
    
    constructor(dom) {
        super(dom);

        this.slider = dom.querySelector('#slider-timemachine') as HTMLElement;
        this.toggleButton = dom.querySelector('#timemachine-toggle') as HTMLElement;

        this.start();
    }

    start() {
        // Slide Range
		const timemachineSlider = new RangeSlider(this.slider);
		
        // Flatpickr Datepicker
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

        // Timemachine toggle
		this.toggleButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.toggle();
		});
    }

    toggle() {
        const isExpanded = this.toggleButton.getAttribute('aria-expanded');
        if (isExpanded === "true") {
            this.toggleButton.setAttribute('aria-expanded', "false");
        } else {
            this.toggleButton.setAttribute('aria-expanded', "true");
        }

        this.dom.classList.toggle('collapsed');
    }
}

export default TimeMachine;