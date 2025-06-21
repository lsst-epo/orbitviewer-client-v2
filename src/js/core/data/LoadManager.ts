import { Color } from "three";
import { USE_V2 } from "../App";
import { GLOBALS, VISUAL_SETTINGS } from "../Globals";
import { getSolarStaticData } from "../Utils";
import { CategoryNames, CSSCategoryMap, TypeCategoryMap } from "./Categories";
import { getCategories, getSolarItemsInfo } from "./CraftManager";
import { getA, getClassificationRanges } from "./QueryManager";

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
            rubinCount: 0,
            planets: null,
            dwarf_planets: null,
            // solar_items: null,
            sample: null
        },
        craftData: {
            pages: {
                landing: null,
                about: null,
                objects: null,
                solar_items: null,
                how_to_use: null
            },
            categories: null,
            solar_items: null
        },
        hasuraData: {
            classification_ranges: null
        }
    }

    get data() {
        return this.mgr.data;
    }

    get craftData() {
        return this.mgr.craftData;
    }

    get hasuraData() {
        return this.mgr.hasuraData;
    }

    private get coreDataAvailable() {
        return this.mgr.data.planets && this.mgr.data.dwarf_planets;
    }

    private get hasuraDataAvailable() {
        return true;//this.mgr.hasuraData.classification_ranges;
    }

    private get coreCraftDataAvailable() {
        const craft = this.mgr.craftData;
        // return craft.categories && craft.solar_items && this.mgr.craftData.solar_items;// && craft.pages.landing;
        return craft.solar_items && this.mgr.craftData.solar_items;// && craft.pages.landing;
    }

    public get coreLoaded():boolean {
        return this.coreDataAvailable && this.coreCraftDataAvailable && this.sampleLoaded && this.hasuraDataAvailable;
    }

    private loadData(id:string, url:string, onLoaded:Function) {
        console.log(`Loading ${id} - ${url} ...`);
        fetch(url).then(result => {
            result.json().then(json => {
                this.mgr.data[id] = json;
                // console.log(json);
                onLoaded();
            })
        });
    }

    private createCategoryColorMap(cnt) {
        const root = document.documentElement;
        cnt.data.categories.forEach(entry => {
            entry.threeColor = new Color(entry.mainColor);
            root.style.setProperty(`--color-${CSSCategoryMap[parseInt(entry.objectTypeCode)]}`, entry.mainColor);
            // Also replace text
            CategoryNames[GLOBALS.lang][
                TypeCategoryMap[parseInt(entry.objectTypeCode)]
            ] = entry.title;
            // console.log(`--color-${CSSCategoryMap[parseInt(entry.objectTypeCode)]}`, entry.mainColor);
            // console.log(entry);
        })
    }

    private loadCraft(id:string, onLoaded:Function) {
        const onL = cnt => {
            if(cnt.errors) {
                console.warn('Error.');
                cnt.errors.forEach(error => {
                    console.log(error.message)
                });
                // this.loadCraft(id, onLoaded);
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

            console.log(cnt);
            
            onLoaded();
        }

        if(id === 'categories') {
            getCategories().then(cnt => {
                onL(cnt);
            }).catch(e => {
                console.warn('Error');
                console.log(e);
                // this.loadCraft(id, onLoaded);
            });
        } else if(id === 'solar_items') {
            getSolarItemsInfo().then(cnt => {
                onL(cnt);
            }).catch(e => {
                console.warn('Error');
                console.log(e);
                // this.loadCraft(id, onLoaded);
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
        // this.loadData('solar_items', `${baseURL}solar-items.json`, onL);

        this.loadCraft('categories', onL);
        this.loadCraft('solar_items', onL);

        this.loadSample(VISUAL_SETTINGS.current, onL);

        getClassificationRanges().then(json => {
            this.mgr.hasuraData.classification_ranges = json.classification_ranges_v2;
            console.log(this.mgr.hasuraData.classification_ranges);
            onL();
        });

        /* getE().then(json => {
            // this.mgr.hasuraData.classification_ranges = json.classification_ranges_v2;
            // console.log(this.mgr.hasuraData.classification_ranges);
            // onL();
            console.log(json);
        }); */
    }

    loadSample(profile:string, onLoaded:Function) {
        getSolarStaticData(profile, USE_V2).then((json) => {
            this.sampleLoaded = true;
            this.mgr.data.rubinCount = json.rubin_discoveries_count;
            this.mgr.data.sample = json.mpc_orbits;
            onLoaded(json.mpc_orbits);
            // console.log(json);
			// downloadJSON(json, `data-${VISUAL_SETTINGS.current}.json`, true);
		});
    }

    getSolarItemInfo(name:string):Object {
        for(const el of this.craftData.solar_items) {
            if(el.elementID === name) return el;
        }

        return null;
    }
}

export const LoadManager = new LoadManagerClass();
