import SlidingMenu from "../components/SlidingMenu";
import { USE_V2 } from "../core/App";
import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS, VISUAL_SETTINGS } from "../core/Globals";
import { getSimData, getSimDataV2 } from "../core/solar/SolarData";
import Layer from "./Layer";

class Navigation extends Layer {
  dom: HTMLElement;
  button_trigger: any;
  slidingMenu: SlidingMenu;

  exploration:HTMLElement;
  
  constructor(dom) {
      super(dom, {
            openClass: 'navigation--open',
            closeClass: 'navigation--close',
            animationDuration: 500
        });
      
      this.dom = dom;

      this.button_trigger = document.querySelector('#nav_trigger');

      this.slidingMenu = new SlidingMenu('.nav_dropdown');

      this.exploration = dom.querySelector(`[data-menu="exploration"]`);

      const inputs = this.exploration.querySelectorAll('input');
      for(const i of inputs) {
        i.onclick = () => {
          const id = i.getAttribute('id');
          if(id === VISUAL_SETTINGS.current) return;
          GLOBALS.loader.show();
          VISUAL_SETTINGS.current = id;
          LoadManager.loadSample(id, (json) => {
              const data = USE_V2 ? getSimDataV2(LoadManager.data.sample) : getSimData(LoadManager.data.sample);;
              GLOBALS.viewer.setData(data);
              GLOBALS.loader.hide();
          });
        }
      }
      
      this.updateExplorationState();

      this.start();
  }

  updateExplorationState () {
    const inputs = this.exploration.querySelectorAll('input');
    console.log('MENU', VISUAL_SETTINGS.current);
    for(const i of inputs) {
      i.checked = VISUAL_SETTINGS.current === i.getAttribute('id');
    }
  }

  start() {
    this.button_trigger.addEventListener('click', ()=> {
      this.toggle();
    });
  }
}

export default Navigation;