import { DefaultPage } from "./DefaultPage";

export class AboutPage extends DefaultPage {
    dom: HTMLElement;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.dom = dom;
    }

    create() {
    }

    close() {
        
    }
}