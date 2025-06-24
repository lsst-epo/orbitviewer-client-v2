import gsap from 'gsap';
export class Loader {
  constructor(public dom:HTMLElement) {

  }

  show() {
    // console.log('SHOOOOOOOOW', this.dom);
    this.dom.setAttribute('aria-hidden', 'false');
    gsap.killTweensOf(this.dom, 'opacity');
    gsap.to(this.dom, {
      opacity: 1,
      duration: 0.8,
      ease: 'power1.in'
    })
  }

  hide() {
    // console.log('HIDEEEE')
    gsap.killTweensOf(this.dom, 'opacity');
    gsap.to(this.dom, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        this.dom.setAttribute('aria-hidden', 'true');
      }
    })
  }
}