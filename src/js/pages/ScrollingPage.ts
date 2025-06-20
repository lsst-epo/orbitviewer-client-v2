import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";

export class ScrollingPage extends DefaultPage {
    dom: HTMLElement;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        document.body.classList.add('scrollable');

        this.dom = dom;
    }

    create() {
        
    }

    transitionIn(resolve: any): Promise<void> {
        GLOBALS.viewer.paused = true;
        return super.transitionIn(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        GLOBALS.viewer.paused = false;
        return super.transitionOut(resolve);
    }

    close() {
        
    }
}