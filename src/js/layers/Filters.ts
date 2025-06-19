import RangeSlider from "../components/RangeSlider";
import ToggleGroup from "../components/ToggleGroup";
import Layer from "./Layer";

class Filters extends Layer {
    distance: HTMLElement;
    date: HTMLElement;
    closeButton: HTMLElement;
    discoveries: HTMLElement;

    distanceSlider: RangeSlider;
    dateSlider: RangeSlider;
    
    constructor(dom) {
        super(dom, {
            openClass: 'filters--open',
            closeClass: 'filters--close',
            animationDuration: 500
        });

        this.distance = dom.querySelector('#slider-distance') as HTMLElement;
        this.date = dom.querySelector('#slider-date') as HTMLElement;
        this.discoveries = dom.querySelector('#toggle-discoveries');
		this.closeButton = dom.querySelector('.filters-head .button_icon') as HTMLElement;

        this.start();
    }

    start() {
        // Slide Range
		this.distanceSlider = new RangeSlider(this.distance, { label: '{{value}} au' });
		this.dateSlider = new RangeSlider(this.date);

        // Togglegroup
		const discoveriesToggle = new ToggleGroup(this.discoveries);
        discoveriesToggle.show();

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
    }

    open(): Promise<void> {
        // this.distanceSlider.setValues([0, 100]);
        return super.open();
    }
}

export default Filters;