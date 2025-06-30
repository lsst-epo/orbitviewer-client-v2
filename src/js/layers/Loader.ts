import gsap from 'gsap';
export class Loader {
  label:HTMLElement;

  constructor(public dom:HTMLElement) {
    this.label = dom.querySelector('p.loader-text');
  }

  show(useCopy2:boolean=false) {
    // console.log('SHOOOOOOOOW', this.dom);
    this.label.textContent = this.label.getAttribute(useCopy2 ? 'data-copy2' : 'data-copy1');
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