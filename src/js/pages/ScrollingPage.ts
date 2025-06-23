import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";
import AboutCarousel from "../components/AboutCarousel";

export class ScrollingPage extends DefaultPage {
    dom: HTMLElement;
    template: string;
    aboutCarousel: AboutCarousel;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        this.template = template;

        document.body.classList.add('scrollable');

        this.dom = dom;
    }

    create() {
        if (this.template === 'about') {
            const carousel = this.dom.querySelector('.about_device-hero');
            this.aboutCarousel = new AboutCarousel(carousel);
        }

        GLOBALS.navigation.close();

        super.create();
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

    dispose() {
        super.dispose();
        this.aboutCarousel?.dispose();
    }
}