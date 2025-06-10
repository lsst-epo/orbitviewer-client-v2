import Tooltip from "../components/Tooltip";
import { DefaultPage } from "./DefaultPage";

export class ObjectPage extends DefaultPage {
    infoButtons: NodeListOf<Element>;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.dom = dom;

        this.infoButtons = this.dom.querySelectorAll('.orbital_elements-data .button_icon');
    }

    create() {
        const tooltip = new Tooltip({
            autoDismissDelay: 3000,
            offset: 12,
            maxWidth: 250
        });

        this.infoButtons.forEach((el: HTMLElement) => {
            
            el.addEventListener('mouseleave', () => {
                tooltip.hide();
            });

            el.addEventListener('mouseenter', () => {
                tooltip.show(el, undefined, "center");
            });
        });
    }
}