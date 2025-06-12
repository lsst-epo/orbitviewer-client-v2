import flatpickr from "flatpickr";
import RangeSlider from "../components/RangeSlider";
import Layer from "./Layer";
import { CLOCK_SETTINGS, GLOBALS } from "../core/Globals";
import { SimpleSlider, SliderListener } from "../components/SimpleSlider";

class TimeMachine extends Layer implements SliderListener {
    slider: HTMLElement;
  	toggleButton: HTMLElement;
  	timemachineSlider: SimpleSlider;

		liveCheckBox:HTMLInputElement;
		playPause:HTMLButtonElement;
		collapsedLabel:HTMLSpanElement;

		flat;
    
    constructor(public dom:HTMLElement) {
      super(dom, {
          openClass: 'timemachine--open',
          closeClass: 'timemachine--close',
          animationDuration: 500
      });

			this.dom = dom;
			this.slider = dom.querySelector('#slider-timemachine') as HTMLElement;
    	this.toggleButton = dom.querySelector('#timemachine-toggle') as HTMLElement;

			this.timemachineSlider = new SimpleSlider(this.slider, .5);
			this.timemachineSlider.units = "hrs/s"
			this.timemachineSlider.setMinMax(-CLOCK_SETTINGS.maxSpeed, CLOCK_SETTINGS.maxSpeed);
			this.timemachineSlider.addListener(this);

			this.liveCheckBox = dom.querySelector('input#live');
			this.liveCheckBox.onclick = () => {
				if(this.liveCheckBox.disabled) return;
				this.liveCheckBox.disabled = true;
				this.liveCheckBox.checked = true;
				this.timemachineSlider.value = 0.5;
				GLOBALS.solarClock.goLive();
				this.updatePlayPause();
			}

			this.playPause = dom.querySelector('button.button_icon');
			this.playPause.onclick = () => {
				if(GLOBALS.solarClock.playing) GLOBALS.solarClock.pause();
				else GLOBALS.solarClock.resume();
				this.updatePlayPause();
			}

			this.collapsedLabel = dom.querySelector('button#timemachine-toggle').querySelector('span');

		// this.timemachineSlider.setRange(-1000, 1000);
		// this.timemachineSlider.setValues([0, 0]);

		// this.timemachineSlider.setValues([0]);
      
			this.start();
    }

		updatePlayPause() {
			if(GLOBALS.solarClock.playing) {
				this.playPause.classList.remove('button_play-resume')
				this.playPause.classList.add('button_play-pause')
			} else {
				this.playPause.classList.add('button_play-resume')
				this.playPause.classList.remove('button_play-pause')
			}
		}

		updateLabel() {
			this.collapsedLabel.textContent = `${CLOCK_SETTINGS.speed} hrs/s`
		}

		open(): Promise<void> {
			return new Promise(resolve => {
				super.open().then(r => {
					this.timemachineSlider.update();
					this.updatePlayPause();
					this.timemachineSlider.enabled = true;
					resolve();
				})
			});
		}

		close(): Promise<void> {
			this.timemachineSlider.enabled = false;
			return super.close();
		}

    start() {		
      // Flatpickr Datepicker
      this.flat = flatpickr("#myDateInput", {
				disableMobile: true,
				position: "above",
				enableTime: true,
				dateFormat: "M j, Y H:i",
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
				minDate: "1900-01-01",
    		// maxDate: "2100-01-01",
				onChange: function(_, __, instance) {
					if (instance.timeContainer) {
						const timeInputs = instance.timeContainer.querySelectorAll('input');
						timeInputs.forEach(input => input.blur());
					}
				},
				onClose: () => {
					GLOBALS.solarClock.setDate(new Date(this.flat.input.value))
				}
			});

        // Timemachine toggle
			this.toggleButton.addEventListener('click', (e) => {
				e.preventDefault();
				this.toggle();
			});

			console.log(this.flat);
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

		onChange(normalizedValue: number): void {
			CLOCK_SETTINGS.speed = normalizedValue;
			GLOBALS.solarClock.resume();
			this.updateLabel();
		}

		update() {
			if(this.flat && this.flat.isOpen) return;
			this.flat.setDate(GLOBALS.solarClock.currentDate);

			this.liveCheckBox.disabled = GLOBALS.solarClock.live;
			this.liveCheckBox.checked = GLOBALS.solarClock.live;
		}
}

export default TimeMachine;