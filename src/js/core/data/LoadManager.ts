import { getSolarStaticData } from "../Utils";

const staticURL = "./assets/data/";
const baseURL = "./assets/data/";

const PLANETS = "planet_elems.json";
const DWARF_PLANETS = "dwarf_planet_elems.json";

export interface RubinData {
    // planets:
}

class LoadManagerClass {
    private mgr = {
        isLoading: false,
        data: {
            planets: null,
            dwarf_planets: null,
            solar_items: null,
            sample: null
        }
    }

    get data() {
        return this.mgr.data;
    }

    private get coreDataAvailable() {
        return this.mgr.data.planets && this.mgr.data.dwarf_planets && this.mgr.data.solar_items;
    }

    private loadData(id:string, url:string, onLoaded:Function) {
        console.log(`Loading ${id} - ${url} ...`);
        fetch(url).then(result => {
            result.json().then(json => {
                this.mgr.data[id] = json;
                onLoaded();
            })
        });
    }

    loadCore(onLoaded:Function) {
        if (this.mgr.isLoading) return console.warn('Loading process already initiated!');
        this.mgr.isLoading = true;

        const onL = () => {
            if (this.coreDataAvailable) onLoaded();
        }

        this.loadData('planets', `${staticURL}${PLANETS}`, onL);
        this.loadData('dwarf_planets', `${staticURL}${DWARF_PLANETS}`, onL);
        this.loadData('solar_items', `${baseURL}solar-items.json`, onL);
    }

    loadSample(profile:string, onLoaded:Function) {
        getSolarStaticData(profile).then((json) => {
            this.mgr.data.sample = json;
            onLoaded(json);
			// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
		});
    }
}

export const LoadManager = new LoadManagerClass();
