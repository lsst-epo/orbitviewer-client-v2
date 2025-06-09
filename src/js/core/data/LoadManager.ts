import { Color } from "three";
import { getSolarStaticData } from "../Utils";
import { getCategories, getSolarItemsInfo } from "./CraftManager";
import { VISUAL_SETTINGS } from "../Globals";

const staticURL = "/assets/data/";
const baseURL = "/assets/data/";

const PLANETS = "planet_elems.json";
const DWARF_PLANETS = "dwarf_planet_elems.json";

export interface RubinData {
    // planets:
}

class LoadManagerClass {
    private sampleLoaded:boolean = false;

    private mgr = {
        isLoading: false,
        data: {
            planets: null,
            dwarf_planets: null,
            solar_items: null,
            sample: null
        },
        craftData: {
            pages: {
                landing: null,
                about: null,
                objects: null,
                how_to_use: null
            },
            categories: null,
            solar_items: null
        }
    }

    get data() {
        return this.mgr.data;
    }

    get craftData() {
        return this.mgr.craftData;
    }

    private get coreDataAvailable() {
        return this.mgr.data.planets && this.mgr.data.dwarf_planets && this.mgr.data.solar_items;
    }

    private get coreCraftDataAvailable() {
        const craft = this.mgr.craftData;
        return craft.categories && craft.solar_items;// && craft.pages.landing;
    }

    public get coreLoaded():boolean {
        return this.coreDataAvailable && this.coreCraftDataAvailable && this.sampleLoaded;
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

    private createCategoryColorMap(cnt) {
        cnt.data.categories.forEach(entry => {
            entry.threeColor = new Color(entry.mainColor);
            // console.log(entry);
        })
    }

    private loadCraft(id:string, onLoaded:Function) {
        const onL = cnt => {
            if(cnt.errors) {
                console.warn('Error. Retrying...');
                cnt.errors.forEach(error => {
                    console.log(error.message)
                });
                this.loadCraft(id, onLoaded);
            }
            //@ts-ignore
            // console.log(cnt.data);
            if(id === 'categories') {
                this.createCategoryColorMap(cnt);
                this.mgr.craftData[id] = cnt.data.categories;
            } else {
               this.mgr.craftData[id] = cnt.data.entries; 
            }
            //@ts-ignore
            // this.mgr.craftData[id] = cnt.data;
            
            onLoaded();
        }

        if(id === 'categories') {
            getCategories().then(cnt => {
                onL(cnt);
            }).catch(e => {
                console.warn('Error. Retrying...');
                console.log(e);
                this.loadCraft(id, onLoaded);
            });
        } else if(id === 'solar_items') {
            getSolarItemsInfo().then(cnt => {
                onL(cnt);
            }).catch(e => {
                console.warn('Error. Retrying...');
                console.log(e);
                this.loadCraft(id, onLoaded);
            });
        }
    }

    loadCore(onLoaded:Function) {
        if (this.mgr.isLoading) return console.warn('Loading process already initiated!');
        this.mgr.isLoading = true;

        const onL = () => {
            if (this.coreLoaded) onLoaded();
        }

        this.loadData('planets', `${staticURL}${PLANETS}`, onL);
        this.loadData('dwarf_planets', `${staticURL}${DWARF_PLANETS}`, onL);
        this.loadData('solar_items', `${baseURL}solar-items.json`, onL);

        this.loadCraft('categories', onL);
        this.loadCraft('solar_items', onL);

        this.loadSample(VISUAL_SETTINGS.current, onL);
    }

    loadSample(profile:string, onLoaded:Function) {
        getSolarStaticData(profile, false).then((json) => {
            this.sampleLoaded = true;
            this.mgr.data.sample = json;
            onLoaded(json);
			// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
		});
    }
}

export const LoadManager = new LoadManagerClass();
