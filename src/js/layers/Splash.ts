import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS, VISUAL_SETTINGS } from "../core/Globals";
import { getSimDataV2 } from "../core/solar/SolarData";
import OrbitViewerPage from "../pages/OrbitViewerPage";
import Layer from "./Layer";
import gsap from "gsap";

class Splash extends Layer {
    dom: HTMLElement;
    buttonStart: HTMLElement;
    splash: any;
    orbitViewer: OrbitViewerPage;

    constructor(dom, orbitViewer:OrbitViewerPage) {
        super(dom);
        this.dom = dom;
        this.orbitViewer = orbitViewer;

        this.buttonStart = this.dom.querySelector('.button_start');

        this.start();
    }

    start() {
        this.enter();
        
        this.buttonStart.addEventListener('click', (event) => {
            event.preventDefault();

            if (this.orbitViewer.onboarding) {
                GLOBALS.loader.show(true);
                const profile = localStorage.getItem('rubin-data-profile');
                if(!profile) {
                    this.orbitViewer.appRef?.startTest();
                    this.orbitViewer.onboarding?.open();
                } else {
                    GLOBALS.loader.hide();
                    this.orbitViewer.showUI();
                    GLOBALS.viewer.goToOrbitViewerMode(true);
                }
                this.close();
            }
        });
    }

    enter() {
        gsap.to(this.dom, {
            opacity: 1,
            duration: .8,
            ease: 'power1.in'
        })

        const triad = this.dom.querySelector('.splash-triad');
        gsap.to(triad, {
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power1.inOut',
        })

        const title = this.dom.querySelector('.title');
        const subtitle = this.dom.querySelector('.subtitle');
        const action = this.dom.querySelector('.splash-action');
        const counter = this.dom.querySelector('.splash-count');
        gsap.to([title, subtitle, action, counter], {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'cubic.inOut',
            delay: .2,
            stagger: .1
        });
    }
}

export default Splash;