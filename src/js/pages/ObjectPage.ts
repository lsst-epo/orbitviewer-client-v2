import gsap from "gsap";
import Tooltip from "../components/Tooltip";
import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS } from "../core/Globals";
import { getClosestDateToSun, getDistanceFromEarthNow, getDistanceFromSunNow } from "../core/solar/SolarUtils";
import { SolarElement } from "../gfx/solar/SolarElement";
import { DefaultPage } from "./DefaultPage";

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
        const slug = location.search.replace('?', '');
        // console.log(slug);
        const sel = GLOBALS.viewer.getSolarElementBySlug(slug);
        if(sel === null) {
            console.warn('No solar item fiund. Redirecting to home...');
            return GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/`);
        }
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

        super.create();
    }

    transitionIn(resolve: any): Promise<void> {
        gsap.set(this.dom, {
            autoAlpha: 1
        });
        document.body.style.overflow = 'hidden';
        return new Promise<void>(gsapResolve => {
            // console.log('gsap', this.section);
            gsap.to(this.section, {
                translateY: '0%',
                duration: 2,
                ease: 'expo.inOut',
                onComplete: () => {
                    gsapResolve();
                    document.body.style.overflow = 'auto';
                }
            })
        }).then(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        document.body.style.overflow = 'hidden';
        return new Promise<void>(gsapResolve => {
            gsap.to(this.section, {
                translateY: '100%',
                duration: 2,
                ease: 'expo.inOut',
                onComplete: () => {
                    gsapResolve();
                    this.dispose();
                }
            });
            /* gsap.to(this.section, {
                translateY: '0%'
            }) */
        }).then(resolve);
    }

    fillWithContent(cnt, data) {
        // console.log(cnt);
        const h1 = this.dom.querySelector('h1#object-name');
        h1.textContent = cnt.title;

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

        this.dom.querySelector('p[aria-describedby="graph-from-the-sun"]').textContent = `${getDistanceFromSunNow(data).toFixed(2)}au`;
        this.dom.querySelector('p[aria-describedby="graph-from-the-earth"]').textContent = `${getDistanceFromEarthNow(data).toFixed(2)}au`;
    }

    dispose(): void {
        // console.log('DISPOSE');
        super.dispose();
        GLOBALS.objectToggle.callback = null;
    }
}