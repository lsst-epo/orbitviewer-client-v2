import { USE_V2 } from "../core/App";
import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS, VISUAL_SETTINGS } from "../core/Globals";
import { getSimData, getSimDataV2 } from "../core/solar/SolarData";
import OrbitViewerPage from "../pages/OrbitViewerPage";
import Layer from "./Layer";

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

        this.startButtons.forEach((el: Element) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                this.close();

                const id = el.getAttribute('data-id');
                console.log(id);

                if(id !== VISUAL_SETTINGS.current) {
                    // Load Data
                    // To-Do: Show loader modal
                    VISUAL_SETTINGS.current = id;
                    LoadManager.loadSample(id, (json) => {
                        const data = USE_V2 ? getSimDataV2(LoadManager.data.sample) : getSimData(LoadManager.data.sample);;
                        GLOBALS.viewer.setData(data);
                        //To-Do: close loader
                        whenReady();
                    });
                } else {
                    whenReady();
                }
            });
        });
    }
}

export default Onboarding;