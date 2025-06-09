import { Page } from "@fils/nomad";
import gsap from "gsap";

export class DefaultPage extends Page {
    constructor(id: string, template: string, dom: HTMLElement) {
        super(id, template, dom);

        gsap.set(dom, {
          autoAlpha: 0,
        })
    }

    update() {}

    transitionIn(resolve: any): Promise<void> {
        gsap.to(this.dom, {
            autoAlpha: 1,
            duration: 1,
            ease: 'linear'
        })

        return Promise.resolve().then(resolve);
    }

    transitionOut(resolve: any): Promise<void> {
        gsap.to(this.dom, {
            autoAlpha: 0,
            duration: 1,
            ease: 'linear',
            onComplete: () => {
              this.dom.remove();
            }
        })

        return Promise.resolve().then(resolve);
    }

    create(): void {}

    dispose(): void {}
}