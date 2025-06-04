import { Timer } from "@fils/ani";
import { ThreeDOMLayer } from "@fils/gl-dom";
import { UI } from "@fils/ui";
import { Clock } from "three";
import { Terminal } from "../debug/Terminal";
import { OrbitViewer } from "../gfx/OrbitViewer";
import { initShaders } from "../gfx/Shaders";
import { fetchSolarElements, getSolarSystemElements } from "./data/QueryManager";
import { CLOCK_SETTINGS, GLOBALS, GPU_SIM_SIZES, VISUAL_SETTINGS } from "./Globals";
import { SolarClock } from "./solar/SolarClock";
import { getSimData } from "./solar/SolarData";
import { getSolarStaticData, SolarItems } from "./Utils";

import Stats from "three/examples/jsm/libs/stats.module.js";
import { getRandomElementsArray } from "./solar/SolarUtils";
import { LoadManager } from "./data/LoadManager";
import { SearchEngine } from "./data/SearchEngine";
import { PlanetId } from "../gfx/solar/Planet";
import { getAbout, getCategories, getCustomizedOrbits, getGlobals, getGuidedExperiences, getGuidedExperiencesTours, getLanding, getOrbitViewer, getSolarItemsInfo } from "./data/CraftManager";
import { EarthClouds } from "../gfx/planets/EarthClouds";

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
			alpha: false
		});
		this.gl.renderer.setClearColor(0x000000, 1);
		this.gl.renderer.setPixelRatio(devicePixelRatio || 1);
		this.viewer = new OrbitViewer(this.gl);
		
		GLOBALS.clouds = new EarthClouds();

		// this.profiler = new PerformanceProfiler(this.viewer);

		this.terminal = new Terminal(document.querySelector('.terminal'));
		this.terminal.visible = false;

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

		GLOBALS.clock = this.clock;
		GLOBALS.solarClock = solarClock;

		// this.addGUI();
    this.terminal.log(`Loading core data...`);
    const t = Date.now();
    LoadManager.loadCore(() => {
    	LoadManager.loadSample(VISUAL_SETTINGS.current, json => {
    	  this.logItems(json.length, (Date.now() - t) / 1000);
    	  // console.log(json);
    	  const data = getSimData(json);
    	  this.viewer.setData(data);
				this.viewer.createPlanets(LoadManager.data.planets);
				this.viewer.hidePaths();
        this.addGUI();
        console.log(LoadManager.data);
      });
    })
	}

	logItems (nItems:number, time:number) {
		const clss = time < 5 ? 'green' : 'red';
		this.terminal.log(`Fectched ${nItems} items. Elapsed time: <span class="${clss}">${time} seconds</span>.`);
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
				'ultra': 'ultra',
				'ultra2': 'ultra2'
			}
		});

		const logItems = (nItems:number, time:number) => {
      this.logItems(nItems, time);
		}

		const setData = (json) => {
			const data = getSimData(json);
			this.viewer.setData(data);
		}

		// q.addButton('Fetch Hasura', () => {
		// 	const t = Date.now();
		// 	this.terminal.log(`Fetching data for <span class="blue">${VISUAL_SETTINGS.current}</span>...`);
		// 	getSolarSystemElements().then((json) => {
		// 		logItems(json.length, (Date.now() - t) / 1000);
		// 		// console.log(json);
		// 		setData(json);
		// 		// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
		// 	});
		// });
		q.addButton('Fetch Static', () => {
			const t = Date.now();
			this.terminal.log(`Fetching static data for <span class="blue">${VISUAL_SETTINGS.current}</span>...`);
            LoadManager.loadSample(VISUAL_SETTINGS.current, (json) => {
                logItems(json.length, (Date.now() - t) / 1000);
                console.log(LoadManager.data);
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
					console.log(JSON.stringify(values));
					logItems(values.length, (Date.now() - t) / 1000);
				});
			} else {
				fetchSolarElements([solarIds.map[solarIds.current]]).then( values => {
					console.log(values);
					logItems(values.length, (Date.now() - t) / 1000);
				});
			}
		});

		const cms = gui.addGroup({
			title: '☁️ Craft CMS Queries',
			folded: true
		});

		cms.addButton('Fetch Categories', () => {
			const t = Date.now();
			this.terminal.log(`Fetching categories...`);
			getCategories().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.categories.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		});

		cms.addButton('Fetch About', () => {
			const t = Date.now();
			this.terminal.log(`Fetching about...`);
			getAbout().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.entries.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		})

		cms.addButton('Fetch Globals', () => {
			const t = Date.now();
			this.terminal.log(`Fetching globals...`);
			getGlobals().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.globalSets.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		})

		cms.addButton('Fetch Customized Orbits', () => {
			const t = Date.now();
			this.terminal.log(`Fetching customized orbits...`);
			getCustomizedOrbits().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.entries.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		})

		cms.addButton('Fetch Guided experiences', () => {
			const t = Date.now();
			this.terminal.log(`Fetching guided experiences...`);
			getGuidedExperiences().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.entries.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		})

		cms.addButton('Fetch Guided Tours', () => {
			const t = Date.now();
			this.terminal.log(`Fetching guided tours...`);
			getGuidedExperiencesTours().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.entries.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		})

		cms.addButton('Fetch Landing', () => {
			const t = Date.now();
			this.terminal.log(`Fetching Landing...`);
			getLanding().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.entries.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		})

		cms.addButton('Fetch Solar Items Info', () => {
			const t = Date.now();
			this.terminal.log(`Fetching Solar Items Info...`);
			getSolarItemsInfo().then(cnt => {
				//@ts-ignore
				console.log(cnt.data);
				//@ts-ignore
				logItems(cnt.data.entries.length, (Date.now() - t) / 1000);
			}).catch(e => {
				console.warn('Error');
				console.log(e);
			});
		})

		const g1 = gui.addGroup({
			title: '📈 Performance Profiler',
			folded: true
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
			title: 'Hours per Sec',
			min: -1000,
			max: 1000,
			step: .01
		});

		g2.addButton('Reset', () => {
			CLOCK_SETTINGS.speed = 0;
			g2.refresh();
		})

		const query = {
			prompt: ""
		}

		const s = gui.addGroup({
			title: '🔎 Search',
			folded: true
		})
		s.add(query, "prompt");
		s.addButton('Search', () => {
      if (query.prompt.length < 3) return alert("Write minimum 3 characters");
      this.terminal.log(`Searching for <span class="green">${query.prompt}</span>...`)
      const t = performance.now();
      const items = SearchEngine.search(query.prompt);
      const dt = (performance.now() - t) * .001;
      logItems(items.length, dt);
      const res = [];
      for(const i of items) {
          res.push(i.fulldesignation);
      }
      this.terminal.log(`Found: <span class="green">${res.join(',')}</span>...`)
      console.log(items);
		})

		const g3 = gui.addGroup({
			title: '🖥️ Display Options',
			// folded: true
		})

		g3.add(this.viewer, 'useVFX');

		const planetView = {
			selected: 'sun',
			paths: false
		}

		g3.add(planetView, 'paths').on('change', () => {
			if (planetView.paths) this.viewer.showPaths();
			else this.viewer.hidePaths();
		});

		const plOpts = {
			'none': 'none',
			'sun': 'sun',
			'mercury': 'mercury',
    	'venus': 'venus',
      'earth': 'earth',
      'mars': 'mars',
      'jupiter': 'jupiter',
      'saturn': 'saturn',
      'uranus': 'uranus',
      'neptune': 'neptune'
		};

		const follow = () => {
			if (planetView.selected === 'none') this.viewer.releaseCameraTarget();
			else if (planetView.selected === 'sun') this.viewer.followSun();
			else this.viewer.followPlanet(planetView.selected as PlanetId);
		}

		follow();

		g3.add(planetView, 'selected', {
			options: plOpts,
		}).on('change', () => {
			follow();
		});

		g3.add(this.terminal, 'visible', {
			title: 'Show Terminal'
		});

		// g3.add(this.viewer.particles, 'renderMode', {
		// 	options: {
		// 		'instanced mesh': "instanced",
		// 		'points': "points"
		// 	}
		// });

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

		GLOBALS.clouds.render(this.gl.renderer);

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
