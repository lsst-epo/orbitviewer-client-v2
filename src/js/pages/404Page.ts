import gsap from "gsap";
import { GLOBALS } from "../core/Globals";
import { DefaultPage } from "./DefaultPage";

export class _404Page extends DefaultPage {
  h1:HTMLElement;
  h2:HTMLElement;
  button:HTMLButtonElement;

  constructor(id: string, template: string, dom: HTMLElement) {
    super(id, template, dom);

    const btn = dom.querySelector('button');
    btn.onclick = () => {
      GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/`);
      // window.location.pathname = "/";
    }

    this.button = btn;

    this.h1 = dom.querySelector('h1');
    this.h2 = dom.querySelector('h2');

    gsap.set(this.h1, {
      opacity: 0,
      translateY: 100
    })

    gsap.set(this.h2, {
      opacity: 0,
      translateY: 100
    })

    gsap.set(this.button, {
      opacity: 0,
      translateY: 100
    })
  }

  transitionIn(resolve: any): Promise<void> {
    const duration = .8;
    const ease = "cubic.inOut";
    gsap.to(this.h1, {
      opacity: 1,
      translateY: 0,
      duration,
      ease
    })

    gsap.to(this.h2, {
      opacity: 1,
      translateY: 0,
      delay: .2,
      duration,
      ease
    })

    gsap.to(this.button, {
      opacity: 1,
      translateY: 0,
      duration,
      delay: .5,
      ease
    })

    GLOBALS.viewer.followRandomPlanet();

    return super.transitionIn(resolve);
  }
}