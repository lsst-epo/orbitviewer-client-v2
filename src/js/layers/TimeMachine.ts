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
			// to-do: fold css class
			if(CLOCK_SETTINGS.speed === 0){

			} else {
				
			}

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
			minDate: new Date("1900-01-01"),
			maxDate: new Date("2100-01-01"),

			onOpen: function(selectedDates, dateStr, instance) {
				const backdrop = document.createElement('div');
				backdrop.className = 'flatpickr-backdrop';
				backdrop.addEventListener('click', () => instance.close());
				document.body.appendChild(backdrop);

				
				const calendar = instance.calendarContainer;
				if (calendar && !calendar.querySelector('.flatpickr-footer')) {
					const footer = document.createElement('div');
					footer.className = 'flatpickr-footer';
					footer.innerHTML = `
						<button type="button" class="button small secondary button_live"><span>Live</span></button>
						<div class="primary_actions">
						<button type="button" class="button small secondary button_cancel"><span>Cancel</span></button>
						<button type="button" class="button small primary button_apply"><span>Apply</span></button>
						</div>
					`;
					calendar.appendChild(footer);

					const cancelBtn = footer.querySelector('.button_cancel');
					const nowBtn = footer.querySelector('.button_live');
					const applyBtn = footer.querySelector('.button_apply');

					cancelBtn?.addEventListener('click', () => {
						instance.close();
					});

					nowBtn?.addEventListener('click', () => {
						const now = new Date();
						instance.setDate(now, true);
					});

					applyBtn?.addEventListener('click', () => {
						const currentDate = instance.selectedDates[0] || new Date();
						GLOBALS.solarClock.setDate(currentDate);
						instance.close();
					});
				}
			},
			
			onClose: function() {
				const backdrop = document.querySelector('.flatpickr-backdrop');
				if (backdrop) {
					backdrop.remove();
				}
			},
			
			onChange: function(_, __, instance) {
				if (instance.timeContainer) {
					const timeInputs = instance.timeContainer.querySelectorAll('input');
					timeInputs.forEach(input => input.blur());
				}
			},
		});

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

		onChange(normalizedValue: number): void {
			CLOCK_SETTINGS.speed = normalizedValue;
			GLOBALS.solarClock.resume();
			this.updateLabel();

			let animationDuration;
			if (CLOCK_SETTINGS.speed === 0) {
				animationDuration = 1;
			} else {
				const absSpeed = Math.abs(CLOCK_SETTINGS.speed);
				animationDuration = Math.max(0.3, 1 / absSpeed);
			}
			this.dom.style.setProperty('--speed', `${animationDuration}s`);
		}

		update() {
			if(this.flat && this.flat.isOpen) return;
			this.flat.setDate(GLOBALS.solarClock.currentDate);

			this.liveCheckBox.disabled = GLOBALS.solarClock.live;
			this.liveCheckBox.checked = GLOBALS.solarClock.live;
		}
}

export default TimeMachine;