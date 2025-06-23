import { Page } from "@fils/nomad";
import { GLOBALS } from "../core/Globals";

export class DefaultPage extends Page {
    rs:ResizeObserver;

    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        document.body.className = `${template}_template`;
        window.scrollTo(0,0);

        this.rs = new ResizeObserver(element => {
            this.onResize();
        });

        this.rs.observe(dom);
    }

    onResize() {

    }

    update() {}

    transitionIn(resolve: any): Promise<void> {
        return new Promise<void>((res) => {
            res();
        }).then(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        return new Promise<void>((res) => {
            this.dom.remove();
            res();
        }).then(resolve);
    }

    create(): void {
        // GLOBALS.firstPage = false;
    }

    dispose(): void {
        this.rs.disconnect();
    }
}