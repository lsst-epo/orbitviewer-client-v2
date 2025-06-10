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
			splash: document.querySelector('.splash'),
			onboarding: document.querySelector('.onboarding'),
			wizard: document.querySelector('.wizard'),
			filters: document.querySelector('.filters'),
			search: document.querySelector('.search'),
			toolbar: document.querySelector('.toolbar'),
			timeMachine: document.querySelector('.timemachine'),
			mapControls: document.querySelector('.map_controls')
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

	showUI() {
		this.mapControls.open();
		this.timeMachine.open();
		this.toolbar.open();
	}
}

export default OrbitViewerPage;