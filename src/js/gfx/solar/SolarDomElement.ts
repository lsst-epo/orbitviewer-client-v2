import { Vector2 } from "three";
import { GLOBALS } from "../../core/Globals";
import { SolarElement } from "./SolarElement";

const tmp:Vector2 = new Vector2();

export class SolarDOMElement {
  constructor(public dom:HTMLElement, public ref:SolarElement) {
    dom.onmouseover = () => {
      ref.orbitPath.ellipse.visible = true;
    }

    dom.onmouseout = () => {
      ref.orbitPath.ellipse.visible = false;
    }
  }

  update() {
    GLOBALS.viewer.controls.getNormalizedScreenCoords(this.ref, tmp);
    // this.dom.style.transform = `translateX(${tmp.x*100}%) translateY(${tmp.y*100}%)`;
    this.dom.style.left = `${tmp.x*100}%`;
    this.dom.style.top = `${tmp.y*100}%`;
  }
}