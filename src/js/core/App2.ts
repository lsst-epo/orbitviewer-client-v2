import { ThreeDOMLayer } from "@fils/gl-dom";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { Timer } from "@fils/ani";
import Share from "../layers/Share";
import Navigation from "../layers/Navigation";
import { DefaultPage, Nomad, NomadRoute, NomadRouteListener } from "@fils/nomad";
import { ObjectPage } from "../pages/ObjectPage";
import { ObjectsFiltersPage } from "../pages/ObjectsFiltersPage";
import ObjectsFilters from "../layers/ObjectsFilters";
import Filters from "../layers/Filters";
import Search from "../layers/Search";
import TimeMachine from "../layers/TimeMachine";
import Wizard from "../layers/Wizard";

export class App2 implements NomadRouteListener {
	gl:ThreeDOMLayer;
	viewer:OrbitViewer;
	clock:Timer;
	currentPage: DefaultPage;

	constructor() {
		this.gl = new ThreeDOMLayer(document.querySelector('.view'));
		this.gl.renderer.setClearColor(0x000000, 0);
		this.viewer = new OrbitViewer(this.gl);

		this.initNomad();
		
		this.start();

		console.log('%cSite by Fil Studio', "color:white;font-family:system-ui;font-size:1rem;font-weight:bold");
	}

	initNomad() {
		const nomad = new Nomad({
			replace: false
		}, (id, template, dom) => {
			if (template === 'objects') return new ObjectsFiltersPage(id, template, dom)
			else if (template === 'object') return new ObjectPage(id, template, dom)
			return new DefaultPage(id, template, dom)
		})
		
		nomad.addRouteListener(this);
		
		this.currentPage = nomad.route.page as DefaultPage;
	}
	
	onRouteChangeStart(href: string): void {
		
	}

	onRouteChanged(route: NomadRoute): void {
		this.currentPage = route.page as DefaultPage;
	}

	start() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.update();
		}

		requestAnimationFrame(animate);

		this.clock = new Timer(true);

		// Navigation
		const navigationDom = document.querySelector('.nav_dropdown');
		const navigation = new Navigation(navigationDom);

		// Share
		const shareDom = document.querySelector('.share');
		const share = new Share(shareDom);

		// Objects Filters
		const objectsFiltersDom = document.querySelector('.objects');
		const objectsFilters = new ObjectsFilters(objectsFiltersDom);

		// Filters
		const filtersDom = document.querySelector('.filters');
		const filters = new Filters(filtersDom);

		// Search
		const searchDom = document.querySelector('.search');
		const search = new Search(searchDom);

		// Timemachine
		const timeMachineDom = document.querySelector('.timemachine');
		const timeMachine = new TimeMachine(timeMachineDom);

		// Wizard
		const wizardDom = document.querySelector('.wizard');
		const wizard = new Wizard(wizardDom);

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

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;
		this.viewer.update(t);
		this.viewer.render();
		this.currentPage?.update();
	}
}