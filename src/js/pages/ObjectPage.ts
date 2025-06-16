import ToggleGroup from "../components/ToggleGroup";
import Tooltip from "../components/Tooltip";
import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";

export class ObjectPage extends DefaultPage {
    infoButtons: NodeListOf<Element>;
    
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
        const name = location.search.replace('?', '');
        // console.log(name);
        const sel = GLOBALS.viewer.followSolarElement(name);
        if(sel.isPlanet) GLOBALS.objectToggle.show();
        else GLOBALS.objectToggle.hide();
        // sel.orbitPath.selected = true;

        super.create();
    }
}