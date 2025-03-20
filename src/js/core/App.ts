import { ThreeDOMLayer } from "@fils/gl-dom";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { Timer } from "@fils/ani";
import { UI } from "@fils/ui";
import { CLOCK_SETTINGS, VISUAL_SETTINGS } from "./Globals";
import { fetchSolarElements, getSolarSystemElements } from "./data/QueryManager";
import { downloadJSON, getSolarStaticData, SolarItems } from "./Utils";
import { Terminal } from "../debug/Terminal";
import { initShaders } from "../gfx/Shaders";
import { SolarClock } from "./solar/SolarClock";
import { Clock } from "three";
import { getSimData } from "./solar/SolarData";

import Stats from "three/examples/jsm/libs/stats.module.js";

export const solarClock = new SolarClock(new Clock());

export class App {
	gl:ThreeDOMLayer;
	viewer:OrbitViewer;
	clock:Timer;

	terminal:Terminal;

	constructor() {
		initShaders();

		this.gl = new ThreeDOMLayer(document.querySelector('.view'));
		this.gl.renderer.setClearColor(0x000000, 1);
		this.viewer = new OrbitViewer(this.gl);
		
		this.terminal = new Terminal(document.querySelector('.terminal'));
		
		this.start();

		console.log('%cSite by Fil Studio', "color:white;font-family:system-ui;font-size:1rem;font-weight:bold");
	}

	start() {
		const stats = new Stats();
		document.body.appendChild(stats.dom);
		stats.dom.style.top = 'unset';
		stats.dom.style.bottom = '0';

		const animate = () => {
			stats.begin();
			requestAnimationFrame(animate);
			this.update();
			stats.end();
		}

		requestAnimationFrame(animate);

		this.clock = new Timer(true);

		solarClock.start();

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

		const setData = (json) => {
			const data = getSimData(json.mpcorb);
			this.viewer.setData(data);
		}

		q.addButton('Fetch Hasura', () => {
			const t = Date.now();
			this.terminal.log(`Fetching data for <span class="blue">${VISUAL_SETTINGS.current}</span>...`);
			getSolarSystemElements().then((json) => {
				logItems(json.mpcorb.length, (Date.now() - t) / 1000);
				console.log(json);
				setData(json);
				// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
			});
		});
		q.addButton('Fetch Static', () => {
			const t = Date.now();
			this.terminal.log(`Fetching static data for <span class="blue">${VISUAL_SETTINGS.current}</span>...`);
			getSolarStaticData(VISUAL_SETTINGS.current).then((json) => {
				logItems(json.mpcorb.length, (Date.now() - t) / 1000);
				console.log(json);
				setData(json);
				// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
			});
		});

		const solarIds = {
			current: 'all',
			options: ['all'],
			map: {},
		}

		for(const item of SolarItems) {
			solarIds.options.push(item.elementID);
			solarIds.map[item.elementID] = item;
		}

		q.addSpacer();

		const options = {};
		solarIds.options.forEach((o:string) => {
			options[o] = o;
		});

		// console.log(solarIds);

		q.add(solarIds, 'current', {
			title: 'Solar Items',
			options 
		});
		q.addButton('Fetch Solar Item(s)', () => {
			const t = Date.now();
			this.terminal.log(`Fetching <span class="blue">${solarIds.current}</span> Solar Items...`);
			if(solarIds.current === 'all') {
				fetchSolarElements(SolarItems).then( values => {
					console.log(values);
					logItems(values.length, (Date.now() - t) / 1000);
				});
			} else {
				fetchSolarElements([solarIds.map[solarIds.current]]).then( values => {
					console.log(values);
					logItems(values.length, (Date.now() - t) / 1000);
				});
			}
		});

		const g2 = gui.addGroup({
			title: '⏱️ Solar Clock'
		})

		g2.add(CLOCK_SETTINGS, 'speed', {
			title: 'Sec Per Hour',
			min: -1000,
			max: 1000,
			step: 1
		});

		this.terminal.log('<span class="green">Ready.</span> Use the GUI to test queries.');
	}

	clockChanged():boolean {                
        return (CLOCK_SETTINGS.speed !== solarClock.secsPerHour);
    }

	update() {
		this.clock.tick();
		const t = this.clock.currentTime;

		if(this.clockChanged()) solarClock.secsPerHour = CLOCK_SETTINGS.speed;
		const d = solarClock.update();
		// console.log(d);

		this.viewer.update(t, d);
		this.viewer.render();
	}
}