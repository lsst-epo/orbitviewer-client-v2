import gsap from "gsap";
import { isDesktop, isIpad, isMobile } from "@fils/utils";
import { performanceTest, USE_V2 } from "../core/App";
import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS, VISUAL_SETTINGS } from "../core/Globals";
import { getSimData, getSimDataV2 } from "../core/solar/SolarData";
import OrbitViewerPage from "../pages/OrbitViewerPage";
import Layer from "./Layer";
import { getRecommendedPerformanceIndex } from "../core/Utils";

class Onboarding extends Layer {
    orbitviewer: OrbitViewerPage;
    dom: any;
    startButtons: any;

    constructor(dom, orbitviewer) {
        super(dom, {
            openClass: 'onboarding--open',
            closeClass: 'onboarding--close',
            animationDuration: 500
        });
        
        this.dom = dom;
        this.orbitviewer = orbitviewer;
        this.startButtons = this.dom.querySelectorAll('.button_launch');

        // this.start();
    }

    updateRecommendedTier() {
        const lis = this.dom.querySelectorAll('li');
        // console.log(lis);
        let recommendedIndex = getRecommendedPerformanceIndex();

        for(let i=0;i<4;i++) {
            const li = lis[i];
            const ribbon = li.querySelector('span.ribbon');
            if(i === recommendedIndex) {
                li.classList.add('recommended');
                ribbon.setAttribute('aria-hidden', 'false');
            }
            else {
                li.classList.remove('recommended');
                ribbon.setAttribute('aria-hidden', 'true');
            }
        }
    }

    start() {
        const whenReady = () => {
            this.orbitviewer.showUI();
            GLOBALS.viewer.goToOrbitViewerMode(true);
        }

        this.updateRecommendedTier();
        
        this.startButtons.forEach((el: Element) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                this.close();

                const id = el.getAttribute('data-id');
                // console.log(id);
                localStorage.setItem('rubin-data-profile', id);

                if(id !== VISUAL_SETTINGS.current) {
                    // Load Data
                    // To-Do: Show loader modal
                    GLOBALS.loader.show();
                    VISUAL_SETTINGS.current = id;
                    LoadManager.loadSample(id, (json) => {
                        const data = getSimDataV2(LoadManager.data.sample);
                        GLOBALS.viewer.setData(data);
                        GLOBALS.loader.hide();
                        GLOBALS.viewer.adjustQualitySettings();
                        GLOBALS.navigation.updateExplorationState();
                        whenReady();
                    });
                } else {
                    GLOBALS.viewer.adjustQualitySettings();
                    whenReady();
                }
            });
        });
    }

    open(): Promise<void> {
        const container = this.dom.querySelector('.exploration');
        const title = this.dom.querySelector('.onboarding-title');
        const items = this.dom.querySelectorAll('.exploration-item');
        const info = this.dom.querySelector('.onboarding-info');
        gsap.to(title, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'cubic.inOut',
        })
        gsap.to(items, {
            opacity: 1,
            y: 0,
            ease: 'expo.inOut',
            duration: 1.5,
            stagger: .1,
            delay: .1
        })
        gsap.to(info, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'cubic.inOut',
            delay: .4 + items.length * 0.1,
            onComplete: () => {
                container.classList.add('ready');
            }
        });
        
        this.start();
        return super.open();
    }
}

export default Onboarding;