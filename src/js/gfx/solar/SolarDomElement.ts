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
    dom.setAttribute('aria-label', ref.name);

    dom.onmouseover = () => {
      ref.focus();
      this.hovered = true;
    }

    dom.onmouseout = () => {
      ref.blur();
      this.hovered = false;
    }

    dom.onclick = () => {
      dom.blur();
      // this.enabled = false;
      GLOBALS.nomad.goToPath(`/${GLOBALS.lang}/object/`, `?id=${ref.slug}`);
      const sel = GLOBALS.viewer.getSolarElementBySlug(ref.slug);
      GLOBALS.viewer.followSolarElement(sel, !sel.isPlanet || GLOBALS.objectToggle.selectedIndex===0);
    }

    // dom.style.setProperty('--depth', '.5');
  }

  set enabled(value:boolean) {
    if(value) this.dom.classList.remove('disabled');
    else this.dom.classList.add('disabled');
  }

  set hidden(value:boolean) {
    this.dom.setAttribute('aria-hidden', value ? 'true' : 'false');
  }

  update() {
    if(!this.ref.enabled) return this.hidden = true;
    GLOBALS.viewer.controls.getNormalizedScreenCoords(this.ref, tmp);
    if(tmp.z < 0) return this.hidden = true;
    this.hidden = false;
    const x = tmp.x * window.innerWidth;
    const y = tmp.y * window.innerHeight;
    this.dom.style.transform = `translateX(${x}px) translateY(${y}px)`;
    // this.dom.style.left = `${tmp.x*100}%`;
    // this.dom.style.top = `${tmp.y*100}%`;

    const depth = this.hovered ? 0 : MathUtils.smoothstep(5000, 100000, tmp.z);

    const zIndex = this.hovered ? FAR : Math.round(FAR - tmp.z);
    this.dom.style.zIndex = `${zIndex}`;

    // const isBehindSun = 
    
    // if(depth > .5 && !this.hovered) this.label.classList.add('disabled');
    // else this.label.classList.remove('disabled');
    this.label.style.opacity = `${1-depth}`;
    // console.log(tmp.z);
    // this.dom.style.setProperty('--depth', `${depth}`);
  }
}