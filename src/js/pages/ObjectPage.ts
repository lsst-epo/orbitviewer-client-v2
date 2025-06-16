import ToggleGroup from "../components/ToggleGroup";
import Tooltip from "../components/Tooltip";
import { GLOBALS } from "../core/Globals";
import { SolarElement } from "../gfx/solar/SolarElement";
import { DefaultPage } from "./DefaultPage";

export class ObjectPage extends DefaultPage {
    infoButtons: NodeListOf<Element>;
    selectedSolarItem:SolarElement;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.dom = dom;
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

        // console.log(GLOBALS.objectToggle.selectedIndex);

        super.create();
    }

    dispose(): void {
        // console.log('DISPOSE');
        super.dispose();
        GLOBALS.objectToggle.callback = null;
    }
}