import RangeSlider from "../components/RangeSlider";
import ToggleGroup from "../components/ToggleGroup";
import Layer from "./Layer";

class Filters extends Layer {
    distance: HTMLElement;
    date: HTMLElement;
    closeButton: HTMLElement;
    discoveries: HTMLElement;
    
    constructor(dom) {
        super(dom);

        this.distance = dom.querySelector('#slider-distance') as HTMLElement;
        this.date = dom.querySelector('#slider-date') as HTMLElement;
        this.discoveries = dom.querySelector('#toggle-discoveries');
		this.closeButton = dom.querySelector('.filters-head .button_icon') as HTMLElement;

        this.start();
    }

    start() {
        // Slide Range
		const distanceSlider = new RangeSlider(this.distance);
		const dateSlider = new RangeSlider(this.date);

        // Togglegroup
		const discoveriesToggle = new ToggleGroup(this.discoveries);

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
    }
}

export default Filters;