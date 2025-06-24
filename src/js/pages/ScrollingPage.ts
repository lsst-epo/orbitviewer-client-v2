import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";
import AboutCarousel from "../components/AboutCarousel";

export class ScrollingPage extends DefaultPage {
    id: string;
    dom: HTMLElement;
    template: string;
    
    aboutCarousel: AboutCarousel;

    sections: NodeListOf<HTMLElement>;
    animateSectionsOnce: boolean = false;
    intersectionObserver: IntersectionObserver | null = null;
    
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);
        
        this.id = id;
        this.dom = dom;
        this.template = template;
    }

    create() {
        super.create();

        if (this.template === 'about') {
            const carousel = this.dom.querySelector('.about_device-hero');
            this.aboutCarousel = new AboutCarousel(carousel);
        }

        this.sections = this.dom.querySelectorAll(`
            section:not(.with-inner-sections),
            .with-inner-sections > div,
            .with-inner-sections > article,
            .with-inner-sections > section,
            .intersect-animation
        `);

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const { isIntersecting } = entry;
                const { classList } = entry.target;
                classList.toggle('intersect_active', isIntersecting || classList.contains('intersect_active') && this.animateSectionsOnce);
                classList.toggle('intersect_no-active', !isIntersecting && !this.animateSectionsOnce);
            });
        },
        {
            root: null, // Use the viewport as the root
            rootMargin: "-150px 0px -150px 0px", // top, right, bottom, left
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    transitionIn(resolve: any): Promise<void> {
        GLOBALS.viewer.paused = true;
        GLOBALS.viewer.leave();
        this.sections.forEach(section => {
            this.intersectionObserver.observe(section);
        });
        document.body.classList.add('scrollable');
        document.body.scrollTo(0, 0)
        
        return super.transitionIn(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        GLOBALS.viewer.paused = false;
        document.body.classList.remove('scrollable');
        // console.log('transition out!')
        return super.transitionOut(resolve);
    }

    close() {}

    dispose() {
        super.dispose();

        this.aboutCarousel?.dispose();
        
        this.sections.forEach(section => {
            this.intersectionObserver?.unobserve(section);
        });
        this.intersectionObserver?.disconnect();

        console.log('ScrollingPage disposed');
        
        
    }
}