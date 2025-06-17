import { Page } from "@fils/nomad";
import gsap from "gsap";
import { GLOBALS } from "../core/Globals";

export class DefaultPage extends Page {
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        gsap.set(dom, {
          autoAlpha: 0,
        })

        document.body.className = `${template}_template`;
    }

    update() {}

    transitionIn(resolve: any): Promise<void> {
        // GLOBALS.firstPage = false;
        return new Promise<void>((gsapResolve) => {
            gsap.to(this.dom, {
                autoAlpha: 1,
                duration: 1,
                ease: 'linear',
                onComplete: () => {
                    gsapResolve();
                }
            })
        }).then(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        return new Promise<void>((gsapResolve) => {
            gsap.to(this.dom, {
                autoAlpha: 0,
                duration: 1,
                ease: 'linear',
                onComplete: () => {
                    this.dom.remove();
                    // document.body.style.overflow = 'auto';
                    gsapResolve();
                }
            })
        }).then(resolve);
    }

    create(): void {
        GLOBALS.firstPage = false;
    }

    dispose(): void {}
}