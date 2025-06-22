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

        this.start();
    }

    start() {
        const whenReady = () => {
            this.orbitviewer.showUI();
            GLOBALS.viewer.goToOrbitViewerMode(true);
        }

        const lis = this.dom.querySelectorAll('li');
        // console.log(lis);
        let recommendedIndex = getRecommendedPerformanceIndex();

        for(let i=0;i<4;i++) {
            const li = lis[i];
            if(i === recommendedIndex) li.classList.add('recommended');
            else li.classList.remove('recommended');
        }

        this.startButtons.forEach((el: Element) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                this.close();

                const id = el.getAttribute('data-id');
                // console.log(id);

                if(id !== VISUAL_SETTINGS.current) {
                    // Load Data
                    // To-Do: Show loader modal
                    GLOBALS.loader.show();
                    VISUAL_SETTINGS.current = id;
                    LoadManager.loadSample(id, (json) => {
                        const data = USE_V2 ? getSimDataV2(LoadManager.data.sample) : getSimData(LoadManager.data.sample);;
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
}

export default Onboarding;