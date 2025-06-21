import { CategoryNames, TypeCategoryMap } from "../core/data/Categories";
import { LoadManager } from "../core/data/LoadManager";
import { SearchEngine } from "../core/data/SearchEngine";
import { GLOBALS } from "../core/Globals";
import { OrbitElements, SolarCategory } from "../core/solar/SolarSystem";
import { mapOrbitElementsV2, OrbitDataElementsV2 } from "../core/solar/SolarUtils";
import { SolarElement } from "../gfx/solar/SolarElement";
import Layer from "./Layer";

class Search extends Layer {
    dom: HTMLElement;
    closeButton: HTMLElement;
    sInput:HTMLInputElement;
    recommendH:HTMLElement;
    list:HTMLElement;
    recommended:NodeListOf<HTMLUListElement>;
    alert:HTMLElement;
    errorMessage:string;
    
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
        this.recommended = this.list.querySelectorAll('li.listitem-item');

        this.alert = dom.querySelector('.banner');
        this.errorMessage = this.alert.textContent;

        this.start();
    }

    open(): Promise<void> {
        return super.open().then(r => {
            this.sInput.focus();
            this.sInput.oninput = () => {
                // console.log(this.sInput.value);
                if(!this.sInput.value.length) {
                    this.showRecommended();
                    return;
                };
                this.hideRecommended();
                const items = SearchEngine.search(this.sInput.value);
                if(!items.length) {
                    this.showNotFound(this.sInput.value);
                    return;
                }
                this.hideNotFound();
                for(let i=0; i<Math.min(100, items.length); i++) {
                    this.addItemToList(items[i]);
                }
            }
        })
    }

    close(): Promise<void> {
        return super.close().then(r => {
            this.sInput.value = "";
            this.showRecommended();
        })
    }

    showRecommended() {
        this.recommendH.setAttribute('aria-hidden', 'false');
        this.list.replaceChildren();
        this.recommended.forEach(node => this.list.appendChild(node));
    }

    hideRecommended() {
        this.recommendH.setAttribute('aria-hidden', 'true');
        this.list.replaceChildren();
    }

    showNotFound(query:string) {
        this.alert.textContent = this.errorMessage.replace('{{query}}', query);
        this.alert.setAttribute('aria-hidden', 'false');
    }

    hideNotFound() {
        this.alert.setAttribute('aria-hidden', 'true');
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

    private mapNodeDataWithSI(node:HTMLElement, el, sel:SolarElement, addDes:boolean=false) {
        const name = addDes ? `${el.title} (${sel.data.fulldesignation})` : el.title;
        node.querySelector("span.name").textContent = name;
        // console.log(sel.category);
        node.querySelector("span.value").textContent = `${this.getCategoryName(sel.category as SolarCategory)}`;
        const a = node.querySelector('a');
        a.href = "javascript:void(0);";
        a.onclick = () => {
            GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/object/?id=${sel.slug}`);
        }
    }

    private mapNodeDataWithOE(node:HTMLElement, mel:OrbitDataElementsV2) {
        node.querySelector("span.name").textContent = `${mel.fulldesignation}`;
        node.querySelector("span.value").textContent = `${this.getCategoryName(TypeCategoryMap[mel.object_type[0]])}`;
        const a = node.querySelector('a');
        a.href = "javascript:void(0);";
        a.onclick = () => {
            GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/object/?id=${mel.mpcdesignation}`);
        }
    }

    addItemToList(item:OrbitElements|OrbitDataElementsV2) {
        const node = this.recommended[0].cloneNode(true) as HTMLElement;
        node.setAttribute('priority', '2');
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