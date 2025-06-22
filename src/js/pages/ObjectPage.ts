import gsap from "gsap";
import Tooltip from "../components/Tooltip";
import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS } from "../core/Globals";
import { getClosestDateToSun, getDistanceFromEarthNow, getDistanceFromSunNow, mapOrbitElementsV2 } from "../core/solar/SolarUtils";
import { SolarElement } from "../gfx/solar/SolarElement";
import { DefaultPage } from "./DefaultPage";
import { CategoryFilters, CategoryNames, DistanceFromEarth } from "../core/data/Categories";
import { MathUtils } from "@fils/math";
import { OrbitElements, SolarCategory } from "../core/solar/SolarSystem";
import TooltipDialog from "../components/TooltipDialog";
import { OBJECT_FRAME } from "../gfx/core/CameraManager";

export class ObjectPage extends DefaultPage {
    infoButtons: NodeListOf<Element>;
    selectedSolarItem:SolarElement;

    section:HTMLElement;

    isSolarItem:boolean;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.isSolarItem = template === 'featured-object';

        this.section = dom.querySelector('section');
        // gsap.set(this.section, {
        //     translateY: '100%'
        // });

        // console.log(dom);
    }

    create() {
        this.infoButtons = this.dom.querySelectorAll('.orbital_elements-item');

        OBJECT_FRAME.element = this.dom.querySelector('.object_detail-frame');
        OBJECT_FRAME.rect = OBJECT_FRAME.element.getBoundingClientRect();

        this.infoButtons.forEach((dom: HTMLElement, index: number) => {
            let _to;
            let _active = false;
            let alignment : 'left' | 'center' | 'right' = 'left';
            const { isMobile } = GLOBALS;
            if (index === 1) alignment = isMobile() ? 'right' : 'center';
            else if (index === 2) alignment = 'right';
            const el = dom.querySelector('[data-tooltip]') as HTMLElement;
            const text = el.getAttribute('data-tooltip');
            const tooltip = new TooltipDialog({ dom, text, alignment });

            el.onmouseenter = el.onclick = (e: Event) => {
                const {type} = e
                if (!_active) {
                    _active = true;
                    tooltip.create();
                    if (type === 'click') {
                        clearTimeout(_to);
                        _to = setTimeout(() => {
                            _active = false;
                            tooltip.dispose();
                        }, 2000);
                    }
                }
            }

            el.onmouseleave = () => {
                _active = false;
                tooltip.dispose();
            }
        });

        GLOBALS.timeCtrls.open();
        GLOBALS.mapCtrls.open();
        let slug = '';
        if(this.isSolarItem) {
            const parts = location.pathname.split('/');
            slug = parts[parts.length-2];
            console.log(slug);
        } else {
            const params = GLOBALS.urlParams();
            // console.log(params);
            for(const param of params) {
                if(param.key === 'id') {
                    slug = param.value;
                }
            }
        }
        // console.log(slug);
        const sel = GLOBALS.viewer.getSolarElementBySlug(slug);
        if(sel === null) {
            let data = null;
            for(const item of LoadManager.data.sample) {
                if(item.mpcdesignation === slug) {
                    // console.log('FOUND ITT!')
                    data = item;
                    break;
                }
            }
            if(data === null) {
                console.warn('No item found. Redirecting to home...');
                setTimeout(() => {
                    GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/`);
                }, 500)
                return
            } else {
                const oe = mapOrbitElementsV2(data);
                this.fillWithOrbitElements(oe);
            }
        } else {
            this.selectedSolarItem = sel;
            if(sel.isPlanet) {
                GLOBALS.objectToggle.show();
                GLOBALS.viewer.followSolarElement(sel, GLOBALS.objectToggle.selectedIndex===0);
                GLOBALS.objectToggle.callback = () => {
                    console.log('Switch mode to', GLOBALS.objectToggle.selectedIndex);
                    GLOBALS.viewer.followSolarElement(sel, GLOBALS.objectToggle.selectedIndex===0);
                }
            }
            else {
                GLOBALS.objectToggle.hide();
                GLOBALS.viewer.followSolarElement(sel, true);
            }

            // To-Do: Fill in content!
            const cnt = LoadManager.getSolarItemInfo(sel.name);
            this.fillWithContent(cnt, sel.data);
            // console.log(GLOBALS.objectToggle.selectedIndex);
        }

        super.create();
    }
    
    onResize(): void {
        OBJECT_FRAME.rect = OBJECT_FRAME.element.getBoundingClientRect();
    }

    transitionIn(resolve: any): Promise<void> {
        gsap.set(this.dom, {
            autoAlpha: 1
        });
        return new Promise<void>(gsapResolve => {
            // console.log('gsap', this.section);
            gsapResolve();
            gsap.to(this.section, {
                translateY: '0%',
                duration: 2,
                ease: 'expo.inOut',
                onComplete: () => {
                    
                }
            })
        }).then(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        return new Promise<void>(gsapResolve => {
            gsapResolve();
            gsap.to(this.section, {
                translateY: '100%',
                duration: 2,
                ease: 'expo.inOut',
                onComplete: () => {
                    this.dom.remove();
                }
            });
            /* gsap.to(this.section, {
                translateY: '0%'
            }) */
        }).then(resolve);
    }

    private mapSlider(slider:HTMLElement, data:OrbitElements, prop:string) {
        const ranges = CategoryFilters;
        const catID = data.category;
        const rangeA = ranges[prop][catID];
        slider.style.width = `${MathUtils.smoothstep(rangeA.min, rangeA.max, data.a)*100}%`;
    }

    private mapSliderWithValue(slider:HTMLElement, catID:SolarCategory, prop:string, value:number) {
        const ranges = CategoryFilters;
        const rangeA = ranges[prop][catID];
        slider.style.width = `${MathUtils.smoothstep(rangeA.min, rangeA.max, value)*100}%`;
    }

    private revealCategoryChip(catID:SolarCategory) {
        const catHTML = this.dom.querySelector('.object_card-category');
        const chips = catHTML.querySelectorAll('span.chip');
        for(const c of chips) {
            if(catID === "planets-moons") {
                if(c.classList.contains('planets_moons')) return c.setAttribute('aria-hidden', 'false');
            } else if(catID === "interstellar-objects") {
                if(c.classList.contains('interstellar_objects')) return c.setAttribute('aria-hidden', 'false');
            } else if(catID === "near-earth-objects") {
                if(c.classList.contains('near_earth_objects')) return c.setAttribute('aria-hidden', 'false');
            } else if(catID === "trans-neptunian-objects") {
                if(c.classList.contains('trans_neptunian_objects')) return c.setAttribute('aria-hidden', 'false');
            } else if(catID === "jupiter-trojans") {
                if(c.classList.contains('trojans')) return c.setAttribute('aria-hidden', 'false');
            } else {
                if(c.classList.contains(catID)) return c.setAttribute('aria-hidden', 'false');
            }
        }
    }

    fillData(data:OrbitElements, catID:SolarCategory, diameter:number=0) {
        // Map sliders
        const sliderA = this.dom.querySelector('#sliderA') as HTMLElement;
        this.mapSlider(sliderA, data, 'a');

        const sliderE = this.dom.querySelector('#sliderE') as HTMLElement;
        this.mapSlider(sliderE, data, 'e');

        const sliderI = this.dom.querySelector('#sliderI') as HTMLElement;
        this.mapSlider(sliderI, data, 'i');

        // Set Contents

        const text = this.dom.querySelector('.object_card-description');
        text.innerHTML = "";

        const d = diameter;
        const dm = d / 1.609;
        const dt = this.dom.querySelector('h4[aria-describedby="diameter-label"]');
        dt.querySelector('span.primary').textContent = `${d.toFixed(2)}km`;
        dt.querySelector('span.secondary').textContent = `${dm.toFixed(2)}mi`

        // console.log(data);
        if(data.a === null || data.N === null || data.M === null) {
            console.warn('Data corrupt. Redirecting back home...');
            return setTimeout(()=>{
                GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/`);
            }, 200);
        }

        const h2c = this.dom.querySelector('h2#cat-comparison');
        h2c.textContent = h2c.textContent.replace('%category%', CategoryNames[GLOBALS.lang][catID]);

        const els = this.dom.querySelectorAll('li.orbital_elements-item');
        els[0].querySelector('.orbital_elements-value').textContent = `${data.w.toFixed(2)}`;
        els[1].querySelector('.orbital_elements-value').textContent = `${data.N.toFixed(2)}`;
        els[2].querySelector('.orbital_elements-value').textContent = `${data.M.toFixed(2)}`;

        const tel = this.dom.querySelector('h4#closest-to-sun');
        const time = tel.querySelector('time');
        const date = getClosestDateToSun(data);
        const formattedDate = date.toLocaleDateString(GLOBALS.lang, {
          year: 'numeric',
          month: 'long',
          day: '2-digit'
        });
        time.textContent = formattedDate;

        const currentDate = new Date();

        // Get difference in milliseconds
        //@ts-ignore
        const timeDifference = date - currentDate;

        // Convert to days
        const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        tel.querySelector('span#days').textContent = `${daysLeft}`;

        // How far from the sun?
        const fS = getDistanceFromSunNow(data);
        const sliderFarSun = this.dom.querySelector('#sliderFarSun') as HTMLElement;
        this.mapSliderWithValue(sliderFarSun, catID, 'a', fS);
        this.dom.querySelector('p[aria-describedby="graph-from-the-sun"]').textContent = `${fS.toFixed(2)}au`;

        // How far from Earth?
        /* const dEn = getDistanceFromEarthNow(data);
        this.dom.querySelector('p[aria-describedby="graph-from-the-earth"]').textContent = `${dEn.toFixed(2)}au`;
        const sliderFarEarth = this.dom.querySelector('#sliderFarEarth') as HTMLElement;
        const map = DistanceFromEarth[catID];
        sliderFarEarth.style.width = `${MathUtils.smoothstep(map.min, map.max, dEn)*100}%`; */
    }

    fillWithContent(cnt, data) {
        // console.log(cnt);
        const h1 = this.dom.querySelector('h1#object-name');
        h1.textContent = cnt.title;

        // full designation
        this.dom.querySelector('.object_card-designation').querySelector('.value').textContent = data.fulldesignation;

        const catID = data.category;
        console.log(catID);

        this.revealCategoryChip(catID);
        this.fillData(data, catID, cnt.elementDiameter);
    }

    fillWithOrbitElements(data:OrbitElements) {
        // console.log(cnt);
        const h1 = this.dom.querySelector('h1#object-name');
        h1.textContent = data.fulldesignation;

        // full designation
        this.dom.querySelector('.object_card-designation').remove();

        const ranges = CategoryFilters;
        const catID = data.category;
        console.log(catID);

        this.revealCategoryChip(catID);
        this.fillData(data, catID);
    }

    dispose(): void {
        // console.log('DISPOSE');
        super.dispose();
        GLOBALS.objectToggle.callback = null;
    }
}