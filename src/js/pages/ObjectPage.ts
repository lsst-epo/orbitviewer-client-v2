import { DefaultPage } from "./DefaultPage";

export class ObjectPage extends DefaultPage {
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.dom = dom;
    }
}