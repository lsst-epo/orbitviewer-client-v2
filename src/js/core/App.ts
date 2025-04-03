import { Timer } from "@fils/ani";
import { ThreeDOMLayer } from "@fils/gl-dom";
import { UI } from "@fils/ui";
import { Clock } from "three";
import { Terminal } from "../debug/Terminal";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { initShaders } from "../gfx/Shaders";
import { fetchSolarElements, getSolarSystemElements } from "./data/QueryManager";
import { CLOCK_SETTINGS, GPU_SIM_SIZES, VISUAL_SETTINGS } from "./Globals";
import { SolarClock } from "./solar/SolarClock";
import { getSimData } from "./solar/SolarData";
import { getSolarStaticData, SolarItems } from "./Utils";

import Stats from "three/examples/jsm/libs/stats.module.js";
import { getRandomElementsArray } from "./solar/SolarUtils";

export const solarClock = new SolarClock(new Clock());

export class App {
	gl:ThreeDOMLayer;
	viewer:OrbitViewer;
	clock:Timer;

	terminal:Terminal;

	protected testRunning:boolean = false;
	protected deltas:number[] = [];
	protected testStarted:number = 0;

	constructor() {
		initShaders();

		this.gl = new ThreeDOMLayer(document.querySelector('.view'), {
			antialias: true,
			alpha: true
		});
		this.gl.renderer.setClearColor(0x000000, 1);
		this.viewer = new OrbitViewer(this.gl);

		// this.profiler = new PerformanceProfiler(this.viewer);
		
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
			requestAnimationFrame(animate);
			stats.begin();
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
			title: '⚡️ Live Data Queries',
			folded: true
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

		const g1 = gui.addGroup({
			title: '📈 Performance Profiler'
		});

		g1.add(VISUAL_SETTINGS, 'current', {
			title: 'resolution',
			options: {
				'low': 'low',
				'medium': 'medium',
				'high': 'high',
				'ultra': 'ultra',
				'ultra2': 'ultra2',
				'ultra3': 'ultra3'
			}
		});

		let tid = null;

		g1.addButton('Run Test', () => {
			if(this.testRunning) return;
			clearInterval(tid);
			const v = VISUAL_SETTINGS.current;
			const g = GPU_SIM_SIZES[v];
			const len = g.width * g.height;
			this.terminal.log(`Generating <span class="blue">${len.toLocaleString()}</span> test items...`);
			tid = window.setTimeout(() => {
				const data = getRandomElementsArray(len);
				this.viewer.setData(getSimData(data));
				this.viewer.controls.enabled = false;
				tid = window.setTimeout(() => {
					this.deltas = [];
					this.testStarted = performance.now();
					this.testRunning = true;
					this.terminal.log(`Testing...`);
				}, 1000);
			}, 100);
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

		g2.addButton('Reset', () => {
			CLOCK_SETTINGS.speed = 0;
			g2.refresh();
		})

		const g3 = gui.addGroup({
			title: '🖥️ Display Options'
		})

		g3.add(this.terminal, 'visible', {
			title: 'Show Terminal'
		});

		g3.add(this.viewer.particles, 'renderMode', {
			options: {
				'instanced mesh': "instanced",
				'points': "points"
			}
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

		this.viewer.update(t, d);
		this.viewer.render();

		if(this.testRunning) {
			this.deltas.push(this.clock.currentDelta);
			if(performance.now() - this.testStarted >= 5000) {
				let dt = 0;
				// console.log(this.deltas);
				for(const d of this.deltas) {
					dt += d / this.deltas.length;
				}
				// dt *= 1000;
				this.terminal.log(`Ended test with an average <span class="blue">${dt*1000}ms</span> & <span class="blue">${1/dt}fps</span>.`);
				this.terminal.log(`<span class="green">Done!</span> ✨`);
				this.testRunning = false;
				this.viewer.controls.enabled = true;
			}
		}
	}
}