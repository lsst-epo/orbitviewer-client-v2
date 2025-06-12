import SlidingMenu from "../components/SlidingMenu";
import Layer from "./Layer";

class Navigation extends Layer {
  dom: HTMLElement;
  button_trigger: any;
  slidingMenu: SlidingMenu;
  
  constructor(dom) {
      super(dom, {
            openClass: 'navigation--open',
            closeClass: 'navigation--close',
            animationDuration: 500
        });
      
      this.dom = dom;

      this.button_trigger = document.querySelector('#nav_trigger');

      this.slidingMenu = new SlidingMenu('.nav_dropdown');

      this.start();
  }

  start() {
    this.button_trigger.addEventListener('click', ()=> {
      this.toggle();
    });
  }
}

export default Navigation;