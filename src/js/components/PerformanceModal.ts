import { LoadManager } from "../core/data/LoadManager";
import { GLOBALS, VISUAL_SETTINGS } from "../core/Globals";
import { getSimDataV2 } from "../core/solar/SolarData";

export class PerformanceWarning {
  constructor(public dom:HTMLElement, onAction:Function) {
    const btns = dom.querySelectorAll('button');

    btns.forEach(btn => {
      btn.onclick = () => {
        btn.blur();
        if(btn.classList.contains('secondary')) {
          this.hide();
          onAction(false);
        } else if(btn.classList.contains('primary')) {
          GLOBALS.loader.show();
          const id = "low";
          VISUAL_SETTINGS.current = id;
          LoadManager.loadSample(id, (json) => {
              const data = getSimDataV2(LoadManager.data.sample);
              GLOBALS.viewer.setData(data);
              GLOBALS.loader.hide();
              GLOBALS.viewer.adjustQualitySettings();
              GLOBALS.navigation.updateExplorationState();
              this.hide();
              onAction(true);
          });
        }
      }
    });
  }

  get visible():boolean {
    return this.dom.getAttribute('aria-hidden') === 'false';
  }

  show() {
    this.dom.setAttribute('aria-hidden', 'false');
  }

  hide() {
    this.dom.blur();
    this.dom.setAttribute('aria-hidden', 'true');
  }
}