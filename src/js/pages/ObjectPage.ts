import gsap from "gsap";
import Tooltip from "../components/Tooltip";
import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS } from "../core/Globals";
import { getClosestDateToSun, getDistanceFromEarthNow, getDistanceFromSunNow, mapOrbitElementsV2 } from "../core/solar/SolarUtils";
import { SolarElement } from "../gfx/solar/SolarElement";
import { DefaultPage } from "./DefaultPage";
import { CategoryFilters, DistanceFromEarth } from "../core/data/Categories";
import { MathUtils } from "@fils/math";
import { OrbitElements, SolarCategory } from "../core/solar/SolarSystem";

export class ObjectPage extends DefaultPage {
    infoButtons: NodeListOf<Element>;
    selectedSolarItem:SolarElement;

    section:HTMLElement;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.section = dom.querySelector('section');
        // gsap.set(this.section, {
        //     translateY: '100%'
        // });

        // console.log(dom);
    }

    create() {
        const tooltip = new Tooltip({
            autoDismissDelay: 3000,
            offset: 12,
            maxWidth: 250
        });

        this.infoButtons = this.dom.querySelectorAll('.orbital_elements-data .button_icon');

        this.infoButtons.forEach((el: HTMLElement) => {
            
            el.addEventListener('mouseleave', () => {
                tooltip.hide();
            });

            el.addEventListener('mouseenter', () => {
                tooltip.show(el, undefined, "center");
            });
        });

        GLOBALS.timeCtrls.open();
        GLOBALS.mapCtrls.open();
        let slug = '';
        const params = GLOBALS.urlParams();
        // console.log(params);
        for(const param of params) {
            if(param.key === 'id') {
                slug = param.value;
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

    fillWithContent(cnt, data) {
        // console.log(cnt);
        const h1 = this.dom.querySelector('h1#object-name');
        h1.textContent = cnt.title;

        // full designation
        this.dom.querySelector('.object_card-designation').querySelector('.value').textContent = data.fulldesignation;

        const ranges = CategoryFilters;
        const catID = data.category;
        // console.log(catID);

        // Map sliders
        const sliderA = this.dom.querySelector('#sliderA') as HTMLElement;
        this.mapSlider(sliderA, data, 'a');

        const sliderE = this.dom.querySelector('#sliderE') as HTMLElement;
        this.mapSlider(sliderE, data, 'e');

        const sliderI = this.dom.querySelector('#sliderI') as HTMLElement;
        this.mapSlider(sliderI, data, 'i');

        // Set Contents

        const text = this.dom.querySelector('.object_card-description');
        text.innerHTML = cnt.text;

        const d = cnt.elementDiameter;
        const dm = d / 1.609;
        const dt = this.dom.querySelector('h4[aria-describedby="diameter-label"]');
        dt.querySelector('span.primary').textContent = `${d.toFixed(2)}km`;
        dt.querySelector('span.secondary').textContent = `${dm.toFixed(2)}mi`

        // console.log(data);

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

    fillWithOrbitElements(data:OrbitElements) {
        // console.log(cnt);
        const h1 = this.dom.querySelector('h1#object-name');
        h1.textContent = data.fulldesignation;

        // full designation
        this.dom.querySelector('.object_card-designation').remove();

        const ranges = CategoryFilters;
        const catID = data.category;
        // console.log(catID);

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

        const d = 0;
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

    dispose(): void {
        console.log('DISPOSE');
        super.dispose();
        GLOBALS.objectToggle.callback = null;
    }
}