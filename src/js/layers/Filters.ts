import RangeSlider from "../components/RangeSlider";
import ToggleGroup from "../components/ToggleGroup";
import { CategoryFilters } from "../core/data/Categories";
import { GLOBALS } from "../core/Globals";
import { UserFilters } from "../core/solar/SolarUtils";
import Layer from "./Layer";

class Filters extends Layer {
    distance: HTMLElement;
    date: HTMLElement;
    closeButton: HTMLElement;
    resetButton: HTMLElement;
    applyButton: HTMLElement;
    discoveries: HTMLElement;

    distanceSlider: RangeSlider;
    dateSlider: RangeSlider;
    discoveriesToggle: ToggleGroup;
    
    constructor(dom) {
        super(dom, {
            openClass: 'filters--open',
            closeClass: 'filters--close',
            closingClasses: ['out'],
            animationDuration: 500
        });

        this.distance = dom.querySelector('#slider-distance') as HTMLElement;
        this.date = dom.querySelector('#slider-date') as HTMLElement;
        this.discoveries = dom.querySelector('#toggle-discoveries');
		this.closeButton = dom.querySelector('.filters-head .button_icon') as HTMLElement;
        this.applyButton = dom.querySelector('.button-apply') as HTMLElement;
        this.resetButton = dom.querySelector('.button-reset') as HTMLElement;

        this.start();
    }

    start() {
        // Togglegroup
		this.discoveriesToggle = new ToggleGroup(
            this.discoveries,
            (value, index) => {
                // console.log('Discoveries toggle value:', value, index);
                UserFilters.discoveredBy = index;
                GLOBALS.viewer.filtersUpdated();
            }
        );
        this.discoveriesToggle.show();

        // Sliders
		this.distanceSlider = new RangeSlider(
            this.distance,
            {
                label: '{{value}}',
                onChange: (values) => {
                    // console.log('Distance slider values:', values);
                    UserFilters.distanceRange.min = values[0];
                    UserFilters.distanceRange.max = values[1];
                    GLOBALS.viewer.filtersUpdated();
                },
                values: [
                    UserFilters.distanceRange.min,
                    UserFilters.distanceRange.max
                ],
                minmax: [
                    CategoryFilters.a.totals.min,
                    CategoryFilters.a.totals.max
                ]
            }
        );

        // this.distanceSlider.setValues([CategoryFilters.a.totals.min, CategoryFilters.a.totals.max]);

		/* this.dateSlider = new RangeSlider(
            this.date,
            {
                onChange: (values) => {
                    // console.log('Date slider values:', values);
                },
                values: [
                    UserFilters.dateRange.min,
                    UserFilters.dateRange.max
                ],
                minmax: [
                    1900,
                    2100
                ]
            }
        ); */

		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
		
        this.applyButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});

        this.resetButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.distanceSlider.reset();
            // this.dateSlider.reset();
            this.discoveriesToggle.reset();
        })
    }

    open(): Promise<void> {
        this.distanceSlider.setRange(CategoryFilters.a.totals.min, CategoryFilters.a.totals.max);
        this.distanceSlider.setValues([UserFilters.distanceRange.min, UserFilters.distanceRange.max]);
        this.discoveriesToggle.setIndex(UserFilters.discoveredBy);
        return super.open();
    }
}

export default Filters;
