import gsap from 'gsap';

export class Loader {
  label:HTMLElement;
  loader: HTMLElement;
  tl1: gsap.core.Timeline;
  tl2: gsap.core.Timeline;

  constructor(public dom:HTMLElement) {
    this.label = dom.querySelector('.loader-text');
    this.loader = document.querySelector('.loader-svg');
    const elements = this.loader.querySelectorAll('path, circle');

    this.tl1 = gsap.timeline({ paused: true, repeat: -1 })
    this.tl2 = gsap.timeline({ paused: true, repeat: -1 })

    this.tl1
      .addLabel('start')
      .to(this.loader, {
        transformOrigin: 'center',
        rotate: '+=360',
        ease: 'linear',
        duration: 50
      })

    this.tl2
      .set(elements, { autoAlpha: 0 })
      .addLabel('start')
      .to(elements, {
        stagger: 0.04,
        autoAlpha: 1,
        duration: 0.6,
        ease: 'power3.out'
      })
      .to(elements, {
        delay: 0.5,
        autoAlpha: 0,
        duration: 1,
        ease: 'power2.out'
      })

    this.resetTl();
  }

  resetTl = () => {
    this.tl1.pause();
    this.tl1.progress(0);
    this.tl2.pause();
    this.tl2.progress(0);

    gsap.set(this.loader, {
      transformOrigin: 'center',
      scale: 0.5,
    })
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

    this.tl1.play();
    this.tl2.play();

    gsap.to(this.loader, {
      scale: 1,
      duration: 0.5,
      ease: 'power1.inOut'
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
    setTimeout(() => {
      this.resetTl();
    }, 500);
  }
}