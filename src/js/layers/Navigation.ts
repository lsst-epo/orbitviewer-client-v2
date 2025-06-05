import Layer from "./Layer";

class Navigation extends Layer {
  dom: HTMLElement;
  button_trigger: any;
  
  constructor(dom) {
      super(dom);
      this.dom = dom;

      this.button_trigger = document.querySelector('#nav_trigger');

      this.start();
  }

  start() {
    this.button_trigger.addEventListener('click', ()=> {
      this.toggle();
    });
  }
}

export default Navigation;