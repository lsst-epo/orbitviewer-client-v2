import { $, $$ } from "@fils/utils";
import gsap from "gsap";
import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS, VISUAL_SETTINGS } from "../core/Globals";
import { getSimDataV2 } from "../core/solar/SolarData";
import { getRecommendedPerformanceIndex } from "../core/Utils";
import OrbitViewerPage from "../pages/OrbitViewerPage";
import Layer from "./Layer";

class Onboarding extends Layer {
    orbitviewer: OrbitViewerPage;
    dom: any;
    startButtons: any;

    slides:HTMLElement[];
    step:number = 0;
    orbitButton:HTMLElement;

    constructor(dom, orbitviewer) {
        super(dom, {
            openClass: 'onboarding--open',
            closeClass: 'onboarding--close',
            animationDuration: 500
        });
        
        this.dom = dom;
        this.orbitviewer = orbitviewer;
        this.startButtons = this.dom.querySelectorAll('.button_launch');

        this.slides = $$('section.onboarding-slide', dom);
        this.orbitButton = $('a.primary', this.slides[1]);
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

        this.showTiers();
    }

    start() {
        const whenReady = () => {
            // this.orbitviewer.showUI();
            // GLOBALS.viewer.goToOrbitViewerMode(true);
            // GLOBALS.viewer.controls.centerView(2, "expo.inOut");
            this.nextStep();
        }

        // this.updateRecommendedTier();
        
        this.startButtons.forEach((el: Element) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                //@ts-ignore
                el.blur();
                // this.close();

                const id = el.getAttribute('data-id');
                // console.log(id);
                localStorage.setItem('rubin-data-profile', id);

                if(id !== VISUAL_SETTINGS.current) {
                    // Load Data
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

        this.orbitButton.onclick = () => {
            this.nextStep();
        }
    }

    nextStep() {
        if(this.step === 0) {
            this.step++;
            // show guided tours intro
            this.slides[0].setAttribute('aria-hidden', 'true');
            this.slides[1].setAttribute('aria-hidden', 'false');
            this.showGuides();

        } else {
            this.close();
            this.orbitviewer.showUI();
            GLOBALS.viewer.goToOrbitViewerMode(true);
        }
    }

    showTiers() {
        this.animateSlide(this.slides[0]);
    }

    showGuides() {
        this.animateSlide(this.slides[1]);
    }

    animateSlide(slide:HTMLElement) {
        const container = slide.querySelector('.onboarding-content');
        const title = slide.querySelector('.onboarding-title');
        const subtitle = slide.querySelector('.onboarding-subtitle');
        const items = slide.querySelectorAll('.onboarding-item');
        const foot = slide.querySelector('.onboarding-foot');
        gsap.to(title, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'cubic.inOut',
        })
        if (subtitle) {
            gsap.to(subtitle, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'cubic.inOut',
            });
        }
        gsap.to(items, {
            opacity: 1,
            y: 0,
            ease: 'expo.inOut',
            duration: 1.5,
            stagger: .1,
            delay: .1
        })
        gsap.to(foot, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'cubic.inOut',
            delay: .4 + items.length * 0.1,
            onComplete: () => {
                container.classList.add('ready');
            }
        });
    }

    open(): Promise<void> {
        this.start();
        return super.open();
    }
}

export default Onboarding;