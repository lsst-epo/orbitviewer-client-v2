import { MathUtils } from "@fils/math";
import { Vector3 } from "three";
import { GLOBALS } from "../../core/Globals";
import { SolarElement } from "./SolarElement";
import { FAR } from "../OrbitViewer";

const tmp:Vector3 = new Vector3();

export class SolarDOMElement {
  label:HTMLElement;
  hovered:boolean = false;

  constructor(public dom:HTMLElement, public ref:SolarElement) {
    this.label = dom.querySelector('.canvas_pointer-text');

    dom.onmouseover = () => {
      ref.focus();
      this.hovered = true;
    }

    dom.onmouseout = () => {
      ref.blur();
      this.hovered = false;
    }

    dom.onclick = () => {
      GLOBALS.nomad.goToPath(`/object/?${ref.name}`);
    }

    // dom.style.setProperty('--depth', '.5');
  }

  set enabled(value:boolean) {
    if(value) this.dom.classList.remove('disabled');
    else this.dom.classList.add('disabled');
  }

  update() {
    GLOBALS.viewer.controls.getNormalizedScreenCoords(this.ref, tmp);
    if(tmp.z < 0) return this.enabled = false;
    this.enabled = true;
    // this.dom.style.transform = `translateX(${tmp.x*100}%) translateY(${tmp.y*100}%)`;
    this.dom.style.left = `${tmp.x*100}%`;
    this.dom.style.top = `${tmp.y*100}%`;

    const depth = this.hovered ? 0 : MathUtils.smoothstep(5000, 100000, tmp.z);

    const zIndex = Math.round(FAR - tmp.z);
    this.dom.style.zIndex = `${zIndex}`;
    // console.log(this.ref.name, zIndex, tmp.z);

    // if(depth > .5 && !this.hovered) this.label.classList.add('disabled');
    // else this.label.classList.remove('disabled');
    this.label.style.opacity = `${1-depth}`;
    // console.log(tmp.z);
    // this.dom.style.setProperty('--depth', `${depth}`);
  }
}