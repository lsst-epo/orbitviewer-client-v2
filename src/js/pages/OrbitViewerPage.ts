import { DefaultPage } from "@fils/nomad";
import Filters from "../layers/Filters";
import MapControls from "../layers/MapControls";
import Onboarding from "../layers/Onboarding";
import Search from "../layers/Search";
import Splash from "../layers/Splash";
import TimeMachine from "../layers/TimeMachine";
import Toolbar from "../layers/Toolbar";
import Wizard from "../layers/Wizard";

class OrbitViewerPage extends DefaultPage {
    filters: Filters;
    search: Search;
    timeMachine: TimeMachine;
    wizard: Wizard;
    splash: Splash;
	onboarding: Onboarding;
	mapControls: MapControls;
	toolbar: Toolbar;
	elements: { splash: Element; onboarding: Element; wizard: Element; filters: Element; search: Element; toolbar: Element; timeMachine: Element; mapControls: Element; };
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

		this.elements = {
			splash: this.dom.querySelector('.splash'),
			onboarding: this.dom.querySelector('.onboarding'),
			wizard: this.dom.querySelector('.wizard'),
			filters: this.dom.querySelector('.filters'),
			search: this.dom.querySelector('.search'),
			toolbar: this.dom.querySelector('.toolbar'),
			timeMachine: this.dom.querySelector('.timemachine'),
			mapControls: this.dom.querySelector('.map_controls')
		};
		
		this.splash = this.elements.splash ? new Splash(this.elements.splash, this) : null;
		this.onboarding = this.elements.onboarding ? new Onboarding(this.elements.onboarding, this) : null;		
		this.wizard = this.elements.wizard ? new Wizard(this.elements.wizard) : null;
		this.filters = this.elements.filters ? new Filters(this.elements.filters) : null;
		this.search = this.elements.search ? new Search(this.elements.search) : null;
		this.toolbar = this.elements.toolbar ? new Toolbar(this.elements.toolbar, this) :  null;
		this.timeMachine = this.elements.timeMachine ? new TimeMachine(this.elements.timeMachine) :  null;
		this.mapControls = this.elements.mapControls ? new MapControls(this.elements.mapControls, this) :  null;
    }

    create() {
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
    }

	showUI() {
		this.mapControls.open();
		this.timeMachine.open();
		this.toolbar.open();
	}
}

export default OrbitViewerPage;