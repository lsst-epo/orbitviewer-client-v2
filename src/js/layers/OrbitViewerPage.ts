import Filters from "./Filters";
import MapControls from "./MapControls";
import ObjectsFilters from "./ObjectsFilters";
import Onboarding from "./Onboarding";
import Search from "./Search";
import Splash from "./Splash";
import TimeMachine from "./TimeMachine";
import Toolbar from "./Toolbar";
import Wizard from "./Wizard";

class OrbitViewerPage {
    objectsFilters: ObjectsFilters;
    filters: Filters;
    search: Search;
    timeMachine: TimeMachine;
    wizard: Wizard;
    splash: Splash;
	onboarding: Onboarding;
	mapControls: MapControls;
	toolbar: Toolbar;
    
    constructor() {
        const splashDom = document.querySelector('.splash');
		const onboardingDom = document.querySelector('.onboarding');
		const wizardDom = document.querySelector('.wizard');
		const filtersDom = document.querySelector('.filters');
		const searchDom = document.querySelector('.search');
		const toolbarDom = document.querySelector('.toolbar');
		const timeMachineDom = document.querySelector('.timemachine');
		const mapControlsDom = document.querySelector('.map_controls');
		
		this.splash = splashDom ? new Splash(splashDom, this) : null;
		this.onboarding = onboardingDom ? new Onboarding(onboardingDom, this) : null;		
		this.wizard = wizardDom ? new Wizard(wizardDom) : null;
		this.filters = filtersDom ? new Filters(filtersDom) : null;
		this.search = searchDom ? new Search(searchDom) : null;
		this.toolbar = toolbarDom ? new Toolbar(toolbarDom, this) :  null;
		this.timeMachine = timeMachineDom ? new TimeMachine(timeMachineDom) :  null;
		this.mapControls = mapControlsDom ? new MapControls(mapControlsDom, this) :  null;

        this.start();
    }

    start() {
		// Toolbar
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