import { DefaultPage } from "./DefaultPage";

export class ObjectsFiltersPage extends DefaultPage {
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.dom = dom;
    }
}