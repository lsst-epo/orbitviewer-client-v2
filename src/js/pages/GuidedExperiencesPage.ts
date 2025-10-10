import { DefaultPage } from "./DefaultPage";
import { ObjectsScroller } from "../components/ObjectsScroller";
import { $, $$ } from "@fils/utils";


export class GuidedExperiencesPage extends DefaultPage {
    dom: HTMLElement;
    guides:any[];
    guideEls:HTMLElement[];
    // scroller: ObjectsScroller;
    select:HTMLSelectElement;
    search:HTMLInputElement;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        const layer = $('section.layer', dom);
        this.guides = JSON.parse(layer.getAttribute('data-guides'));
        // console.log(this.guides);
        layer.removeAttribute('data-guides');

        this.guideEls = $$('a.guide_card', dom);
        // console.log(this.guideEls);
        this.sortBy('date', 'desc');

        this.select = $('select#sorting', dom) as HTMLSelectElement;

        this.select.onchange = () => {
            const parts = this.select.value.split('-');
            this.sortBy(parts[0], parts[1] as 'asc'|'desc');
        }

        this.search = $('input#search', dom) as HTMLInputElement;
        // console.log(this.search);
        this.search.oninput = () => {
            this.searchBy(this.search.value.toLowerCase());
        }
    }

    sortBy(field:string, direction:'asc'|'desc' = 'asc') {
        const items = [];
        for(let i=0; i<this.guides.length; i++) {
            const item = {
                index: i,
                value: null
            }
            
            if(field === 'date') {
                item.value = new Date(this.guides[i].date);
            } else {
                item.value = this.guides[i][field];
            }

            items.push(item);
        }
        
        items.sort((a, b) => {
            if(direction === 'desc') return b.value - a.value;
            return a.value - b.value;
        });

        for(let i=0;i<items.length;i++) {
            const item = items[i];
            this.guideEls[item.index].style.setProperty('--order', `${i}`);
        }

    }

    searchBy(query:string) {
        for(let i=0; i<this.guides.length; i++) {
            this.guideEls[i].setAttribute('aria-hidden', `${query !== "" && this.guides[i].title.toLowerCase().indexOf(query) === -1}`);
        }
    }

    create() {
        super.create();
    }

    update() {
    }

    dispose() { 
        super.dispose();
        // this.scroller.destroy();
    }
}