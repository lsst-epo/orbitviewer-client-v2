import { $ } from "@fils/utils";
import { CategoryNames, TypeCategoryMap } from "../core/data/Categories";
import { LoadManager } from "../core/data/LoadManager";
import { SearchEngine } from "../core/data/SearchEngine";
import { GLOBALS } from "../core/Globals";
import { OrbitElements, SolarCategory } from "../core/solar/SolarSystem";
import { mapOrbitElementsV2, OrbitDataElementsV2 } from "../core/solar/SolarUtils";
import { SolarElement } from "../gfx/solar/SolarElement";
import Layer from "./Layer";
import { searchCloud } from "../core/data/QueryManager";

const USE_WORKER = true;

class Search extends Layer {
    dom: HTMLElement;
    closeButton: HTMLElement;
    sInput:HTMLInputElement;
    recommendH:HTMLElement;
    list:HTMLElement;
    recommended:HTMLUListElement[] = [];
    recommendedAll:NodeListOf<HTMLUListElement>;
    alert:HTMLElement;
    errorMessage:string;
    errorMessageCloud:string;

    protected tid;

    notSearching:boolean = false;

    localSearch:HTMLElement;
    localSpinner:HTMLElement;
    
    cloudSearch:HTMLElement;
    spinner:HTMLElement;

    #cloudSearching:boolean = false;
    
    constructor(dom) {
        super(dom, {
            openClass: 'search--open',
            closeClass: 'search--close',
            closingClasses: ['out'],
            animationDuration: 500
        });
        
        this.dom = dom;

        this.closeButton = dom.querySelector('.button_close');

        this.sInput = dom.querySelector('input#search');

        this.recommendH = dom.querySelector('h3.listitem-label');
        this.list = dom.querySelector('ul.listitem-list');
        this.recommendedAll = this.list.querySelectorAll('li.listitem-item');

        this.alert = dom.querySelector('.banner');
        this.errorMessage = this.alert.textContent;
        this.errorMessageCloud = dom.getAttribute('data-not-found');

        this.localSearch = $('.local_search', dom);
        this.localSpinner = $('.spinner_wrap', dom);
        
        this.cloudSearch = $('.cloud_search', dom);
        this.spinner = $('.spinner', this.cloudSearch);

        const btn = $('button', this.cloudSearch) as HTMLButtonElement;
        btn.onclick = () => {
            btn.disabled = true;
            this.spinner.setAttribute('aria-hidden', 'false');
            this.alert.setAttribute('aria-hidden', 'true');
            this.#cloudSearching = true;

            const query = this.sInput.value;

            searchCloud(query).then(res=> {
                if(!this.#cloudSearching) return;
                this.updateCloudResults(res.data, query);
            }).catch(error => {
                this.updateCloudResults(error, query);
            });
        }

        this.start();

        SearchEngine.searchCallback = data => {
            if(this.notSearching) return;
            this.localSpinner.setAttribute('aria-hidden', 'true');
            const query = data.query;
            // console.log(query, this.sInput.value.toLowerCase())
            if(query !== this.sInput.value.toLowerCase()) return;
            const items = data.results;
            this.sInput.disabled = false;
            // console.log(items);
            if(!items.length) {
                this.showNotFound(this.sInput.value);
                return;
            }
            this.hideNotFound();
            for(let i=0; i<Math.min(100, items.length); i++) {
                this.addItemToList(items[i]);
            }
        }
    }

    updateCloudResults(data, query:string) {
        if(!this.#cloudSearching) return;
        this.#cloudSearching = false;
        if(data.mpc_orbits && data.mpc_orbits.length) {
            this.cloudSearch.setAttribute('aria-hidden', 'true');
            this.localSearch.setAttribute('aria-hidden', 'false');
            this.showCloudList(data.mpc_orbits);
        } else {
            this.alert.textContent = this.errorMessageCloud.replace('{{query}}', query);
            // this.alert.setAttribute('aria-hidden', 'false');
            // // this.cloudSearch.setAttribute('aria-hidden', 'true');
            // this.spinner.setAttribute('aria-hidden', 'true');
            // const btn = $('button', this.cloudSearch) as HTMLButtonElement;
            // btn.disabled = false;
        }

        // this.cloudSearch.setAttribute('aria-hidden', 'true');
        this.spinner.setAttribute('aria-hidden', 'true');
        const btn = $('button', this.cloudSearch) as HTMLButtonElement;
        btn.disabled = false;
    }

    protected showCloudList(results) {
        console.log(results);
        for(const item of results) {
            this.addItemToList(item);
        }
    }

    protected async query(query:string) {
        const res = SearchEngine.searchWorker(query).then(res => {
            // this.sInput.disabled = false;
            // console.log(res);
        }).catch(error => {});
    }

    open(): Promise<void> {
        this.hideNotFound();
        this.updateRecommended();
        this.showRecommended();
        this.notSearching = true;
        GLOBALS.cloudSearched = null;
        return super.open().then(r => {
            this.sInput.disabled = false;
            this.sInput.focus();
            this.sInput.oninput = () => {
                clearTimeout(this.tid);
                // console.log(this.sInput.value);
                this.localSpinner.setAttribute('aria-hidden', 'true');
                this.hideNotFound();
                if(!this.sInput.value.length) {
                    this.hideNotFound();
                    this.showRecommended();
                    this.localSpinner.setAttribute('aria-hidden', 'true');
                    this.notSearching = true;
                    return;
                };
                this.hideRecommended();
                this.tid = setTimeout(() => {
                    // this.sInput.disabled = true;
                    this.notSearching = false;
                    this.localSpinner.setAttribute('aria-hidden', 'false');
                    // this.query(this.sInput.value);
                    SearchEngine.search(this.sInput.value, true);
                }, 500);
                // const items = SearchEngine.search(this.sInput.value, USE_WORKER);
                /* if(!USE_WORKER) {
                    if(!items.length) {
                        this.showNotFound(this.sInput.value);
                        return;
                    }
                    this.hideNotFound();
                    for(let i=0; i<Math.min(100, items.length); i++) {
                        this.addItemToList(items[i]);
                    }
                } else {
                    this.notSearching = false;
                    this.hideNotFound();
                } */
            }
        })
    }

    close(): Promise<void> {
        return super.close().then(r => {
            this.sInput.value = "";
            this.showRecommended();
            this.#cloudSearching = false;
        })
    }

    updateRecommended() {
        const sample = LoadManager.data.sample;
        const len = sample.length;
        this.recommended = [];
        this.recommendedAll.forEach(el => {
            const id = el.getAttribute('item-id');
            const cat = el.getAttribute('item-category-slug');
            let found = false;
            if(cat === 'planets-moons') {
                const sels = GLOBALS.viewer.solarElements;
                for(const sel of sels) {
                    if(sel.slug === id) {
                        found = sel.enabled;
                        break;
                    }
                }
            };
            for(let i=0;i<len;i++) {
                const sel:OrbitDataElementsV2 = sample[i];
                if(sel.mpcdesignation === id || sel.fulldesignation === id) {
                    found = !GLOBALS.viewer.particles.filtered[i];
                    break;
                }
            }

            if(found) this.recommended.push(el);
        });
    }

    showRecommended() {
        this.recommendH.setAttribute('aria-hidden', 'false');
        this.list.replaceChildren();
        this.recommended.forEach(node => this.list.appendChild(node));
        this.cloudSearch.setAttribute('aria-hidden', 'true');
    }

    hideRecommended() {
        this.recommendH.setAttribute('aria-hidden', 'true');
        this.list.replaceChildren();
    }

    showNotFound(query:string) {
        this.alert.textContent = this.errorMessage.replace('{{query}}', query);
        this.alert.setAttribute('aria-hidden', 'false');
        this.localSearch.setAttribute('aria-hidden', 'true');
        this.cloudSearch.setAttribute('aria-hidden', 'false');
    }

    hideNotFound() {
        this.alert.setAttribute('aria-hidden', 'true');
        this.localSearch.setAttribute('aria-hidden', 'false');
        this.cloudSearch.setAttribute('aria-hidden', 'true');
        this.spinner.setAttribute('aria-hidden', 'true');
    }

    start() {
        // Close Button
		this.closeButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.close();
		});
        
    }

    getSolarItemById(id:string) {
        for(const item of LoadManager.craftData.solar_items) {
            if(item.elementID === id) return item;
        }

        return null;
    }

    getCategoryName(cat:SolarCategory) {
        // console.log(cat);
        return CategoryNames[GLOBALS.lang][cat];
    }

    private updateNodeCategory(node:HTMLElement, catSlug:SolarCategory) {
        const cat = node.querySelector("span.object_type");
        if(this.getCategoryName(catSlug) === undefined) {
            cat.textContent = `Uncategorized`;
        } else cat.textContent = `${this.getCategoryName(catSlug)}`;
        cat.classList.add(catSlug);
    }

    private mapNodeDataWithSI(node:HTMLElement, el, sel:SolarElement, addDes:boolean=false) {
        const name = addDes ? `${el.title} (${sel.data.fulldesignation})` : el.title;
        node.querySelector("span.name").textContent = name;
        // console.log(sel.category);
        const catSlug = sel.category as SolarCategory;
        this.updateNodeCategory(node, catSlug);
        const a = node.querySelector('a');
        a.href = "javascript:void(0);";
        a.onclick = () => {
            GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/solar-items/${sel.slug}/`);
        }
    }

    private mapNodeDataWithOE(node:HTMLElement, mel:OrbitDataElementsV2) {
        node.querySelector("span.name").textContent = `${mel.fulldesignation}`;
        const catSlug = TypeCategoryMap[mel.object_type[0]];
        this.updateNodeCategory(node, catSlug);
        const a = node.querySelector('a');
        a.href = "javascript:void(0);";
        a.onclick = () => {
            GLOBALS.cloudSearched = mel;
            GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/object/`, `?id=${mel.mpcdesignation}`);
        }
    }

    addItemToList(item:OrbitElements|OrbitDataElementsV2) {
        const node = this.recommendedAll[0].cloneNode(true) as HTMLElement;
        node.setAttribute('priority', '2');
        node.querySelector("span.object_type").className = "chip object_type";
        if(item.id) {
            // we have a planet
            const planet = item as OrbitElements;
            const sel = GLOBALS.viewer.getSolarElementBySlug(planet.id);
            const el = this.getSolarItemById(planet.id);
            if(el === null) return;
            this.mapNodeDataWithSI(node, el, sel);
            node.setAttribute('priority', '0');
        } else {
            // we have an item from sample
            const mel = mapOrbitElementsV2(item as OrbitDataElementsV2);
            const el = this.getSolarItemById(mel.id);
            if(el !== null) {
                // console.log('We have a solar item', mel.id, el.elementID);
                const sel = GLOBALS.viewer.getSolarElementByName(mel.id);
                // console.log(sel);
                this.mapNodeDataWithSI(node, el, sel, true);
                node.setAttribute('priority', '1');
            } else {
                // to-do
                this.mapNodeDataWithOE(node, item as OrbitDataElementsV2);
            }
        }
        
        
        this.list.appendChild(node);
    }
}

export default Search;