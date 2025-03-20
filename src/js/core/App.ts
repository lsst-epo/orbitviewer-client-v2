import { ThreeDOMLayer } from "@fils/gl-dom";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { Timer } from "@fils/ani";
import { UI } from "@fils/ui";
import { VISUAL_SETTINGS } from "./Globals";
import { getSolarSystemElements } from "./data/QueryManager";
import { downloadJSON, getSolarStaticData } from "./Utils";
import { Terminal } from "../debug/Terminal";

export class App {
	gl:ThreeDOMLayer;
	viewer:OrbitViewer;
	clock:Timer;

	terminal:Terminal;

	constructor() {
		this.gl = new ThreeDOMLayer(document.querySelector('.view'));
		this.gl.renderer.setClearColor(0x000000, 1);
		this.viewer = new OrbitViewer(this.gl);
		
		this.terminal = new Terminal(document.querySelector('.terminal'));
		
		this.start();

		console.log('%cSite by Fil Studio', "color:white;font-family:system-ui;font-size:1rem;font-weight:bold");
	}

	start() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.update();
		}

		requestAnimationFrame(animate);

		this.clock = new Timer(true);

		this.addGUI();
	}

	addGUI() {
		const gui = new UI({
			title: 'Vera Rubin Observatory',
			icon: '🔭'
		});

		const q = gui.addGroup({
			title: '⚡️ Live Data Queries'
		});
		q.add(VISUAL_SETTINGS, 'current', {
			title: 'resolution',
			options: {
				'low': 'low',
				'medium': 'medium',
				'high': 'high',
				'ultra': 'ultra'
			}
		});

		const logItems = (nItems:number, time:number) => {
			const clss = time < 5 ? 'green' : 'red';
			this.terminal.log(`Fectched ${nItems} items. Elapsed time: <span class="${clss}">${time} seconds</span>.`);
		}

		q.addButton('Fetch Hasura', () => {
			const t = Date.now();
			this.terminal.log(`Fetching data for <span class="blue">${VISUAL_SETTINGS.current}</span>...`);
			getSolarSystemElements().then((json) => {
				logItems(json.mpcorb.length, (Date.now() - t) / 1000);
				console.log(json);
				// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
			});
		});
		q.addButton('Fetch Static', () => {
			const t = Date.now();
			this.terminal.log(`Fetching static data for <span class="blue">${VISUAL_SETTINGS.current}</span>...`);
			getSolarStaticData(VISUAL_SETTINGS.current).then((json) => {
				logItems(json.mpcorb.length, (Date.now() - t) / 1000);
				console.log(json);
				// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
			});
		});

		this.terminal.log('<span class="green">Ready.</span> Use the GUI to test queries.');
	}

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;
		this.viewer.update(t);
		this.viewer.render();
	}
}