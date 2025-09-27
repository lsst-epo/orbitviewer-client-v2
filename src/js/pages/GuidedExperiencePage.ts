import { DefaultPage } from "./DefaultPage";
import { ObjectsScroller } from "../components/ObjectsScroller";


export class GuidedExperiencePage extends DefaultPage {
    dom: HTMLElement;
    // scroller: ObjectsScroller;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);
    }

    create() {
        super.create();
    }

    update() {
    }

    dispose() {
        super.dispose();
        // this.scroller.destroy();
    }
}